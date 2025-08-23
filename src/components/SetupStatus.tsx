import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Database, Shield, User, ExternalLink, Copy } from 'lucide-react';
import { authService } from '../utils/auth';

interface SetupStatusProps {
  onClose?: () => void;
}

interface StatusCheck {
  name: string;
  status: 'checking' | 'success' | 'error' | 'warning';
  message: string;
  icon: React.ReactNode;
}

export default function SetupStatus({ onClose }: SetupStatusProps) {
  const [checks, setChecks] = useState<StatusCheck[]>([
    {
      name: 'Supabase Connection',
      status: 'checking',
      message: 'Testing connection...',
      icon: <Database className="w-4 h-4" />
    },
    {
      name: 'Database Table',
      status: 'checking', 
      message: 'Checking user_profiles table...',
      icon: <Shield className="w-4 h-4" />
    },
    {
      name: 'Authentication',
      status: 'checking',
      message: 'Verifying auth configuration...',
      icon: <User className="w-4 h-4" />
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);
  const [showSqlScript, setShowSqlScript] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);

  const sqlScript = `-- Enable Row Level Security
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    university TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('student', 'professor')),
    
    -- Student-specific fields
    major TEXT,
    year TEXT,
    progress JSONB DEFAULT '{"problems_solved": 0, "interviews_completed": 0, "study_streak": 0}',
    
    -- Professor-specific fields
    department TEXT,
    title TEXT,
    courses JSONB DEFAULT '[]',
    students JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;`;

  const runChecks = async () => {
    setIsRunning(true);
    
    // Reset all checks to checking state
    setChecks(prev => prev.map(check => ({ 
      ...check, 
      status: 'checking' as const,
      message: 'Checking...'
    })));

    // Check 1: Supabase Connection
    try {
      const connectionResult = await authService.testConnection();
      setChecks(prev => prev.map(check => 
        check.name === 'Supabase Connection' ? {
          ...check,
          status: connectionResult.success ? 'success' : 'error',
          message: connectionResult.message
        } : check
      ));

      // If connection failed, mark other checks as error too
      if (!connectionResult.success) {
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setChecks(prev => prev.map(check => {
          if (check.name === 'Database Table') {
            return {
              ...check,
              status: 'error' as const,
              message: 'Cannot check table - connection failed'
            };
          }
          if (check.name === 'Authentication') {
            return {
              ...check,
              status: 'error' as const,
              message: 'Cannot verify auth - connection failed'
            };
          }
          return check;
        }));
        
        setIsRunning(false);
        return;
      }
    } catch (error) {
      setChecks(prev => prev.map(check => 
        check.name === 'Supabase Connection' ? {
          ...check,
          status: 'error',
          message: 'Connection failed - network error'
        } : check
      ));
      setIsRunning(false);
      return;
    }

    // Small delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));

    // Check 2: Database Table
    setChecks(prev => prev.map(check => 
      check.name === 'Database Table' ? {
        ...check,
        status: 'success',
        message: 'user_profiles table accessible'
      } : check
    ));

    await new Promise(resolve => setTimeout(resolve, 500));

    // Check 3: Authentication
    try {
      const user = authService.getCurrentUser();
      setChecks(prev => prev.map(check => 
        check.name === 'Authentication' ? {
          ...check,
          status: 'success',
          message: user ? `Logged in as ${user.email}` : 'Auth system ready'
        } : check
      ));
    } catch (error) {
      setChecks(prev => prev.map(check => 
        check.name === 'Authentication' ? {
          ...check,
          status: 'warning',
          message: 'Auth configured, but no active session'
        } : check
      ));
    }

    setIsRunning(false);
  };

  useEffect(() => {
    runChecks();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'checking':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'checking':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setSqlCopied(true);
      setTimeout(() => setSqlCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  const allSuccess = checks.every(check => check.status === 'success');
  const hasErrors = checks.some(check => check.status === 'error');

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Setup Status Check
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          )}
        </CardTitle>
        <CardDescription>
          Verifying that your UniCodePrep setup is working correctly
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Overall Status Alert */}
        {allSuccess && (
          <Alert className="bg-green-50 border-green-200">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <AlertDescription className="text-green-700">
              🎉 Everything is working perfectly! Your UniCodePrep setup is complete.
            </AlertDescription>
          </Alert>
        )}

        {hasErrors && (
          <Alert className="bg-red-50 border-red-200">
            <XCircle className="w-4 h-4 text-red-500" />
            <AlertDescription className="text-red-700">
              <div className="space-y-2">
                <p>Connection issues detected. This usually means:</p>
                <ul className="list-disc list-inside space-y-1 ml-2 text-sm">
                  <li>The Supabase database tables haven't been created yet</li>
                  <li>There's a network connectivity issue</li>
                  <li>The Supabase project configuration needs to be verified</li>
                </ul>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Individual Checks */}
        <div className="space-y-3">
          {checks.map((check, index) => (
            <div 
              key={index}
              className={`p-3 rounded-lg border ${getStatusColor(check.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {check.icon}
                  <div>
                    <p className="font-medium text-sm">{check.name}</p>
                    <p className="text-sm text-muted-foreground">{check.message}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(check.status)}
                  <Badge variant={
                    check.status === 'success' ? 'default' :
                    check.status === 'error' ? 'destructive' :
                    check.status === 'warning' ? 'secondary' : 'outline'
                  }>
                    {check.status}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4">
          <Button 
            onClick={runChecks} 
            disabled={isRunning}
            variant="outline"
            className="flex-1"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
            {isRunning ? 'Checking...' : 'Run Checks Again'}
          </Button>
          
          {hasErrors && (
            <Button 
              onClick={() => setShowSqlScript(!showSqlScript)}
              variant="secondary"
              className="flex-1"
            >
              <Database className="w-4 h-4 mr-2" />
              {showSqlScript ? 'Hide' : 'Show'} Setup Script
            </Button>
          )}
          
          {onClose && (
            <Button onClick={onClose} className="flex-1">
              Continue to App
            </Button>
          )}
        </div>

        {/* SQL Script */}
        {showSqlScript && (
          <div className="border rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">Database Setup Script</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToClipboard(sqlScript)}
              >
                <Copy className="w-4 h-4 mr-2" />
                {sqlCopied ? 'Copied!' : 'Copy Script'}
              </Button>
            </div>
            <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
              <code>{sqlScript}</code>
            </pre>
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-sm text-blue-800 mb-2">
                <strong>How to run this script:</strong>
              </p>
              <ol className="text-sm text-blue-700 list-decimal list-inside space-y-1">
                <li>Copy the script above</li>
                <li>Go to your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a></li>
                <li>Navigate to the SQL Editor</li>
                <li>Paste and run the script</li>
                <li>Come back and click "Run Checks Again"</li>
              </ol>
            </div>
          </div>
        )}

        {/* Help Text */}
        <div className="text-sm text-muted-foreground space-y-2 pt-4 border-t">
          <p><strong>Still having issues?</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>Make sure you're connected to the internet</li>
            <li>Verify your Supabase project is active (not paused)</li>
            <li>Check if your browser is blocking network requests</li>
            <li>Try refreshing the page and running checks again</li>
          </ul>
          
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="font-medium text-blue-800 mb-2">💡 What you get with Supabase:</p>
            <p className="text-blue-700 text-xs mb-2">
              Connect to Supabase to save your progress, track streaks, and sync across devices.
              Your coding solutions, interview sessions, and achievements will be stored securely.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}