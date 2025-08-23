import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Checkbox } from './ui/checkbox';
import { ArrowLeft, AlertCircle, Code2, GraduationCap, Users, Database, Link as LinkIcon, Loader2, Eye, EyeOff, Mail } from 'lucide-react';
import { authService, User } from '../utils/auth';

interface AuthProps {
  onBack: () => void;
  onAuthSuccess: (user: User) => void;
  onForgotPassword?: () => void;
}

export default function Auth({ onBack, onAuthSuccess, onForgotPassword }: AuthProps) {
  const [userType, setUserType] = useState<'student' | 'professor'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberPassword, setRememberPassword] = useState(true); // Default to true

  // Form data
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    university: '',
    major: '',
    academicYear: '',
    department: '',
    title: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) setError('');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const user = await authService.login(formData.email, formData.password, userType);
      
      // Store password reminder preference
      authService.setRememberPassword(rememberPassword, formData.email);
      
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let user: User;
      
      if (userType === 'student') {
        user = await authService.registerStudent({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          university: formData.university,
          major: formData.major,
          academicYear: formData.academicYear
        });
      } else {
        user = await authService.registerProfessor({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          university: formData.university,
          department: formData.department,
          title: formData.title
        });
      }
      
      // Store password reminder preference for new users
      authService.setRememberPassword(rememberPassword, formData.email);
      
      onAuthSuccess(user);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const tryDemoMode = (type: 'student' | 'professor') => {
    const demoUser = type === 'student' 
      ? authService.createDemoUserSession() 
      : authService.createDemoProfessorSession();
    onAuthSuccess(demoUser);
  };

  // Load saved email and preferences on component mount
  React.useEffect(() => {
    const { remember, email } = authService.getRememberPassword();
    
    if (remember && email) {
      setFormData(prev => ({ ...prev, email }));
      setRememberPassword(true);
    }
  }, []);

  // Loading overlay component
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">
            {showRegister ? 'Creating your account...' : 'Signing you in...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 relative overflow-hidden">
      {/* Blue Wave SVG Background */}
      <div className="absolute bottom-0 left-0 right-0 z-0">
        <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="relative w-full h-32 fill-blue-600 opacity-10">
          <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25"></path>
          <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5"></path>
          <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z"></path>
        </svg>
      </div>

      {/* Header */}
      <header className="relative z-10 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">UniCodePrep</span>
          </div>
          <button
            onClick={onBack}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors font-medium"
            style={{ color: '#007BFF' }}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          {/* User Type Selection */}
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {showRegister ? 'Create Your Account' : 'Sign In to Continue'}
            </h2>
            <p className="text-gray-600 mb-8">Choose your role to get started</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button
                onClick={() => setUserType('student')}
                className="group relative h-16 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
                style={{ 
                  backgroundColor: userType === 'student' ? '#E6F0FA' : '#F8F9FA',
                  border: userType === 'student' ? '2px solid #007BFF' : '2px solid #E9ECEF',
                  width: '200px'
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <GraduationCap className="w-5 h-5 text-blue-600" />
                  <span className="font-medium text-gray-800">Student</span>
                </div>
              </button>
              
              <button
                onClick={() => setUserType('professor')}
                className="group relative h-16 rounded-lg transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500"
                style={{ 
                  backgroundColor: userType === 'professor' ? '#F0E6FA' : '#F8F9FA',
                  border: userType === 'professor' ? '2px solid #9333EA' : '2px solid #E9ECEF',
                  width: '200px'
                }}
              >
                <div className="flex items-center justify-center space-x-2">
                  <Users className="w-5 h-5 text-purple-600" />
                  <span className="font-medium text-gray-800">Professor</span>
                </div>
              </button>
            </div>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}

          {/* Sign In Form */}
          {!showRegister ? (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="Enter your email address"
                  required
                  className="h-12 rounded-lg border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                  style={{
                    height: '50px',
                    borderColor: '#D1D5DB',
                    '--tw-ring-color': '#ADD8E6'
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="h-12 rounded-lg border-gray-300 focus:border-blue-400 focus:ring-blue-400 pr-10"
                    style={{
                      height: '50px',
                      borderColor: '#D1D5DB',
                      '--tw-ring-color': '#ADD8E6'
                    }}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
              </div>

              {/* Remember Password Checkbox - Default Checked */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberPassword"
                  checked={rememberPassword}
                  onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
                />
                <Label htmlFor="rememberPassword" className="text-sm text-gray-600 cursor-pointer">
                  Remember my password for next time (Recommended)
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-black text-white hover:bg-gray-800 rounded-lg font-medium transition-colors"
                style={{ 
                  height: '50px',
                  width: '200px',
                  margin: '0 auto',
                  display: 'block'
                }}
                disabled={loading}
              >
                Sign In
              </Button>

              <div className="text-center space-y-2">
                <button
                  type="button"
                  onClick={onForgotPassword}
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors flex items-center justify-center space-x-1 mx-auto"
                  style={{ color: '#007BFF' }}
                >
                  <Mail className="w-4 h-4" />
                  <span>Forgot Password?</span>
                </button>
                <p className="text-xs text-gray-500">
                  Reset codes sent from <strong>unicodeprep@gmail.com</strong>
                </p>
                <div>
                  <button
                    type="button"
                    onClick={() => setShowRegister(true)}
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Don't have an account? Sign up
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Registration Form */
            <div className="space-y-6">
              {/* Database Linkage Note */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start space-x-2">
                  <Database className="w-4 h-4 text-blue-600 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-blue-900 mb-1">Database Integration</p>
                    <p className="text-blue-700 text-xs">
                      {userType === 'student' 
                        ? 'Students table: (student_id, email, password_hash, university, major, academic_year, professor_id FK). Links to Professors via shared University/Major.'
                        : 'Professors table: (professor_id, email, password_hash, university, department, title). JWT with role claim post-login.'
                      }
                    </p>
                  </div>
                </div>
              </div>

              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder={userType === 'student' ? 'Alex Johnson' : 'Dr. Sarah Chen'}
                    required
                    className="h-12 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <Input
                    id="reg-email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder={userType === 'student' ? 'alex.j@university.edu' : 'sarah.c@university.edu'}
                    required
                    className="h-12 rounded-lg"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Input
                      id="reg-password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      required
                      className="h-12 rounded-lg pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="university">University</Label>
                  <Select onValueChange={(value) => handleInputChange('university', value)} required>
                    <SelectTrigger className="h-12 rounded-lg">
                      <SelectValue placeholder="Select your university" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Stanford University">Stanford University</SelectItem>
                      <SelectItem value="MIT">MIT</SelectItem>
                      <SelectItem value="UC Berkeley">UC Berkeley</SelectItem>
                      <SelectItem value="Carnegie Mellon">Carnegie Mellon</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {userType === 'student' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="major">Major</Label>
                      <Select onValueChange={(value) => handleInputChange('major', value)} required>
                        <SelectTrigger className="h-12 rounded-lg">
                          <SelectValue placeholder="Select your major" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                          <SelectItem value="Data Science">Data Science</SelectItem>
                          <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="academicYear">Academic Year</Label>
                      <Select onValueChange={(value) => handleInputChange('academicYear', value)} required>
                        <SelectTrigger className="h-12 rounded-lg">
                          <SelectValue placeholder="Select your year" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Freshman">Freshman</SelectItem>
                          <SelectItem value="Sophomore">Sophomore</SelectItem>
                          <SelectItem value="Junior">Junior</SelectItem>
                          <SelectItem value="Senior">Senior</SelectItem>
                          <SelectItem value="Graduate">Graduate</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select onValueChange={(value) => handleInputChange('department', value)} required>
                        <SelectTrigger className="h-12 rounded-lg">
                          <SelectValue placeholder="Select your department" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Computer Science">Computer Science</SelectItem>
                          <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                          <SelectItem value="Mathematics">Mathematics</SelectItem>
                          <SelectItem value="Physics">Physics</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="title">Title</Label>
                      <Select onValueChange={(value) => handleInputChange('title', value)} required>
                        <SelectTrigger className="h-12 rounded-lg">
                          <SelectValue placeholder="Select your title" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Professor">Professor</SelectItem>
                          <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                          <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                          <SelectItem value="Lecturer">Lecturer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}

                {/* Remember Password Checkbox for Registration - Default Checked */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberPasswordReg"
                    checked={rememberPassword}
                    onCheckedChange={(checked) => setRememberPassword(checked as boolean)}
                  />
                  <Label htmlFor="rememberPasswordReg" className="text-sm text-gray-600 cursor-pointer">
                    Remember my password for future logins (Recommended)
                  </Label>
                </div>

                <Button 
                  type="submit" 
                  className="w-full bg-black text-white hover:bg-gray-800 rounded-lg font-medium"
                  style={{ height: '50px' }}
                  disabled={loading}
                >
                  Create Account
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setShowRegister(false)}
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Demo Mode Section */}
          {!showRegister && (
            <div className="pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-600 text-center mb-4">Or try demo mode:</p>
              <div className="flex justify-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => tryDemoMode('student')}
                  className="rounded-lg border-2 hover:bg-gray-50 transition-colors"
                  style={{ 
                    color: '#6C757D',
                    borderColor: '#6C757D',
                    width: '100px',
                    height: '40px'
                  }}
                >
                  <GraduationCap className="w-4 h-4 mr-2" />
                  Student
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => tryDemoMode('professor')}
                  className="rounded-lg border-2 hover:bg-gray-50 transition-colors"
                  style={{ 
                    color: '#6C757D',
                    borderColor: '#6C757D',
                    width: '100px',
                    height: '40px'
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Professor
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}