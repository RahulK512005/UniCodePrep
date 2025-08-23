import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  TrendingUp, 
  Award, 
  BookOpen, 
  Code2, 
  Target,
  Calendar,
  BarChart3,
  GraduationCap,
  Clock,
  Star,
  Trophy,
  Activity,
  MessageSquare,
  CheckCircle,
  Info,
  Building
} from 'lucide-react';
import { User, ProfessorData, authService } from '../utils/auth';

interface ProfessorDashboardProps {
  currentUser: User;
  isDemoMode?: boolean;
}

export default function ProfessorDashboard({ currentUser, isDemoMode = false }: ProfessorDashboardProps) {
  const [professorData] = useState(currentUser.userData as ProfessorData);
  const [studentsByMajor, setStudentsByMajor] = useState<{ [major: string]: any[] }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading professor's students
    const loadStudentData = async () => {
      if (isDemoMode) {
        // Use demo data from userData
        const demoStudents = professorData.students || [];
        const organized: { [major: string]: any[] } = {};
        
        demoStudents.forEach(student => {
          if (!organized[student.major]) {
            organized[student.major] = [];
          }
          organized[student.major].push(student);
        });
        
        setStudentsByMajor(organized);
      } else {
        // In production, fetch from database
        const students = authService.getStudentsByMajor(currentUser.id);
        setStudentsByMajor(students);
      }
      setLoading(false);
    };

    loadStudentData();
  }, [currentUser.id, isDemoMode, professorData.students]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getTotalStudents = () => {
    return Object.values(studentsByMajor).reduce((total, students) => total + students.length, 0);
  };

  const getAverageProgress = () => {
    const allStudents = Object.values(studentsByMajor).flat();
    if (allStudents.length === 0) return 0;
    
    const totalScore = allStudents.reduce((sum, student) => sum + (student.progress?.total_score || 0), 0);
    return Math.round(totalScore / allStudents.length);
  };

  const getTopPerformers = () => {
    const allStudents = Object.values(studentsByMajor).flat();
    return allStudents
      .sort((a, b) => (b.progress?.total_score || 0) - (a.progress?.total_score || 0))
      .slice(0, 5);
  };

  const getDepartmentStats = () => {
    const allStudents = Object.values(studentsByMajor).flat();
    const totalProblems = allStudents.reduce((sum, student) => sum + (student.progress?.problems_solved || 0), 0);
    const totalInterviews = allStudents.reduce((sum, student) => sum + (student.progress?.interviews_completed || 0), 0);
    const activeStudents = allStudents.filter(student => (student.progress?.current_streak || 0) > 0).length;
    
    return {
      totalProblems,
      totalInterviews,
      activeStudents,
      totalStudents: allStudents.length
    };
  };

  const departmentStats = getDepartmentStats();
  const topPerformers = getTopPerformers();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Demo Mode Alert */}
      {isDemoMode && (
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="w-4 h-4 text-blue-600" />
          <AlertDescription className="text-blue-700">
            <span className="font-medium">Demo Mode Active</span> - Professor features like Student Progress are only available after creating a full account. 
            This demo shows sample student data.
          </AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">
          {getGreeting()}, {professorData.title} {professorData.name.split(' ')[0]}!
        </h1>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Building className="w-4 h-4" />
            <span>{professorData.university}</span>
          </div>
          <div className="flex items-center space-x-1">
            <GraduationCap className="w-4 h-4" />
            <span>{professorData.department}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-4 h-4" />
            <span>{getTotalStudents()} Students</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{getTotalStudents()}</p>
                <p className="text-xs text-muted-foreground">Total Students</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Activity className="w-8 h-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{departmentStats.activeStudents}</p>
                <p className="text-xs text-muted-foreground">Active This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-8 h-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{getAverageProgress()}</p>
                <p className="text-xs text-muted-foreground">Avg. Progress Score</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Code2 className="w-8 h-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{departmentStats.totalProblems}</p>
                <p className="text-xs text-muted-foreground">Problems Solved</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Students Overview */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Students by Major</span>
              </CardTitle>
              <CardDescription>Overview of students in your department</CardDescription>
            </CardHeader>
            <CardContent>
              {Object.keys(studentsByMajor).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No students found in your department</p>
                  <p className="text-sm">Students will appear here once they register</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.entries(studentsByMajor).map(([major, students]) => (
                    <div key={major} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">{major}</h3>
                        <Badge variant="secondary">{students.length} students</Badge>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {students.slice(0, 4).map((student, index) => (
                          <div key={index} className="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-700">
                                {student.name.charAt(0)}
                              </span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{student.name}</p>
                              <p className="text-xs text-gray-500">{student.academicYear}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-medium">{student.progress?.total_score || 0} pts</p>
                              <Badge 
                                variant="outline" 
                                className="text-xs"
                              >
                                {student.progress?.rank || 'bronze'}
                              </Badge>
                            </div>
                          </div>
                        ))}
                        {students.length > 4 && (
                          <div className="col-span-2 text-center py-2">
                            <Button variant="ghost" size="sm">
                              View {students.length - 4} more students
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Department Analytics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Department Analytics</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Active Students</span>
                    <span className="text-sm text-gray-600">
                      {departmentStats.activeStudents}/{departmentStats.totalStudents}
                    </span>
                  </div>
                  <Progress 
                    value={departmentStats.totalStudents > 0 ? (departmentStats.activeStudents / departmentStats.totalStudents) * 100 : 0} 
                    className="h-2"
                  />
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Avg. Problems/Student</span>
                    <span className="text-sm text-gray-600">
                      {departmentStats.totalStudents > 0 ? Math.round(departmentStats.totalProblems / departmentStats.totalStudents) : 0}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min((departmentStats.totalStudents > 0 ? departmentStats.totalProblems / departmentStats.totalStudents : 0) * 2, 100)} 
                    className="h-2"
                  />
                </div>
              </div>
              
              <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">{departmentStats.totalProblems}</p>
                  <p className="text-xs text-gray-600">Total Problems</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">{departmentStats.totalInterviews}</p>
                  <p className="text-xs text-gray-600">Interviews Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-orange-600">
                    {departmentStats.totalStudents > 0 ? Math.round((departmentStats.activeStudents / departmentStats.totalStudents) * 100) : 0}%
                  </p>
                  <p className="text-xs text-gray-600">Engagement Rate</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Trophy className="w-5 h-5" />
                <span>Top Performers</span>
              </CardTitle>
              <CardDescription>Highest scoring students this month</CardDescription>
            </CardHeader>
            <CardContent>
              {topPerformers.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-4">
                  No student data available
                </p>
              ) : (
                <div className="space-y-3">
                  {topPerformers.map((student, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        {index === 0 && <Trophy className="w-5 h-5 text-yellow-500" />}
                        {index === 1 && <Award className="w-5 h-5 text-gray-400" />}
                        {index === 2 && <Award className="w-5 h-5 text-orange-600" />}
                        {index > 2 && <span className="w-5 h-5 flex items-center justify-center text-sm font-medium text-gray-500">#{index + 1}</span>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.major}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{student.progress?.total_score || 0}</p>
                        <Badge variant="outline" className="text-xs">
                          {student.progress?.rank || 'bronze'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Activity - Moved up to replace Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Clock className="w-5 h-5" />
                <span>Recent Activity</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex items-start space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div>
                    <p>Emma Davis completed "Two Sum" problem</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Target className="w-4 h-4 text-blue-500 mt-0.5" />
                  <div>
                    <p>Alex Johnson finished technical interview</p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Star className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div>
                    <p>James Wilson reached 5-day streak</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <MessageSquare className="w-4 h-4 text-purple-500 mt-0.5" />
                  <div>
                    <p>Sofia Martinez joined study group</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Award className="w-4 h-4 text-orange-500 mt-0.5" />
                  <div>
                    <p>New student enrolled in CS program</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Class Insights */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BookOpen className="w-5 h-5" />
                <span>Class Insights</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Most Popular Topic</span>
                  </div>
                  <p className="text-sm text-blue-700">Dynamic Programming (65% completion)</p>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Target className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-green-900">Best Performance</span>
                  </div>
                  <p className="text-sm text-green-700">Arrays & Strings (avg: 85%)</p>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <Clock className="w-4 h-4 text-orange-600" />
                    <span className="text-sm font-medium text-orange-900">Needs Attention</span>
                  </div>
                  <p className="text-sm text-orange-700">System Design (avg: 45%)</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sticky Note Annotation */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-yellow-200 border-l-4 border-yellow-500 p-3 rounded shadow-lg max-w-xs">
          <p className="text-xs text-yellow-800 font-medium">
            📝 Design Note: Quick Actions removed; Recent Activity shifted upward. Re-add via code if needed.
          </p>
        </div>
      </div>
    </div>
  );
}