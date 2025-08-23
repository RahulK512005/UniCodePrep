import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Textarea } from './ui/textarea';
import { Alert, AlertDescription } from './ui/alert';
import { Progress } from './ui/progress';
import { 
  Code2, 
  Play, 
  Send, 
  Clock, 
  CheckCircle, 
  Circle, 
  Trophy,
  Target,
  Timer,
  MemoryStick,
  History,
  TrendingUp,
  Filter,
  Search
} from 'lucide-react';
import { User } from '../utils/auth';
import { progressTracker, ProblemProgress, ProblemSubmission, TestResult } from '../utils/progressTracker';
import { Input } from './ui/input';

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  testCases: Array<{
    input: string;
    expectedOutput: string;
  }>;
  hints?: string[];
}

interface ProblemsPageProps {
  currentUser: User;
}

const sampleProblems: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
      { input: '[3,3]\n6', expectedOutput: '[0,1]' }
    ]
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    difficulty: 'Easy',
    category: 'Strings',
    description: 'Write a function that reverses a string. The input string is given as an array of characters s.',
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^5',
      's[i] is a printable ascii character.'
    ],
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]' },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]' }
    ]
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    description: 'Given a string s containing just the characters \'(\', \')\', \'{\', \'}\', \'[\' and \']\', determine if the input string is valid.',
    examples: [
      {
        input: 's = "()"',
        output: 'true'
      },
      {
        input: 's = "()[]{}"',
        output: 'true'
      },
      {
        input: 's = "(]"',
        output: 'false'
      }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      's consists of parentheses only \'()[]{}\''
    ],
    testCases: [
      { input: '()', expectedOutput: 'true' },
      { input: '()[]{} ', expectedOutput: 'true' },
      { input: '(]', expectedOutput: 'false' },
      { input: '([)]', expectedOutput: 'false' }
    ]
  },
  {
    id: 'merge-intervals',
    title: 'Merge Intervals',
    difficulty: 'Medium',
    category: 'Arrays',
    description: 'Given an array of intervals where intervals[i] = [start_i, end_i], merge all overlapping intervals.',
    examples: [
      {
        input: 'intervals = [[1,3],[2,6],[8,10],[15,18]]',
        output: '[[1,6],[8,10],[15,18]]',
        explanation: 'Since intervals [1,3] and [2,6] overlaps, merge them into [1,6].'
      }
    ],
    constraints: [
      '1 <= intervals.length <= 10^4',
      'intervals[i].length == 2',
      '0 <= start_i <= end_i <= 10^4'
    ],
    testCases: [
      { input: '[[1,3],[2,6],[8,10],[15,18]]', expectedOutput: '[[1,6],[8,10],[15,18]]' },
      { input: '[[1,4],[4,5]]', expectedOutput: '[[1,5]]' }
    ]
  },
  {
    id: 'longest-palindrome',
    title: 'Longest Palindromic Substring',
    difficulty: 'Medium',
    category: 'Strings',
    description: 'Given a string s, return the longest palindromic substring in s.',
    examples: [
      {
        input: 's = "babad"',
        output: '"bab"',
        explanation: '"aba" is also a valid answer.'
      }
    ],
    constraints: [
      '1 <= s.length <= 1000',
      's consist of only digits and English letters.'
    ],
    testCases: [
      { input: 'babad', expectedOutput: 'bab' },
      { input: 'cbbd', expectedOutput: 'bb' }
    ]
  },
  {
    id: 'word-ladder',
    title: 'Word Ladder',
    difficulty: 'Hard',
    category: 'Graph',
    description: 'A transformation sequence from word beginWord to word endWord using a dictionary wordList is a sequence of words beginWord -> s1 -> s2 -> ... -> sk such that every adjacent pair of words differs by a single letter.',
    examples: [
      {
        input: 'beginWord = "hit", endWord = "cog", wordList = ["hot","dot","dog","lot","log","cog"]',
        output: '5',
        explanation: 'One shortest transformation sequence is "hit" -> "hot" -> "dot" -> "dog" -> "cog", which is 5 words long.'
      }
    ],
    constraints: [
      '1 <= beginWord.length <= 10',
      'endWord.length == beginWord.length',
      '1 <= wordList.length <= 5000',
      'wordList[i].length == beginWord.length'
    ],
    testCases: [
      { input: 'hit\ncog\n["hot","dot","dog","lot","log","cog"]', expectedOutput: '5' },
      { input: 'hit\ncog\n["hot","dot","dog","lot","log"]', expectedOutput: '0' }
    ]
  }
];

