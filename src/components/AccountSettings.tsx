import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner@2.0.3';
import { 
  User, 
  Mail, 
  Building, 
  GraduationCap, 
  BookOpen, 
  Shield,
  Edit3,
  Save,
  CheckCircle,
  Eye,
  EyeOff,
  Settings,
  Palette,
  Bell,
  AlertTriangle
} from 'lucide-react';
import { User as AuthUser, authService } from '../utils/auth';

interface AccountSettingsProps {
  currentUser: AuthUser;
}

interface UserData {
  fullName: string;
  email: string;
  password: string;
  university: string;
  department?: string; // for professors
  title?: string; // for professors
  major?: string; // for students
  academicYear?: string; // for students
}

export default function AccountSettings({ currentUser }: AccountSettingsProps) {
  const [userData, setUserData] = useState<UserData>({
    fullName: '',
    email: '',
    password: '••••••••',
    university: '',
    department: '',
    title: '',
    major: '',
    academicYear: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [activeSection, setActiveSection] = useState('profile');

  useEffect(() => {
    loadUserData();
  }, [currentUser]);

  const loadUserData = async () => {
    setLoading(true);
    try {
      // In a real app, this would fetch from the backend
      // For now, we'll use the current user data
      const user = currentUser.userData as any;
      
      setUserData({
        fullName: user.name || '',
        email: user.email || '',
        password: '••••••••',
        university: user.university || '',
        department: user.department || '',
        title: user.title || '',
        major: user.major || '',
        academicYear: user.academicYear || ''
      });
    } catch (error) {
      console.error('Error loading user data:', error);
      toast.error('Failed to load user data');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, this would make an API call to update user data
      // For now, we'll simulate a successful update
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the current user data in authService
      if (currentUser.userData) {
        currentUser.userData = {
          ...currentUser.userData,
          name: userData.fullName,
          email: userData.email,
          university: userData.university,
          department: userData.department,
          title: userData.title,
          major: userData.major,
          academicYear: userData.academicYear
        };
      }

      setIsEditing(false);
      setNewPassword('');
      toast.success('Settings updated successfully!');
    } catch (error) {
      console.error('Error updating user data:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof UserData, value: string) => {
    setUserData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-main mx-auto px-content space-y-8 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">Account Settings</h1>
        <p className="text-muted-foreground text-lg max-w-content mx-auto">
          Manage your profile, preferences, and account security
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-enhanced">
        {/* Settings Navigation */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Settings Menu
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { id: 'profile', label: 'Profile Information', icon: User },
              { id: 'preferences', label: 'Preferences', icon: Palette },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'notifications', label: 'Notifications', icon: Bell },
              { id: 'danger', label: 'Danger Zone', icon: AlertTriangle }
            ].map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "ghost"}
                className="w-full justify-start"
                onClick={() => setActiveSection(item.id)}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        {/* Account Information Card */}
        <Card className="w-full max-w-md mx-auto" style={{ width: '200px', minWidth: '400px' }}>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Profile Information</span>
            </CardTitle>
            <CardDescription>
              Your account details and personal information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Full Name */}
            <div className="space-y-2">
              <Label htmlFor="fullName" className="flex items-center space-x-2">
                <User className="w-4 h-4" />
                <span>Full Name</span>
              </Label>
              <Input
                id="fullName"
                value={userData.fullName}
                onChange={(e) => handleInputChange('fullName', e.target.value)}
                disabled={!isEditing}
                className="h-12"
                style={{ height: '50px' }}
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center space-x-2">
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={userData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className="h-12"
                style={{ height: '50px' }}
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>Password</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={isEditing ? newPassword : userData.password}
                  onChange={(e) => setNewPassword(e.target.value)}
                  disabled={!isEditing}
                  placeholder={isEditing ? 'Enter new password' : ''}
                  className="h-12 pr-10"
                  style={{ height: '50px' }}
                />
                {isEditing && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                )}
              </div>
            </div>

            {/* University */}
            <div className="space-y-2">
              <Label htmlFor="university" className="flex items-center space-x-2">
                <Building className="w-4 h-4" />
                <span>University</span>
              </Label>
              {isEditing ? (
                <Select value={userData.university} onValueChange={(value) => handleInputChange('university', value)}>
                  <SelectTrigger className="h-12" style={{ height: '50px' }}>
                    <SelectValue placeholder="Select university" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Stanford University">Stanford University</SelectItem>
                    <SelectItem value="MIT">MIT</SelectItem>
                    <SelectItem value="UC Berkeley">UC Berkeley</SelectItem>
                    <SelectItem value="Carnegie Mellon">Carnegie Mellon</SelectItem>
                    <SelectItem value="Harvard University">Harvard University</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id="university"
                  value={userData.university}
                  disabled
                  className="h-12"
                  style={{ height: '50px' }}
                />
              )}
            </div>

            {/* Professor-specific fields */}
            {currentUser.userType === 'professor' && (
              <>
                {/* Department */}
                <div className="space-y-2">
                  <Label htmlFor="department" className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Department</span>
                  </Label>
                  {isEditing ? (
                    <Select value={userData.department} onValueChange={(value) => handleInputChange('department', value)}>
                      <SelectTrigger className="h-12" style={{ height: '50px' }}>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                        <SelectItem value="Mathematics">Mathematics</SelectItem>
                        <SelectItem value="Physics">Physics</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="department"
                      value={userData.department}
                      disabled
                      className="h-12"
                      style={{ height: '50px' }}
                    />
                  )}
                </div>

                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title" className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Title</span>
                  </Label>
                  {isEditing ? (
                    <Select value={userData.title} onValueChange={(value) => handleInputChange('title', value)}>
                      <SelectTrigger className="h-12" style={{ height: '50px' }}>
                        <SelectValue placeholder="Select title" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Professor">Professor</SelectItem>
                        <SelectItem value="Associate Professor">Associate Professor</SelectItem>
                        <SelectItem value="Assistant Professor">Assistant Professor</SelectItem>
                        <SelectItem value="Lecturer">Lecturer</SelectItem>
                        <SelectItem value="Adjunct Professor">Adjunct Professor</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="title"
                      value={userData.title}
                      disabled
                      className="h-12"
                      style={{ height: '50px' }}
                    />
                  )}
                </div>
              </>
            )}

            {/* Student-specific fields */}
            {currentUser.userType === 'student' && (
              <>
                {/* Major */}
                <div className="space-y-2">
                  <Label htmlFor="major" className="flex items-center space-x-2">
                    <BookOpen className="w-4 h-4" />
                    <span>Major</span>
                  </Label>
                  {isEditing ? (
                    <Select value={userData.major} onValueChange={(value) => handleInputChange('major', value)}>
                      <SelectTrigger className="h-12" style={{ height: '50px' }}>
                        <SelectValue placeholder="Select major" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Computer Science">Computer Science</SelectItem>
                        <SelectItem value="Software Engineering">Software Engineering</SelectItem>
                        <SelectItem value="Data Science">Data Science</SelectItem>
                        <SelectItem value="Electrical Engineering">Electrical Engineering</SelectItem>
                        <SelectItem value="Information Technology">Information Technology</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="major"
                      value={userData.major}
                      disabled
                      className="h-12"
                      style={{ height: '50px' }}
                    />
                  )}
                </div>

                {/* Academic Year */}
                <div className="space-y-2">
                  <Label htmlFor="academicYear" className="flex items-center space-x-2">
                    <GraduationCap className="w-4 h-4" />
                    <span>Academic Year</span>
                  </Label>
                  {isEditing ? (
                    <Select value={userData.academicYear} onValueChange={(value) => handleInputChange('academicYear', value)}>
                      <SelectTrigger className="h-12" style={{ height: '50px' }}>
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Freshman">Freshman</SelectItem>
                        <SelectItem value="Sophomore">Sophomore</SelectItem>
                        <SelectItem value="Junior">Junior</SelectItem>
                        <SelectItem value="Senior">Senior</SelectItem>
                        <SelectItem value="Graduate">Graduate</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Input
                      id="academicYear"
                      value={userData.academicYear}
                      disabled
                      className="h-12"
                      style={{ height: '50px' }}
                    />
                  )}
                </div>
              </>
            )}

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              {!isEditing ? (
                <Button
                  onClick={() => setIsEditing(true)}
                  className="flex-1"
                  style={{ backgroundColor: '#007BFF', color: 'white' }}
                >
                  <Edit3 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
              ) : (
                <>
                  <Button
                    onClick={() => {
                      setIsEditing(false);
                      setNewPassword('');
                      loadUserData(); // Reset changes
                    }}
                    variant="outline"
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex-1"
                    style={{ 
                      backgroundColor: 'black', 
                      color: 'white',
                      width: '150px'
                    }}
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Information Note */}
        <Alert>
          <CheckCircle className="w-4 h-4" />
          <AlertDescription>
            Your profile information is used to personalize your learning experience and connect you with relevant content.
            {currentUser.userType === 'professor' && ' As a professor, this information helps students find and connect with you.'}
          </AlertDescription>
        </Alert>

        {/* Sticky Note Annotation */}
        <div className="fixed bottom-4 right-4 z-50">
          <div className="bg-yellow-200 border-l-4 border-yellow-500 p-3 rounded shadow-lg max-w-xs">
            <p className="text-xs text-yellow-800 font-medium">
              📝 Design Note: Sign-up data pre-filled; dark mode toggle updates UI class.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}