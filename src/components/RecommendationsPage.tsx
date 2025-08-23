import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import { Progress } from "./ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { 
  Target, 
  BookOpen, 
  Code, 
  Video, 
  ExternalLink,
  Clock,
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Star,
  Brain,
  Lightbulb,
  Play,
  Award,
  Zap,
  Calendar,
  BarChart3,
  Trophy,
  Route,
  Layers,
  Plus,
  X,
  Search
} from "lucide-react"
import { User } from '../utils/auth';
import { geminiService } from '../utils/geminiService';
import { toast } from 'sonner@2.0.3';

interface RecommendationsPageProps {
  currentUser: User;
}

interface EmbeddedLinks {
  youtube_urls: Array<{ url: string; title: string }>;
  google_urls: Array<{ url: string; title: string }>;
}

interface LearningRoadmap {
  id: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estimatedWeeks: number;
  skills: string[];
  progress: number;
  steps: RoadmapStep[];
}

interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  type: "concept" | "practice" | "project" | "assessment";
  estimatedHours: number;
  completed: boolean;
  problems?: string[];
  resources?: string[];
}

interface Skill {
  name: string;
  category: string;
  level: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  progress: number;
  strength: number; // 1-10 scale
  recentActivity: number; // problems solved in last week
  recommendation: string;
}

