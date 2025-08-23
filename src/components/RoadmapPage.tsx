import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import SearchResultsOverlay from './ui/search-results-overlay';
import { 
  Map, 
  Play, 
  CheckCircle, 
  Clock, 
  Star, 
  Target,
  BookOpen,
  Code2,
  Brain,
  Zap,
  Trophy,
  TrendingUp,
  Youtube
} from 'lucide-react';
import { User } from '../utils/auth';
import { geminiService, SearchResults } from '../utils/geminiService';
import { toast } from 'sonner@2.0.3';

interface RoadmapPageProps {
  currentUser: User;
}

interface Topic {
  id: string;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  progress: number;
  isCompleted: boolean;
  hasVideo: boolean;
  keywords: string[];
}

interface RoadmapSection {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  topics: Topic[];
  prerequisite?: string;
}

export default function RoadmapPage({ currentUser }: RoadmapPageProps) {
  const [selectedSection, setSelectedSection] = useState<string>('algorithms');
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [currentKeyword, setCurrentKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
  const [loadingResults, setLoadingResults] = useState(false);

  // Mock roadmap data
  const roadmapSections: RoadmapSection[] = [
    {
      id: 'algorithms',
      title: 'Intermediate to Advanced Algorithm Mastery',
      description: 'Master complex algorithmic patterns and problem-solving techniques',
      icon: Brain,
      color: 'blue',
      topics: [
        {
          id: 'dp-fundamentals',
          title: 'Dynamic Programming Fundamentals',
          description: 'Learn the core concepts of dynamic programming and memoization',
          difficulty: 'Intermediate',
          duration: '2-3 weeks',
          progress: 75,
          isCompleted: false,
          hasVideo: true,
          keywords: ['Dynamic Programming', 'Memoization', 'DP Patterns']
        },
        {
          id: 'climbing-stairs',
          title: 'Climbing Stairs',
          description: 'Classic DP problem - find number of ways to climb stairs',
          difficulty: 'Beginner',
          duration: '1-2 days',
          progress: 100,
          isCompleted: true,
          hasVideo: true,
          keywords: ['Climbing Stairs', 'LeetCode 70', 'Fibonacci DP']
        },
        {
          id: 'house-robber',
          title: 'House Robber',
          description: 'Optimize robbery strategy with dynamic programming',
          difficulty: 'Intermediate',
          duration: '2-3 days',
          progress: 60,
          isCompleted: false,
          hasVideo: true,
          keywords: ['House Robber', 'LeetCode 198', 'Linear DP']
        },
        {
          id: 'maximum-subarray',
          title: 'Maximum Subarray',
          description: 'Find the contiguous subarray with the largest sum',
          difficulty: 'Intermediate',
          duration: '2-3 days',
          progress: 30,
          isCompleted: false,
          hasVideo: true,
          keywords: ['Maximum Subarray', 'Kadane Algorithm', 'LeetCode 53']
        },
        {
          id: 'neetcode-dp',
          title: 'NeetCode DP Playlist',
          description: 'Complete dynamic programming problem set from NeetCode',
          difficulty: 'Advanced',
          duration: '4-6 weeks',
          progress: 25,
          isCompleted: false,
          hasVideo: true,
          keywords: ['NeetCode', 'Dynamic Programming Playlist', 'DP Problems']
        },
        {
          id: 'dp-patterns',
          title: 'Dynamic Programming Patterns',
          description: 'Master common DP patterns: knapsack, LIS, palindromes',
          difficulty: 'Advanced',
          duration: '3-4 weeks',
          progress: 10,
          isCompleted: false,
          hasVideo: true,
          keywords: ['Dynamic Programming Patterns', 'Knapsack', 'LIS', 'Palindrome DP']
        }
      ]
    },
    {
      id: 'data-structures',
      title: 'Advanced Data Structures',
      description: 'Deep dive into complex data structures and their applications',
      icon: Code2,
      color: 'purple',
      topics: [
        {
          id: 'graph-algorithms',
          title: 'Graph Algorithms',
          description: 'BFS, DFS, Dijkstra, and advanced graph techniques',
          difficulty: 'Advanced',
          duration: '3-4 weeks',
          progress: 40,
          isCompleted: false,
          hasVideo: true,
          keywords: ['Graph Algorithms', 'BFS', 'DFS', 'Dijkstra']
        },
        {
          id: 'tree-traversal',
          title: 'Tree Traversal Mastery',
          description: 'Master all tree traversal techniques and applications',
          difficulty: 'Intermediate',
          duration: '2-3 weeks',
          progress: 85,
          isCompleted: false,
          hasVideo: true,
          keywords: ['Tree Traversal', 'Binary Tree', 'Inorder', 'Preorder', 'Postorder']
        },
        {
          id: 'heap-operations',
          title: 'Heap Operations',
          description: 'Priority queues, heap sort, and heap-based algorithms',
          difficulty: 'Intermediate',
          duration: '1-2 weeks',
          progress: 55,
          isCompleted: false,
          hasVideo: true,
          keywords: ['Heap', 'Priority Queue', 'Heap Sort', 'Min Heap', 'Max Heap']
        }
      ]
    },
    {
      id: 'system-design',
      title: 'System Design Fundamentals',
      description: 'Learn to design scalable and reliable distributed systems',
      icon: Target,
      color: 'green',
      topics: [
        {
          id: 'scalability-basics',
          title: 'Scalability Fundamentals',
          description: 'Horizontal vs vertical scaling, load balancing',
          difficulty: 'Intermediate',
          duration: '1-2 weeks',
          progress: 20,
          isCompleted: false,
          hasVideo: true,
          keywords: ['Scalability', 'Load Balancing', 'Horizontal Scaling', 'System Design']
        },
        {
          id: 'database-design',
          title: 'Database Design Patterns',
          description: 'SQL vs NoSQL, sharding, replication strategies',
          difficulty: 'Advanced',
          duration: '2-3 weeks',
          progress: 0,
          isCompleted: false,
          hasVideo: true,
          keywords: ['Database Design', 'SQL', 'NoSQL', 'Sharding', 'Replication']
        }
      ]
    }
  ];

  const handleTopicClick = async (topic: Topic) => {
    if (!topic.hasVideo || topic.keywords.length === 0) return;

    const keyword = topic.keywords[0]; // Use the first keyword
    setCurrentKeyword(keyword);
    setOverlayOpen(true);
    setLoadingResults(true);
    setSearchResults(null);

    try {
      const results = await geminiService.generateSearchResults(keyword);
      setSearchResults(results);
      toast.success(`Generated search results for "${keyword}"`);
    } catch (error) {
      console.error('Error generating search results:', error);
      toast.error('Failed to generate search results');
    } finally {
      setLoadingResults(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getSectionColor = (color: string) => {
    switch (color) {
      case 'blue':
        return 'from-blue-500 to-blue-600';
      case 'purple':
        return 'from-purple-500 to-purple-600';
      case 'green':
        return 'from-green-500 to-green-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const currentSection = roadmapSections.find(section => section.id === selectedSection);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Learning Roadmap</h1>
              <p className="text-gray-600 dark:text-gray-300">
                Structured learning paths to master coding and system design
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="flex items-center space-x-1">
              <Trophy className="w-4 h-4" />
              <span>Level: Intermediate</span>
            </Badge>
          </div>
        </div>

        {/* Progress Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roadmapSections.map((section) => {
            const totalTopics = section.topics.length;
            const completedTopics = section.topics.filter(t => t.isCompleted).length;
            const overallProgress = totalTopics > 0 ? (completedTopics / totalTopics) * 100 : 0;
            const Icon = section.icon;

            return (
              <Card 
                key={section.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedSection === section.id 
                    ? 'ring-2 ring-blue-500 border-blue-200 dark:border-blue-700' 
                    : 'hover:border-gray-300 dark:hover:border-gray-600'
                }`}
                onClick={() => setSelectedSection(section.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gradient-to-r ${getSectionColor(section.color)} rounded-lg flex items-center justify-center`}>
                      <Icon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-sm">{section.title}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {completedTopics}/{totalTopics} completed
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Progress value={overallProgress} className="h-2" />
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                    {Math.round(overallProgress)}% complete
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Current Section Content */}
      {currentSection && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentSection.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                {currentSection.description}
              </p>
            </div>
            <Badge variant="outline" className="flex items-center space-x-1">
              <BookOpen className="w-4 h-4" />
              <span>{currentSection.topics.length} Topics</span>
            </Badge>
          </div>

          {/* Topics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentSection.topics.map((topic) => (
              <Card 
                key={topic.id} 
                className={`transition-all duration-200 hover:shadow-lg ${
                  topic.hasVideo 
                    ? 'cursor-pointer hover:scale-105 hover:border-blue-300 dark:hover:border-blue-600' 
                    : ''
                }`}
                onClick={() => topic.hasVideo && handleTopicClick(topic)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <CardTitle className="text-lg line-clamp-2 flex items-center space-x-2">
                          <span>{topic.title}</span>
                          {topic.hasVideo && (
                            <div className="w-5 h-5 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center flex-shrink-0">
                              <Play 
                                className="w-3 h-3 text-red-600 dark:text-red-400" 
                                fill="currentColor"
                                style={{ color: '#FF0000' }}
                              />
                            </div>
                          )}
                        </CardTitle>
                      </div>
                      <div className="flex items-center space-x-2 mb-3">
                        <Badge className={getDifficultyColor(topic.difficulty)} variant="secondary">
                          {topic.difficulty}
                        </Badge>
                        <div className="flex items-center space-x-1 text-sm text-gray-600 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>{topic.duration}</span>
                        </div>
                      </div>
                    </div>
                    {topic.isCompleted && (
                      <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <CardDescription className="line-clamp-2">
                    {topic.description}
                  </CardDescription>

                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Progress</span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {topic.progress}%
                      </span>
                    </div>
                    <Progress value={topic.progress} className="h-2" />
                  </div>

                  {/* Keywords */}
                  {topic.keywords.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        Related Topics:
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {topic.keywords.slice(0, 3).map((keyword, index) => (
                          <Badge 
                            key={index} 
                            variant="outline" 
                            className="text-xs px-2 py-1"
                          >
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Action Button */}
                  {topic.hasVideo ? (
                    <Button 
                      className="w-full" 
                      variant={topic.isCompleted ? "outline" : "default"}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleTopicClick(topic);
                      }}
                    >
                      {topic.isCompleted ? (
                        <>
                          <TrendingUp className="w-4 h-4 mr-2" />
                          Review Resources
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Find Resources
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button className="w-full" variant="outline" disabled>
                      <Zap className="w-4 h-4 mr-2" />
                      Coming Soon
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* AI-Powered Learning Note */}
      <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800">
        <Brain className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-700 dark:text-blue-300">
          <span className="font-medium">AI-Powered Learning:</span> Click on any topic with a YouTube icon to get 
          personalized learning resources generated by Gemini AI, including video tutorials and practice materials 
          tailored to your learning level.
        </AlertDescription>
      </Alert>

      {/* Search Results Overlay */}
      <SearchResultsOverlay
        isOpen={overlayOpen}
        onClose={() => setOverlayOpen(false)}
        keyword={currentKeyword}
        results={searchResults}
        loading={loadingResults}
      />
    </div>
  );
}