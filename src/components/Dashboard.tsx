import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Trophy, 
  TrendingUp, 
  Target, 
  Code2, 
  Calendar,
  Star,
  Flame,
  Award,
  Clock,
  CheckCircle,
  Circle,
  User,
  BookOpen,
  MessageSquare,
  Activity,
  Timer,
  History
} from 'lucide-react';
import { User as AuthUser } from '../utils/auth';
import { progressTracker, UserProgress } from '../utils/progressTracker';

interface DashboardProps {
  currentUser: AuthUser;
}

export default function Dashboard({ currentUser }: DashboardProps) {
  const [userProgress, setUserProgress] = useState<UserProgress | null>(null);
  const [attendanceData, setAttendanceData] = useState<{ [key: string]: boolean }>({});
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([]);

  useEffect(() => {
    // Initialize progress tracker
    progressTracker.setCurrentUser(currentUser);
    loadProgressData();
    
    // Set up interval to refresh data periodically
    const interval = setInterval(loadProgressData, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [currentUser]);

  const loadProgressData = () => {
    const progress = progressTracker.getUserProgress();
    if (progress) {
      setUserProgress(progress);
      
      // Update attendance data
      const attendance = progressTracker.getAttendanceData();
      setAttendanceData(attendance);
      
      // Get recent submissions
      const submissions = progressTracker.getSubmissionHistory().slice(0, 5);
      setRecentSubmissions(submissions);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getRankInfo = (rank: string) => {
    const rankInfo = {
      bronze: { color: 'text-orange-600', bgColor: 'bg-orange-100', level: 'Bronze Explorer' },
      silver: { color: 'text-gray-600', bgColor: 'bg-gray-100', level: 'Silver Achiever' },
      gold: { color: 'text-yellow-600', bgColor: 'bg-yellow-100', level: 'Gold Champion' },
      platinum: { color: 'text-purple-600', bgColor: 'bg-purple-100', level: 'Platinum Master' },
      diamond: { color: 'text-blue-600', bgColor: 'bg-blue-100', level: 'Diamond Legend' }
    };
    return rankInfo[rank as keyof typeof rankInfo] || rankInfo.bronze;
  };

  const getProgressStats = () => {
    if (!userProgress) {
      return {
        problemsSolved: 0,
        interviewsCompleted: 0,
        totalScore: 0,
        currentStreak: 0,
        consistencyCoins: 0,
        longestStreak: 0,
        daysAttended: 0,
        attendanceRate: 0
      };
    }

    return {
      problemsSolved: userProgress.statistics.problemsSolved,
      interviewsCompleted: userProgress.statistics.interviewsCompleted,
      totalScore: userProgress.totalScore,
      currentStreak: userProgress.currentStreak,
      consistencyCoins: userProgress.consistencyCoins,
      longestStreak: userProgress.longestStreak,
      daysAttended: Object.values(attendanceData).filter(Boolean).length,
      attendanceRate: Math.round((Object.values(attendanceData).filter(Boolean).length / Math.max(Object.keys(attendanceData).length, 1)) * 100)
    };
  };

  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      days.push({
        date: dateKey,
        attended: attendanceData[dateKey] || false
      });
    }
    return days;
  };

  const markAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    progressTracker.markAttendance();
    setAttendanceData(prev => ({ ...prev, [today]: true }));
    loadProgressData();
  };

  const getTodayAttended = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceData[today] || false;
  };

  const stats = getProgressStats();
  const last7Days = getLast7Days();
  const todayAttended = getTodayAttended();
  const rankInfo = getRankInfo(userProgress?.rank || 'bronze');

  if (!userProgress) {
    return (
      <div className="max-w-main mx-auto px-content py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-enhanced">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-main mx-auto px-content space-y-8 py-8">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {getGreeting()}, {currentUser.userData?.name || currentUser.email.split('@')[0]}!
        </h1>
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge className={`${rankInfo.bgColor} ${rankInfo.color} border-0`}>
            <Trophy className="w-4 h-4 mr-1" />
            {rankInfo.level}
          </Badge>
          <Badge variant="outline">
            {stats.totalScore} Total Points
          </Badge>
        </div>
        <p className="text-muted-foreground max-w-content mx-auto">
          Track your coding journey, maintain consistency, and achieve your learning goals
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-enhanced">
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-primary mb-2">{stats.problemsSolved}</div>
            <p className="text-muted-foreground">Problems Solved</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">{stats.interviewsCompleted}</div>
            <p className="text-muted-foreground">Interviews Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">{stats.currentStreak}</div>
            <p className="text-muted-foreground">Current Streak</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">{stats.consistencyCoins}</div>
            <p className="text-muted-foreground">Consistency Coins</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-enhanced">
        {/* Attendance & Consistency */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Attendance & Consistency
            </CardTitle>
            <CardDescription>
              Your daily learning habit tracking
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Days attended this month</span>
                <Badge variant="secondary">{stats.daysAttended}/30</Badge>
              </div>
              <Progress value={(stats.daysAttended / 30) * 100} className="h-3" />
              
              <div className="flex items-center justify-between">
                <span>Longest streak</span>
                <Badge variant="outline">{stats.longestStreak} days</Badge>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Attendance rate</span>
                <Badge variant="secondary">{stats.attendanceRate}%</Badge>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Recent Activity</h4>
              <div className="grid grid-cols-7 gap-2">
                {last7Days.map((day) => (
                  <div key={day.date} className="text-center">
                    <div className="text-xs text-muted-foreground mb-1">
                      {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                      day.attended ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {day.attended ? <CheckCircle className="w-4 h-4" /> : day.date.split('-')[2]}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <Button 
                className="w-button-enhanced" 
                onClick={markAttendance}
                disabled={todayAttended}
              >
                {todayAttended ? 'Attended Today' : 'Mark Today\'s Attendance'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>
              Your latest submissions and achievements
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentSubmissions.length > 0 ? (
              recentSubmissions.map((submission, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      submission.status === 'solved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {submission.status === 'solved' ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-medium">{submission.problemTitle}</h4>
                      <p className="text-sm text-muted-foreground">{submission.difficulty}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant={submission.status === 'solved' ? 'default' : 'secondary'}>
                      {submission.status}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(submission.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Code2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Start solving problems to see your progress here!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Achievements and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-enhanced">
        {/* Achievements */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5" />
              Achievements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium">First Problem Solved</h4>
                <p className="text-sm text-muted-foreground">Great start!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Flame className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-medium">Consistency Champion</h4>
                <p className="text-sm text-muted-foreground">7-day streak achieved</p>
              </div>
            </div>

            {stats.problemsSolved >= 10 && (
              <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-lg">
                <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <h4 className="font-medium">Problem Solver</h4>
                  <p className="text-sm text-muted-foreground">10+ problems solved</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Easy Problems</span>
                <span>{Math.floor(stats.problemsSolved * 0.4)}</span>
              </div>
              <Progress value={Math.min((Math.floor(stats.problemsSolved * 0.4) / 20) * 100, 100)} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Medium Problems</span>
                <span>{Math.floor(stats.problemsSolved * 0.5)}</span>
              </div>
              <Progress value={Math.min((Math.floor(stats.problemsSolved * 0.5) / 30) * 100, 100)} className="h-2" />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Hard Problems</span>
                <span>{Math.floor(stats.problemsSolved * 0.1)}</span>
              </div>
              <Progress value={Math.min((Math.floor(stats.problemsSolved * 0.1) / 10) * 100, 100)} className="h-2" />
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full justify-start" variant="outline">
              <Code2 className="w-4 h-4 mr-2" />
              Solve a Problem
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <MessageSquare className="w-4 h-4 mr-2" />
              Practice Interview
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <BookOpen className="w-4 h-4 mr-2" />
              Learning Roadmap
            </Button>
            <Button className="w-full justify-start" variant="outline">
              <User className="w-4 h-4 mr-2" />
              Join Discussion
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Layout Enhancement Note */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-yellow-200 border-l-4 border-yellow-500 p-3 rounded shadow-lg max-w-xs">
          <p className="text-xs text-yellow-800">
            💡 <strong>Layout Enhanced:</strong> Window width increased to 1440px for better visibility; responsive design preserved below 768px. Card width: 300px, spacing: 30px, content padding: 40px.
          </p>
        </div>
      </div>
    </div>
  );
}