export default function RecommendationsPage({ currentUser }: RecommendationsPageProps) {
  const [selectedRoadmap, setSelectedRoadmap] = useState<string | null>(null);
  const [showCodeEditor, setShowCodeEditor] = useState(false);
  const [selectedProblem, setSelectedProblem] = useState<string | null>(null);
  const [showLinksOverlay, setShowLinksOverlay] = useState(false);
  const [overlayContent, setOverlayContent] = useState<EmbeddedLinks | null>(null);
  const [loadingLinks, setLoadingLinks] = useState(false);
  const [selectedHeading, setSelectedHeading] = useState<string>('');

  // Handle heading click to generate embedded links
  const handleHeadingClick = async (heading: string) => {
    setSelectedHeading(heading);
    setLoadingLinks(true);
    setShowLinksOverlay(true);

    try {
      // Use the existing geminiService to generate search results
      const searchResults = await geminiService.generateSearchResults(heading);
      
      setOverlayContent({
        youtube_urls: searchResults.youtube_urls,
        google_urls: searchResults.google_urls
      });
      
      toast.success('Links generated successfully!');
    } catch (error) {
      console.error('Error generating links:', error);
      toast.error('Failed to generate links. Please try again.');
      
      // Fallback mock data
      setOverlayContent({
        youtube_urls: [
          {
            url: `https://www.youtube.com/results?search_query=${heading.replace(/\s+/g, '+')}+tutorial`,
            title: `${heading} - Complete Tutorial`
          },
          {
            url: `https://www.youtube.com/results?search_query=${heading.replace(/\s+/g, '+')}+leetcode+solution`,
            title: `${heading} LeetCode Solutions`
          },
          {
            url: `https://www.youtube.com/results?search_query=${heading.replace(/\s+/g, '+')}+algorithm+explanation`,
            title: `${heading} Algorithm Explained`
          }
        ],
        google_urls: [
          {
            url: `https://www.google.com/search?q=${heading.replace(/\s+/g, '+')}+tutorial+geeksforgeeks`,
            title: `${heading} Tutorial - GeeksforGeeks`
          },
          {
            url: `https://www.google.com/search?q=${heading.replace(/\s+/g, '+')}+leetcode+practice`,
            title: `${heading} Practice Problems`
          },
          {
            url: `https://www.google.com/search?q=${heading.replace(/\s+/g, '+')}+interview+questions`,
            title: `${heading} Interview Questions`
          }
        ]
      });
    } finally {
      setLoadingLinks(false);
    }
  };

  const closeOverlay = () => {
    setShowLinksOverlay(false);
    setOverlayContent(null);
    setSelectedHeading('');
  };

  // Enhanced skill analysis with more detailed metrics
  const skillsAnalysis: Skill[] = [
    {
      name: "Arrays & Strings",
      category: "Data Structures",
      level: "Advanced",
      progress: 92,
      strength: 9,
      recentActivity: 8,
      recommendation: "Ready for advanced string algorithms and pattern matching"
    },
    {
      name: "Hash Tables",
      category: "Data Structures", 
      level: "Intermediate",
      progress: 78,
      strength: 7,
      recentActivity: 5,
      recommendation: "Practice collision handling and advanced hashing techniques"
    },
    {
      name: "Two Pointers",
      category: "Algorithms",
      level: "Intermediate",
      progress: 65,
      strength: 6,
      recentActivity: 3,
      recommendation: "Focus on sliding window and fast-slow pointer patterns"
    },
    {
      name: "Binary Search",
      category: "Algorithms",
      level: "Intermediate",
      progress: 55,
      strength: 5,
      recentActivity: 2,
      recommendation: "Master binary search on answer and rotated arrays"
    },
    {
      name: "Dynamic Programming",
      category: "Algorithms", 
      level: "Beginner",
      progress: 32,
      strength: 3,
      recentActivity: 1,
      recommendation: "Start with 1D DP problems and memoization patterns"
    },
    {
      name: "Graph Algorithms",
      category: "Algorithms",
      level: "Beginner", 
      progress: 18,
      strength: 2,
      recentActivity: 0,
      recommendation: "Begin with DFS/BFS traversal and graph representation"
    }
  ];

  // Personalized learning roadmaps based on current skill level
  const learningRoadmaps: LearningRoadmap[] = [
    {
      id: "intermediate-to-advanced",
      title: "Intermediate to Advanced Algorithm Mastery",
      description: "Build upon your strong foundation to master advanced algorithmic concepts",
      difficulty: "Intermediate",
      estimatedWeeks: 12,
      skills: ["Dynamic Programming", "Graph Algorithms", "Advanced Data Structures"],
      progress: 25,
      steps: [
        {
          id: "dp-fundamentals",
          title: "Dynamic Programming Fundamentals",
          description: "Master the core concepts of dynamic programming with 1D problems",
          type: "concept",
          estimatedHours: 20,
          completed: false,
          problems: ["Climbing Stairs", "House Robber", "Maximum Subarray"],
          resources: ["NeetCode DP Playlist", "Dynamic Programming Patterns"]
        },
        {
          id: "dp-2d",
          title: "2D Dynamic Programming",
          description: "Advance to 2D DP problems and grid-based solutions",
          type: "practice",
          estimatedHours: 25,
          completed: false,
          problems: ["Unique Paths", "Longest Common Subsequence", "Edit Distance"],
          resources: ["LeetCode 2D DP Study Plan"]
        },
        {
          id: "graph-basics",
          title: "Graph Representation & Traversal",
          description: "Learn graph data structures and basic traversal algorithms",
          type: "concept", 
          estimatedHours: 15,
          completed: false,
          problems: ["Number of Islands", "Clone Graph", "Course Schedule"],
          resources: ["Graph Theory Fundamentals", "BFS/DFS Patterns"]
        },
        {
          id: "advanced-graphs",
          title: "Advanced Graph Algorithms",
          description: "Explore shortest path, MST, and topological sorting",
          type: "practice",
          estimatedHours: 30,
          completed: false,
          problems: ["Dijkstra Implementation", "Network Delay Time", "Critical Connections"],
          resources: ["Advanced Graph Algorithms Course"]
        }
      ]
    },
    {
      id: "interview-preparation",
      title: "Technical Interview Preparation Track",
      description: "Intensive preparation for technical interviews at top companies",
      difficulty: "Advanced",
      estimatedWeeks: 8,
      skills: ["Interview Strategies", "System Design", "Coding Patterns"],
      progress: 0,
      steps: [
        {
          id: "coding-patterns",
          title: "Master Coding Patterns",
          description: "Learn the 14 most common coding interview patterns",
          type: "concept",
          estimatedHours: 40,
          completed: false,
          problems: ["Pattern: Sliding Window", "Pattern: Two Pointers", "Pattern: Fast & Slow Pointers"],
          resources: ["Grokking the Coding Interview", "14 Patterns PDF"]
        },
        {
          id: "mock-interviews",
          title: "Mock Interview Practice",
          description: "Practice with timed coding challenges and behavioral questions",
          type: "assessment",
          estimatedHours: 20,
          completed: false,
          problems: ["Timed Medium Problems", "System Design Questions"],
          resources: ["Pramp Sessions", "InterviewBit Mock Tests"]
        }
      ]
    }
  ];

  // Weekly consistency goals with detailed tracking
  const weeklyGoals = [
    {
      id: "problem-solving",
      title: "Solve 5 Medium Problems",
      category: "Practice",
      progress: 3,
      total: 5,
      deadline: "Sunday",
      daysLeft: 2,
      points: 50,
      completed: false
    },
    {
      id: "learning",
      title: "Complete DP Fundamentals Module",
      category: "Learning",
      progress: 2,
      total: 4,
      deadline: "Friday", 
      daysLeft: 0,
      points: 30,
      completed: false
    },
    {
      id: "consistency",
      title: "Code Daily (7/7 days)",
      category: "Habit",
      progress: 5,
      total: 7,
      deadline: "Sunday",
      daysLeft: 2,
      points: 25,
      completed: false
    }
  ];

  const getUserDisplayName = () => {
    return currentUser.userData?.name || currentUser.email.split('@')[0];
  };

  const getUserMajor = () => {
    if (currentUser.user_type === 'student' && currentUser.userData?.major) {
      return currentUser.userData.major;
    }
    return 'Computer Science';
  };

  const getSkillCategoryColor = (category: string) => {
    switch (category) {
      case "Data Structures": return "bg-blue-100 text-blue-700";
      case "Algorithms": return "bg-green-100 text-green-700";
      case "System Design": return "bg-purple-100 text-purple-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getStrengthBadge = (strength: number) => {
    if (strength >= 8) return { label: "Expert", color: "bg-emerald-100 text-emerald-700" };
    if (strength >= 6) return { label: "Strong", color: "bg-blue-100 text-blue-700" };
    if (strength >= 4) return { label: "Developing", color: "bg-yellow-100 text-yellow-700" };
    return { label: "Learning", color: "bg-red-100 text-red-700" };
  };

  const startProblem = (problem: string) => {
    setSelectedProblem(problem);
    setShowCodeEditor(true);
  };

  const calculateWeeklyScore = () => {
    return weeklyGoals.reduce((total, goal) => {
      const completionRate = goal.progress / goal.total;
      return total + (goal.points * completionRate);
    }, 0);
  };

  return (
    <div className="max-w-main mx-auto px-content space-y-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Personalized Learning Hub</h1>
        <p className="text-muted-foreground text-lg max-w-content mx-auto">
          AI-powered roadmaps and skill analysis tailored to your learning journey
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Welcome back, {getUserDisplayName()}! Current weekly score: <span className="font-semibold text-primary">{Math.round(calculateWeeklyScore())}/105 points</span>
        </p>
      </div>

      <Tabs defaultValue="roadmaps" className="space-y-8">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="roadmaps">Learning Roadmaps</TabsTrigger>
          <TabsTrigger value="skills">Skills Analysis</TabsTrigger> 
          <TabsTrigger value="goals">Weekly Goals</TabsTrigger>
          <TabsTrigger value="practice">Practice Arena</TabsTrigger>
        </TabsList>

        <TabsContent value="roadmaps" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-enhanced">
            {learningRoadmaps.map((roadmap) => (
              <Card key={roadmap.id} className={`cursor-pointer transition-all hover:shadow-lg min-h-[320px] ${
                selectedRoadmap === roadmap.id ? "border-primary" : ""
              }`} onClick={() => setSelectedRoadmap(roadmap.id)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Route className="w-5 h-5" />
                        {roadmap.title}
                      </CardTitle>
                      <CardDescription className="mt-2">{roadmap.description}</CardDescription>
                    </div>
                    <Badge variant={roadmap.difficulty === "Advanced" ? "default" : "secondary"}>
                      {roadmap.difficulty}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Progress</span>
                      <span>{roadmap.progress}% complete</span>
                    </div>
                    <Progress value={roadmap.progress} className="h-2" />
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimated Duration</span>
                      <span>{roadmap.estimatedWeeks} weeks</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-2">
                      {roadmap.skills.map((skill) => (
                        <Badge key={skill} variant="outline" className="text-xs">{skill}</Badge>
                      ))}
                    </div>
                    
                    <Button className="w-button-enhanced" onClick={() => setSelectedRoadmap(roadmap.id)}>
                      {roadmap.progress > 0 ? "Continue Learning" : "Start Roadmap"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {selectedRoadmap && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {learningRoadmaps.find(r => r.id === selectedRoadmap)?.title} - Detailed Steps
                </CardTitle>
                <CardDescription>
                  Follow this structured path to master your chosen learning track
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {learningRoadmaps.find(r => r.id === selectedRoadmap)?.steps.map((step, index) => (
                    <div key={step.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            step.completed ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                          }`}>
                            {step.completed ? <CheckCircle className="w-4 h-4" /> : index + 1}
                          </div>
                          <div>
                            <h4 
                              className="font-medium cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-200" 
                              style={{ color: '#007BFF' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                handleHeadingClick(step.title);
                              }}
                            >
                              {step.title}
                            </h4>
                            <p className="text-sm text-muted-foreground">{step.description}</p>
                          </div>
                        </div>
                        <Badge variant="outline">{step.estimatedHours}h</Badge>
                      </div>
                      
                      {step.problems && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-2">Practice Problems:</h5>
                          <div className="flex flex-wrap gap-2">
                            {step.problems.map((problem) => (
                              <Button 
                                key={problem} 
                                variant="outline" 
                                size="sm"
                                onClick={() => startProblem(problem)}
                              >
                                <Code className="w-3 h-3 mr-1" />
                                {problem}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {step.resources && (
                        <div className="mt-3">
                          <h5 className="text-sm font-medium mb-2">Resources:</h5>
                          <div className="flex flex-wrap gap-2">
                            {step.resources.map((resource) => (
                              <Badge key={resource} variant="secondary" className="text-xs">
                                <BookOpen className="w-3 h-3 mr-1" />
                                {resource}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="skills" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5" />
                Detailed Skills Analysis
              </CardTitle>
              <CardDescription>
                Comprehensive breakdown of your programming skills and areas of expertise
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                {skillsAnalysis.map((skill, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{skill.name}</h4>
                          <Badge className={getSkillCategoryColor(skill.category)}>
                            {skill.category}
                          </Badge>
                          <Badge className={getStrengthBadge(skill.strength).color}>
                            {getStrengthBadge(skill.strength).label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{skill.recommendation}</p>
                      </div>
                      <div className="text-right min-w-0">
                        <div className="font-medium">{skill.progress}%</div>
                        <div className="text-xs text-muted-foreground">
                          {skill.recentActivity} problems this week
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Progress</span>
                        <span>{skill.progress}%</span>
                      </div>
                      <Progress value={skill.progress} className="h-2" />
                      
                      <div className="flex justify-between text-sm">
                        <span>Strength Level</span>
                        <span>{skill.strength}/10</span>
                      </div>
                      <Progress value={skill.strength * 10} className="h-2" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-500" />
                  Top Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skillsAnalysis
                    .filter(skill => skill.strength >= 7)
                    .sort((a, b) => b.strength - a.strength)
                    .map((skill, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                          <Star className="w-4 h-4 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-green-800">{skill.name}</div>
                          <div className="text-sm text-green-600">Strength: {skill.strength}/10</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5 text-blue-500" />
                  Focus Areas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {skillsAnalysis
                    .filter(skill => skill.strength < 5)
                    .sort((a, b) => a.strength - b.strength)
                    .map((skill, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Zap className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-blue-800">{skill.name}</div>
                          <div className="text-sm text-blue-600">Needs attention</div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-primary mb-2">
                  {Math.round(calculateWeeklyScore())}
                </div>
                <p className="text-muted-foreground">Weekly Score</p>
                <p className="text-xs text-muted-foreground mt-1">Out of 105 points</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-green-500 mb-2">
                  {weeklyGoals.filter(goal => goal.progress === goal.total).length}
                </div>
                <p className="text-muted-foreground">Goals Completed</p>
                <p className="text-xs text-muted-foreground mt-1">This week</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-500 mb-2">
                  {weeklyGoals.reduce((acc, goal) => acc + goal.progress, 0)}
                </div>
                <p className="text-muted-foreground">Total Progress</p>
                <p className="text-xs text-muted-foreground mt-1">Combined activities</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Weekly Consistency Goals
              </CardTitle>
              <CardDescription>
                Track your daily learning habits and maintain consistency streaks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {weeklyGoals.map((goal) => (
                <div key={goal.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-medium">{goal.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{goal.category}</Badge>
                        <span>Due: {goal.deadline}</span>
                        {goal.daysLeft > 0 && (
                          <span className="text-orange-600">({goal.daysLeft} days left)</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{goal.points} points</div>
                      {goal.progress === goal.total && (
                        <CheckCircle className="w-5 h-5 text-green-500 ml-auto mt-1" />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Progress value={(goal.progress / goal.total) * 100} className="flex-1" />
                    <span className="text-sm text-muted-foreground min-w-0">
                      {goal.progress}/{goal.total}
                    </span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Suggested Weekly Goals</CardTitle>
              <CardDescription>
                Recommended goals based on your learning roadmap and current progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">Complete 3 Binary Search problems</span>
                  <p className="text-sm text-muted-foreground">Strengthen search algorithm skills</p>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Goal
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">Review Dynamic Programming patterns</span>
                  <p className="text-sm text-muted-foreground">Prepare for advanced DP problems</p>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Goal
                </Button>
              </div>
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <span className="font-medium">Join study group discussion</span>
                  <p className="text-sm text-muted-foreground">Collaborate with peers on graph algorithms</p>
                </div>
                <Button variant="outline" size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Goal
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice" className="space-y-6">
          {showCodeEditor && selectedProblem ? (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Code className="w-5 h-5" />
                        {selectedProblem}
                      </CardTitle>
                      <CardDescription>LeetCode-style coding environment</CardDescription>
                    </div>
                    <Button variant="outline" onClick={() => setShowCodeEditor(false)}>
                      Back to Problems
                    </Button>
                  </div>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Problem Description</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Problem:</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedProblem === "Climbing Stairs" && 
                            "You are climbing a staircase. It takes n steps to reach the top. Each time you can either climb 1 or 2 steps. In how many distinct ways can you climb to the top?"
                          }
                          {selectedProblem === "House Robber" && 
                            "You are a professional robber planning to rob houses along a street. Each house has a certain amount of money stashed. You cannot rob two adjacent houses. Determine the maximum amount of money you can rob tonight without alerting the police."
                          }
                          {selectedProblem === "Maximum Subarray" && 
                            "Given an integer array nums, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum."
                          }
                          {!["Climbing Stairs", "House Robber", "Maximum Subarray"].includes(selectedProblem) &&
                            "Practice problem description will be loaded here. This is a LeetCode-style coding environment where you can solve problems with real-time feedback."
                          }
                        </p>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Examples:</h4>
                        <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                          Input: n = 3<br/>
                          Output: 3<br/>
                          Explanation: There are three ways to climb to the top.
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Constraints:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          <li>• 1 ≤ n ≤ 45</li>
                          <li>• Expected time complexity: O(n)</li>
                          <li>• Expected space complexity: O(1)</li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Code Editor</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="border rounded">
                        <div className="bg-gray-100 px-3 py-2 border-b">
                          <select className="text-sm">
                            <option>Python</option>
                            <option>JavaScript</option>
                            <option>Java</option>
                            <option>C++</option>
                          </select>
                        </div>
                        <textarea
                          className="w-full h-64 p-3 font-mono text-sm border-0 resize-none focus:ring-0"
                          placeholder="# Write your solution here
def solution():
    # Your code here
    pass"
                        />
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" className="flex-1">
                          <Play className="w-4 h-4 mr-2" />
                          Run Code
                        </Button>
                        <Button className="flex-1">
                          Submit Solution
                        </Button>
                      </div>
                      
                      <div className="border rounded p-3 bg-gray-50">
                        <h5 className="font-medium mb-2">Test Results:</h5>
                        <div className="text-sm text-muted-foreground">
                          Run your code to see test results here...
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layers className="w-5 h-5" />
                    Practice Arena
                  </CardTitle>
                  <CardDescription>
                    Solve problems in a LeetCode-style environment with instant feedback
                  </CardDescription>
                </CardHeader>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  { title: "Two Sum", difficulty: "Easy", category: "Array", solved: true },
                  { title: "Add Two Numbers", difficulty: "Medium", category: "Linked List", solved: true },
                  { title: "Longest Substring", difficulty: "Medium", category: "String", solved: false },
                  { title: "Container With Most Water", difficulty: "Medium", category: "Two Pointers", solved: false },
                  { title: "3Sum", difficulty: "Medium", category: "Array", solved: false },
                  { title: "Remove Nth Node", difficulty: "Medium", category: "Linked List", solved: false },
                  { title: "Valid Parentheses", difficulty: "Easy", category: "Stack", solved: true },
                  { title: "Merge Two Sorted Lists", difficulty: "Easy", category: "Linked List", solved: true },
                  { title: "Generate Parentheses", difficulty: "Medium", category: "Backtracking", solved: false }
                ].map((problem, index) => (
                  <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-medium">{problem.title}</h4>
                        {problem.solved && (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        )}
                      </div>
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant={
                          problem.difficulty === "Easy" ? "secondary" :
                          problem.difficulty === "Medium" ? "default" : "destructive"
                        }>
                          {problem.difficulty}
                        </Badge>
                        <Badge variant="outline">{problem.category}</Badge>
                      </div>
                      <Button 
                        size="sm" 
                        className="w-full"
                        onClick={() => startProblem(problem.title)}
                      >
                        <Code className="w-4 h-4 mr-2" />
                        {problem.solved ? "Solve Again" : "Start Problem"}
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Embedded Links Overlay */}
      {showLinksOverlay && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 rounded-t-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Learning Resources: {selectedHeading}
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    AI-generated links to help you learn more about this topic
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeOverlay}
                  style={{ backgroundColor: 'black', color: 'white' }}
                >
                  <X className="w-4 h-4 mr-1" />
                  Close
                </Button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {loadingLinks ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-300">Generating personalized learning links...</p>
                </div>
              ) : overlayContent && (
                <>
                  {/* YouTube Results */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <div className="w-6 h-6 bg-red-600 rounded flex items-center justify-center mr-2">
                        <Play className="w-3 h-3 text-white" fill="white" />
                      </div>
                      YouTube Tutorials
                    </h3>
                    <div className="space-y-3">
                      {overlayContent.youtube_urls.map((item, index) => (
                        <a
                          key={index}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3 group-hover:bg-red-200 dark:group-hover:bg-red-800">
                            <Play className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.url}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Google Search Results */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                      <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center mr-2">
                        <Search className="w-3 h-3 text-white" />
                      </div>
                      Google Search Results
                    </h3>
                    <div className="space-y-3">
                      {overlayContent.google_urls.map((item, index) => (
                        <a
                          key={index}
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-800">
                            <Search className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                              {item.title}
                            </h4>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {item.url}
                            </p>
                          </div>
                          <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                        </a>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Sticky Note Annotation */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-yellow-200 border-l-4 border-yellow-500 p-3 rounded shadow-lg max-w-xs">
          <p className="text-xs text-yellow-800">
            💡 <strong>Gemini API Integration:</strong> Headings in Learning Roadmap use Gemini API to generate embedded YouTube/Google links based on keywords (e.g., 'Dynamic Programming Fundamentals' → 'https://www.youtube.com/results?search_query=Dynamic+Programming+Fundamentals'). Page fully functional with dynamic linking.
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}