import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Users, 
  Search,
  Filter,
  Eye,
  TrendingUp,
  Code2,
  Target,
  Award,
  Calendar,
  Mail,
  GraduationCap,
  Star,
  Trophy,
  BarChart3,
  Activity,
  Clock,
  CheckCircle,
  Info,
  X
} from 'lucide-react';
import { User, ProfessorData, StudentData, authService } from '../utils/auth';

interface StudentProgressProps {
  currentUser: User;
  isDemoMode?: boolean;
}

interface StudentCardProps {
  student: StudentData;
  onViewDashboard: (student: StudentData) => void;
}

function StudentCard({ student, onViewDashboard }: StudentCardProps) {
  const getPlacementReadiness = (progress: any) => {
    const score = progress?.total_score || 0;
    if (score >= 2000) return { percentage: 85, level: 'High' };
    if (score >= 1000) return { percentage: 65, level: 'Medium' };
    if (score >= 500) return { percentage: 45, level: 'Basic' };
    return { percentage: 25, level: 'Beginner' };
  };

  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'diamond': return 'bg-blue-100 text-blue-700';
      case 'platinum': return 'bg-gray-100 text-gray-700';
      case 'gold': return 'bg-yellow-100 text-yellow-700';
      case 'silver': return 'bg-gray-100 text-gray-600';
      default: return 'bg-orange-100 text-orange-700';
    }
  };

  const placementReadiness = getPlacementReadiness(student.progress);

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-lg font-semibold text-blue-700">
                {student.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{student.name}</h3>
              <p className="text-sm text-gray-600">{student.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline" className="text-xs">
                  {student.academicYear}
                </Badge>
                <Badge className={`text-xs ${getRankColor(student.progress?.rank || 'bronze')}`}>
                  {student.progress?.rank || 'bronze'}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => onViewDashboard(student)}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center space-x-2">
              <Code2 className="w-4 h-4 text-blue-500" />
              <span>Problems: {student.progress?.problems_solved || 0}/100</span>
            </div>
            <div className="flex items-center space-x-2">
              <Target className="w-4 h-4 text-green-500" />
              <span>Interviews: {student.progress?.interviews_completed || 0}</span>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Study Streak</span>
              <span className="font-medium">{student.progress?.current_streak || 0} days</span>
            </div>
            <Progress 
              value={Math.min((student.progress?.current_streak || 0) * 3.33, 100)} 
              className="h-2"
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Placement Readiness</span>
              <span className="font-medium">{placementReadiness.percentage}%</span>
            </div>
            <Progress value={placementReadiness.percentage} className="h-2" />
            <p className="text-xs text-gray-500">{placementReadiness.level} level</p>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center space-x-1">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">{student.progress?.consistency_coins || 0} coins</span>
            </div>
            <Button
              size="sm"
              onClick={() => onViewDashboard(student)}
              className="text-xs"
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SharedStudentDashboard({ student, onClose }: { student: StudentData; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Student Dashboard - View Only</h2>
              <p className="text-sm text-gray-600">Professor Access for {student.name}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-5 h-5" />
            </Button>
          </div>
          <Alert className="mt-3">
            <Info className="w-4 h-4" />
            <AlertDescription>
              This is a read-only view of the student's dashboard. All editing features are disabled for privacy.
            </AlertDescription>
          </Alert>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Student Info */}
          <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-blue-700">
                {student.name.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="text-lg font-semibold">{student.name}</h3>
              <p className="text-gray-600">{student.email}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge>{student.academicYear}</Badge>
                <Badge variant="outline">{student.major}</Badge>
                <Badge className="capitalize">{student.progress?.rank || 'bronze'}</Badge>
              </div>
            </div>
          </div>

          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Code2 className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{student.progress?.problems_solved || 0}</p>
                    <p className="text-xs text-muted-foreground">Problems Solved</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Target className="w-8 h-8 text-green-500" />
                  <div>
                    <p className="text-2xl font-bold">{student.progress?.interviews_completed || 0}</p>
                    <p className="text-xs text-muted-foreground">Interviews</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Activity className="w-8 h-8 text-orange-500" />
                  <div>
                    <p className="text-2xl font-bold">{student.progress?.current_streak || 0}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center space-x-2">
                  <Trophy className="w-8 h-8 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold">{student.progress?.consistency_coins || 0}</p>
                    <p className="text-xs text-muted-foreground">Coins Earned</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Chart Placeholder */}
          <Card>
            <CardHeader>
              <CardTitle>Progress Overview</CardTitle>
              <CardDescription>Student's learning journey and achievements</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Overall Progress</span>
                    <span>{Math.min(((student.progress?.total_score || 0) / 50), 100)}%</span>
                  </div>
                  <Progress value={Math.min(((student.progress?.total_score || 0) / 50), 100)} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{student.progress?.longest_streak || 0}</p>
                    <p className="text-sm text-gray-600">Longest Streak</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{student.progress?.total_score || 0}</p>
                    <p className="text-sm text-gray-600">Total Score</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <CheckCircle className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Completed "Binary Search" problem</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <Target className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium">Finished technical interview simulation</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium">Achieved 7-day study streak</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function StudentProgress({ currentUser, isDemoMode = false }: StudentProgressProps) {
  const [professorData] = useState(currentUser.userData as ProfessorData);
  const [studentsByMajor, setStudentsByMajor] = useState<{ [major: string]: StudentData[] }>({});
  const [selectedStudent, setSelectedStudent] = useState<StudentData | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUniversity, setSelectedUniversity] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStudentData = async () => {
      if (isDemoMode) {
        // Use demo data
        const demoStudents = professorData.students || [];
        const organized: { [major: string]: StudentData[] } = {};
        
        demoStudents.forEach(student => {
          if (!organized[student.major]) {
            organized[student.major] = [];
          }
          organized[student.major].push(student);
        });
        
        setStudentsByMajor(organized);
      } else {
        // Fetch from database
        const students = authService.getStudentsByMajor(currentUser.id);
        setStudentsByMajor(students);
      }
      setLoading(false);
    };

    loadStudentData();
  }, [currentUser.id, isDemoMode, professorData.students]);

  const filteredStudents = (students: StudentData[]) => {
    return students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesUniversity = selectedUniversity === 'all' || student.university === selectedUniversity;
      return matchesSearch && matchesUniversity;
    });
  };

  const getUniversities = () => {
    const universities = new Set<string>();
    Object.values(studentsByMajor).flat().forEach(student => {
      universities.add(student.university);
    });
    return Array.from(universities);
  };

  const getTotalStudents = () => {
    return Object.values(studentsByMajor).reduce((total, students) => total + students.length, 0);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Student Progress Overview</h1>
          <p className="text-gray-600 mt-1">
            Monitor and track your students' learning progress across different majors
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search students by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <Select value={selectedUniversity} onValueChange={setSelectedUniversity}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by university" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Universities</SelectItem>
              {getUniversities().map(university => (
                <SelectItem key={university} value={university}>
                  {university}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
                <GraduationCap className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{Object.keys(studentsByMajor).length}</p>
                  <p className="text-xs text-muted-foreground">Majors</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <Activity className="w-8 h-8 text-orange-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {Object.values(studentsByMajor).flat().filter(s => (s.progress?.current_streak || 0) > 0).length}
                  </p>
                  <p className="text-xs text-muted-foreground">Active Students</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-2">
                <BarChart3 className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">
                    {Math.round(Object.values(studentsByMajor).flat().reduce((sum, s) => sum + (s.progress?.total_score || 0), 0) / getTotalStudents() || 0)}
                  </p>
                  <p className="text-xs text-muted-foreground">Avg Score</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Student Tabs by Major */}
      {Object.keys(studentsByMajor).length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
            <p className="text-gray-600">
              Students will appear here once they register under majors associated with your department.
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg text-left max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Access Logic:</strong> You can view students whose majors are associated with your department ({professorData.department}) 
                and from your university ({professorData.university}).
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Tabs defaultValue={Object.keys(studentsByMajor)[0]} className="space-y-6">
          <TabsList className="grid w-full grid-cols-1 md:grid-cols-4 gap-2">
            {Object.keys(studentsByMajor).map(major => (
              <TabsTrigger key={major} value={major} className="text-sm">
                {major}
                <Badge variant="secondary" className="ml-2">
                  {filteredStudents(studentsByMajor[major]).length}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>

          {Object.entries(studentsByMajor).map(([major, students]) => (
            <TabsContent key={major} value={major}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{major} Students</h2>
                  <Badge variant="outline">
                    {filteredStudents(students).length} of {students.length} students
                  </Badge>
                </div>

                {filteredStudents(students).length === 0 ? (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Search className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-gray-600">No students match your current filters</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredStudents(students).map((student, index) => (
                      <StudentCard
                        key={index}
                        student={student}
                        onViewDashboard={setSelectedStudent}
                      />
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* Student Dashboard Modal */}
      {selectedStudent && (
        <SharedStudentDashboard
          student={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </div>
  );
}