export default function ProblemsPage({ currentUser }: ProblemsPageProps) {
  const [selectedProblem, setSelectedProblem] = useState<Problem | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState('python');
  const [isRunning, setIsRunning] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [showSubmissionHistory, setShowSubmissionHistory] = useState(false);
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [problemsProgress, setProblemsProgress] = useState<{[key: string]: ProblemProgress}>({});

  useEffect(() => {
    // Initialize progress tracker with current user
    progressTracker.setCurrentUser(currentUser);
    loadProblemsProgress();
  }, [currentUser]);

  const loadProblemsProgress = () => {
    const userProgress = progressTracker.getUserProgress();
    if (userProgress) {
      setProblemsProgress(userProgress.problemsProgress);
    }
  };

  const getProblemStatus = (problemId: string): 'not_started' | 'attempted' | 'solved' => {
    return problemsProgress[problemId]?.status || 'not_started';
  };

  const getStatusIcon = (status: 'not_started' | 'attempted' | 'solved') => {
    switch (status) {
      case 'solved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'attempted':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'not_started':
      default:
        return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: 'not_started' | 'attempted' | 'solved') => {
    switch (status) {
      case 'solved':
        return 'border-green-200 bg-green-50';
      case 'attempted':
        return 'border-orange-200 bg-orange-50';
      case 'not_started':
      default:
        return 'border-gray-200 bg-white';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy':
        return 'bg-green-100 text-green-800';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'Hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredProblems = sampleProblems.filter(problem => {
    const matchesDifficulty = selectedDifficulty === 'all' || problem.difficulty === selectedDifficulty;
    const matchesCategory = selectedCategory === 'all' || problem.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      problem.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesDifficulty && matchesCategory && matchesSearch;
  });

  const categories = [...new Set(sampleProblems.map(p => p.category))];

  const runCode = async () => {
    if (!selectedProblem || !code.trim()) return;

    setIsRunning(true);
    setShowResults(false);

    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const results = progressTracker.executeCode(code, language, selectedProblem.testCases);
      setTestResults(results);
      setShowResults(true);
    } catch (error) {
      console.error('Error running code:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const submitCode = async () => {
    if (!selectedProblem || !code.trim()) return;

    setIsSubmitting(true);

    try {
      // Run the code first if not already run
      let results = testResults;
      if (testResults.length === 0) {
        results = progressTracker.executeCode(code, language, selectedProblem.testCases);
        setTestResults(results);
      }

      // Submit the solution
      const submission = progressTracker.submitProblemSolution(
        selectedProblem.id,
        code,
        language,
        results
      );

      // Refresh problems progress
      loadProblemsProgress();
      
      setShowResults(true);

      // Show success message if all tests passed
      if (submission.status === 'passed') {
        // You could add a toast notification here
        console.log('Congratulations! All test cases passed!');
      }
    } catch (error) {
      console.error('Error submitting code:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openProblem = (problem: Problem) => {
    setSelectedProblem(problem);
    setCode('');
    setTestResults([]);
    setShowResults(false);
    
    // Load previous submission if available
    const problemProgress = progressTracker.getProblemProgress(problem.id);
    if (problemProgress.bestSubmission) {
      setCode(problemProgress.bestSubmission.code);
      setLanguage(problemProgress.bestSubmission.language);
    }
  };

  const getSubmissionHistory = () => {
    if (!selectedProblem) return [];
    return progressTracker.getSubmissionHistory(selectedProblem.id);
  };

  const getOverallStats = () => {
    const userProgress = progressTracker.getUserProgress();
    if (!userProgress) return { solved: 0, attempted: 0, total: sampleProblems.length };

    const solved = userProgress.statistics.problemsSolved;
    const attempted = userProgress.statistics.problemsAttempted;
    
    return { solved, attempted, total: sampleProblems.length };
  };

  const stats = getOverallStats();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header with Stats */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Coding Problems</h1>
            <p className="text-gray-600 mt-1">Practice with curated programming challenges</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.solved}</div>
              <div className="text-xs text-gray-500">Solved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.attempted}</div>
              <div className="text-xs text-gray-500">Attempted</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{stats.total}</div>
              <div className="text-xs text-gray-500">Total</div>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Progress</span>
            <span>{stats.solved}/{stats.total} problems solved</span>
          </div>
          <Progress value={(stats.solved / stats.total) * 100} className="h-3" />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search problems..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="Easy">Easy</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Hard">Hard</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Problems Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProblems.map((problem) => {
          const status = getProblemStatus(problem.id);
          return (
            <Card 
              key={problem.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${getStatusColor(status)}`}
              onClick={() => openProblem(problem)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(status)}
                    <CardTitle className="text-lg">{problem.title}</CardTitle>
                  </div>
                  <Badge className={getDifficultyColor(problem.difficulty)}>
                    {problem.difficulty}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-xs">
                    {problem.category}
                  </Badge>
                  {status === 'solved' && (
                    <Badge className="bg-green-100 text-green-700 text-xs">
                      <Trophy className="w-3 h-3 mr-1" />
                      Solved
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="line-clamp-3">
                  {problem.description}
                </CardDescription>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Problem Solving Dialog */}
      <Dialog open={!!selectedProblem} onOpenChange={() => setSelectedProblem(null)}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {selectedProblem && getStatusIcon(getProblemStatus(selectedProblem.id))}
                <DialogTitle className="text-xl">{selectedProblem?.title}</DialogTitle>
                {selectedProblem && (
                  <Badge className={getDifficultyColor(selectedProblem.difficulty)}>
                    {selectedProblem.difficulty}
                  </Badge>
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSubmissionHistory(true)}
                className="text-xs"
              >
                <History className="w-4 h-4 mr-1" />
                History
              </Button>
            </div>
            <DialogDescription>
              Solve this {selectedProblem?.difficulty.toLowerCase()} level {selectedProblem?.category.toLowerCase()} problem. 
              Write your solution and test it against the provided test cases.
            </DialogDescription>
          </DialogHeader>

          {selectedProblem && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
              {/* Problem Description */}
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-700">{selectedProblem.description}</p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Examples</h3>
                  <div className="space-y-3">
                    {selectedProblem.examples.map((example, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <div className="space-y-1">
                          <div><strong>Input:</strong> {example.input}</div>
                          <div><strong>Output:</strong> {example.output}</div>
                          {example.explanation && (
                            <div><strong>Explanation:</strong> {example.explanation}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Constraints</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700">
                    {selectedProblem.constraints.map((constraint, index) => (
                      <li key={index}>{constraint}</li>
                    ))}
                  </ul>
                </div>

                {/* Test Results */}
                {showResults && testResults.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Test Results</h3>
                    <div className="space-y-2">
                      {testResults.map((result, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            result.passed 
                              ? 'bg-green-50 border-green-200' 
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">Test Case {index + 1}</span>
                            <div className="flex items-center space-x-2">
                              {result.passed ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <Circle className="w-4 h-4 text-red-500" />
                              )}
                              <span className="text-xs text-gray-500">
                                {result.executionTime.toFixed(2)}ms
                              </span>
                            </div>
                          </div>
                          <div className="text-sm space-y-1">
                            <div><strong>Input:</strong> {result.input}</div>
                            <div><strong>Expected:</strong> {result.expectedOutput}</div>
                            <div><strong>Actual:</strong> {result.actualOutput}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Code Editor */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Solution</h3>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="python">Python</SelectItem>
                      <SelectItem value="javascript">JavaScript</SelectItem>
                      <SelectItem value="java">Java</SelectItem>
                      <SelectItem value="cpp">C++</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Textarea
                  placeholder="Write your solution here..."
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="font-mono text-sm min-h-80"
                />

                <div className="flex space-x-2">
                  <Button
                    onClick={runCode}
                    disabled={isRunning || !code.trim()}
                    className="flex-1"
                    variant="outline"
                  >
                    {isRunning ? (
                      <>
                        <Timer className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Code
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={submitCode}
                    disabled={isSubmitting || !code.trim()}
                    className="flex-1"
                  >
                    {isSubmitting ? (
                      <>
                        <Timer className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 mr-2" />
                        Submit
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Submission History Dialog */}
      <Dialog open={showSubmissionHistory} onOpenChange={setShowSubmissionHistory}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Submission History</DialogTitle>
            <DialogDescription>
              View your previous submissions for {selectedProblem?.title || 'this problem'}.
              Review your code, test results, and track your progress over time.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 mt-4">
            {getSubmissionHistory().map((submission, index) => (
              <Card key={index}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {submission.status === 'passed' ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <Circle className="w-5 h-5 text-red-500" />
                      )}
                      <div>
                        <Badge className={submission.status === 'passed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {submission.status === 'passed' ? 'Accepted' : 'Wrong Answer'}
                        </Badge>
                        <div className="text-sm text-gray-500 mt-1">
                          {submission.submittedAt.toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <Timer className="w-4 h-4" />
                        <span>{submission.executionTime?.toFixed(2)}ms</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MemoryStick className="w-4 h-4" />
                        <span>{submission.memoryUsed?.toFixed(1)}MB</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <pre className="text-sm overflow-x-auto">
                      <code>{submission.code}</code>
                    </pre>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {getSubmissionHistory().length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No submissions yet</p>
                <p className="text-sm">Start solving problems to see your submission history</p>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}