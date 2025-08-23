import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { toast } from 'sonner@2.0.3';
import { 
  Mail, 
  Shield, 
  Key, 
  ArrowLeft, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff,
  Timer,
  Code2,
  Info,
  Copy,
  CheckCircle2
} from 'lucide-react';
import { emailService } from '../utils/emailService';
import { authService } from '../utils/auth';

interface ForgotPasswordProps {
  onBack: () => void;
  onSuccess: () => void;
}

type Step = 'email' | 'otp' | 'reset' | 'success';

export default function ForgotPassword({ onBack, onSuccess }: ForgotPasswordProps) {
  const [currentStep, setCurrentStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [demoOTP, setDemoOTP] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Timer effect for OTP expiry
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setDemoOTP(null);
          }
          return newTime;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [timeLeft]);

  // Check for demo OTP periodically
  useEffect(() => {
    if (currentStep === 'otp' && email) {
      const checkDemoOTP = () => {
        const demo = emailService.getDemoOTP(email);
        setDemoOTP(demo);
      };
      
      checkDemoOTP();
      const interval = setInterval(checkDemoOTP, 1000);
      return () => clearInterval(interval);
    }
  }, [currentStep, email]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): { isValid: boolean; message: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long' };
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter' };
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter' };
    }
    if (!/(?=.*\d)/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number' };
    }
    return { isValid: true, message: '' };
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateEmail(email)) {
        setError('Please enter a valid email address');
        return;
      }

      // Check if user exists
      const userExists = await authService.checkUserExists(email);
      if (!userExists) {
        setError('No account found with this email address');
        return;
      }

      const result = await emailService.sendPasswordResetOTP(email);
      
      if (result.success) {
        setCurrentStep('otp');
        setTimeLeft(600); // 10 minutes
        toast.success('Password reset code sent!', {
          description: `Check your email inbox at ${email}`
        });
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (otp.length !== 6) {
        setError('Please enter a valid 6-digit verification code');
        return;
      }

      const result = emailService.verifyOTP(email, otp);
      
      if (result.success) {
        setCurrentStep('reset');
        toast.success('Verification code confirmed!');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate passwords
      const passwordValidation = validatePassword(newPassword);
      if (!passwordValidation.isValid) {
        setError(passwordValidation.message);
        return;
      }

      if (newPassword !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }

      // Verify OTP is still valid
      if (!emailService.isOTPValidForReset(email, otp)) {
        setError('Verification code has expired. Please start over.');
        setCurrentStep('email');
        return;
      }

      // Reset password
      const result = await authService.resetPassword(email, newPassword, otp);
      
      if (result.success) {
        emailService.clearOTP(email);
        
        // Set remember password preference by default
        authService.setRememberPassword(true, email);
        
        setCurrentStep('success');
        toast.success('Password reset successfully!', {
          description: 'You can now sign in with your new password'
        });
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setError('');
    setLoading(true);

    try {
      const result = await emailService.sendPasswordResetOTP(email);
      
      if (result.success) {
        setTimeLeft(600);
        setOtp(''); // Clear current OTP input
        toast.success('New verification code sent!');
      } else {
        setError(result.message);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  const copyOTP = async () => {
    if (demoOTP) {
      await navigator.clipboard.writeText(demoOTP);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Demo OTP copied to clipboard!');
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const renderStepIndicator = () => {
    const steps = [
      { key: 'email', label: 'Email', icon: Mail },
      { key: 'otp', label: 'Verify', icon: Shield },
      { key: 'reset', label: 'Reset', icon: Key },
      { key: 'success', label: 'Success', icon: Check }
    ];

    const currentIndex = steps.findIndex(step => step.key === currentStep);

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => {
          const Icon = step.icon;
          const isActive = index === currentIndex;
          const isCompleted = index < currentIndex;
          
          return (
            <React.Fragment key={step.key}>
              <div className={`flex items-center justify-center w-10 h-10 rounded-full transition-colors ${
                isActive 
                  ? 'bg-blue-600 text-white' 
                  : isCompleted 
                    ? 'bg-green-600 text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-1 mx-2 transition-colors ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    );
  };

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
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Sign In</span>
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <Card className="shadow-lg">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-gray-900">
                {currentStep === 'email' && 'Reset Your Password'}
                {currentStep === 'otp' && 'Verify Your Email'}
                {currentStep === 'reset' && 'Create New Password'}
                {currentStep === 'success' && 'Password Reset Complete'}
              </CardTitle>
              <CardDescription>
                {currentStep === 'email' && 'Enter your email address to receive a reset code'}
                {currentStep === 'otp' && 'Enter the 6-digit code sent to your email'}
                {currentStep === 'reset' && 'Choose a strong password for your account'}
                {currentStep === 'success' && 'Your password has been successfully reset'}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              {renderStepIndicator()}

              {/* Error Alert */}
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              {/* Step 1: Email Entry */}
              {currentStep === 'email' && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Enter your registered email"
                        required
                        className="pl-10"
                      />
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <Info className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      <span className="font-medium">Email Service:</span> Verification codes are sent from 
                      <strong> unicodeprep@gmail.com</strong>. Please check your inbox and spam folder.
                    </AlertDescription>
                  </Alert>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Sending Code...
                      </>
                    ) : (
                      <>
                        <Mail className="w-4 h-4 mr-2" />
                        Send Reset Code
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Step 2: OTP Verification */}
              {currentStep === 'otp' && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <div className="relative">
                      <Input
                        id="otp"
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        placeholder="Enter 6-digit code"
                        required
                        className="pl-10 text-center text-lg tracking-widest"
                        maxLength={6}
                      />
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-sm text-gray-600">
                      Code sent to <strong>{email}</strong> from <strong>unicodeprep@gmail.com</strong>
                    </p>
                    {timeLeft > 0 && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Timer className="w-4 h-4" />
                        <span>Expires in {formatTime(timeLeft)}</span>
                      </div>
                    )}
                  </div>

                  {/* Demo OTP Display */}
                  {demoOTP && (
                    <Alert className="border-green-200 bg-green-50">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      <AlertDescription className="text-green-700">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">Demo Mode:</span> Your verification code is{' '}
                            <span className="font-mono font-bold">{demoOTP}</span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={copyOTP}
                            className="h-6 px-2"
                          >
                            {copied ? (
                              <CheckCircle2 className="w-3 h-3" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </Button>
                        </div>
                      </AlertDescription>
                    </Alert>
                  )}

                  <Button type="submit" disabled={loading || otp.length !== 6} className="w-full">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Verifying...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4 mr-2" />
                        Verify Code
                      </>
                    )}
                  </Button>

                  <div className="text-center">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={handleResendOTP}
                      disabled={loading || timeLeft > 540} // Allow resend after 1 minute
                      className="text-sm"
                    >
                      Didn't receive the code? Resend
                    </Button>
                  </div>
                </form>
              )}

              {/* Step 3: Password Reset */}
              {currentStep === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showPassword ? 'text' : 'password'}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        required
                        className="pl-10 pr-10"
                      />
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Confirm new password"
                        required
                        className="pl-10 pr-10"
                      />
                      <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm font-medium text-gray-700 mb-2">Password Requirements:</p>
                    <ul className="text-xs text-gray-600 space-y-1">
                      <li className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${newPassword.length >= 8 ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>At least 8 characters</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${/(?=.*[a-z])/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>One lowercase letter</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${/(?=.*[A-Z])/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>One uppercase letter</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${/(?=.*\d)/.test(newPassword) ? 'bg-green-500' : 'bg-gray-300'}`} />
                        <span>One number</span>
                      </li>
                    </ul>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Resetting Password...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4 mr-2" />
                        Reset Password
                      </>
                    )}
                  </Button>
                </form>
              )}

              {/* Step 4: Success */}
              {currentStep === 'success' && (
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                    <Check className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-gray-900">Password Reset Successful!</h3>
                    <p className="text-gray-600">
                      Your password has been successfully reset and saved to the database.
                    </p>
                  </div>

                  <Alert className="border-blue-200 bg-blue-50">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <AlertDescription className="text-blue-700">
                      <strong>Password Remembered:</strong> We've enabled "Remember Password" by default for easier future logins. 
                      Your email will be pre-filled next time you sign in.
                    </AlertDescription>
                  </Alert>

                  <Alert className="border-green-200 bg-green-50">
                    <Shield className="w-4 h-4 text-green-600" />
                    <AlertDescription className="text-green-700">
                      <strong>Database Updated:</strong> Your new password has been securely hashed and stored. 
                      All existing sessions have been invalidated for security.
                    </AlertDescription>
                  </Alert>

                  <Button onClick={onSuccess} className="w-full">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Sign In with New Password
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}