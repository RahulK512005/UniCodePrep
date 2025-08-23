import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navigation from './components/Navigation';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ProfessorDashboard from './components/ProfessorDashboard';
import StudentProgress from './components/StudentProgress';
import ProblemsPage from './components/ProblemsPage';
import RoadmapPage from './components/RoadmapPage';
import InterviewSimulator from './components/InterviewSimulator';
import RecommendationsPage from './components/RecommendationsPage';
import DiscussionsPage from './components/DiscussionsPage';
import DatabaseSchema from './components/DatabaseSchema';
import SetupStatus from './components/SetupStatus';
import Auth from './components/Auth';
import ForgotPassword from './components/ForgotPassword';
import AccountSettings from './components/AccountSettings';
import CoursesPage from './components/CoursesPage';
import { authService, User } from './utils/auth';
import { DarkModeContext, useDarkModeState } from './utils/darkMode';
import { Alert, AlertDescription } from './components/ui/alert';
import { CheckCircle, Info } from 'lucide-react';
import { Toaster } from './components/ui/sonner';

function AppContent() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showSetup, setShowSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    // Check for existing user session on app load
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      setIsDemoMode(authService.isDemoMode());
    }
    setLoading(false);
  }, []);

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setIsDemoMode(authService.isDemoMode());
    setShowAuth(false);
    setShowForgotPassword(false);
  };

  const handleLogout = async () => {
    await authService.logout();
    setCurrentUser(null);
    setIsDemoMode(false);
  };

  const handleShowAuth = () => {
    setShowAuth(true);
    setShowForgotPassword(false);
  };

  const handleShowForgotPassword = () => {
    setShowAuth(false);
    setShowForgotPassword(true);
  };

  const handleBackToHome = () => {
    setShowAuth(false);
    setShowForgotPassword(false);
  };

  const handleForgotPasswordSuccess = () => {
    setShowForgotPassword(false);
    setShowAuth(true);
  };

  const handleShowSetup = () => {
    setShowSetup(true);
  };

  const handleCloseSetup = () => {
    setShowSetup(false);
  };

  const handleTryDemo = () => {
    const demoUser = authService.createDemoUserSession();
    setCurrentUser(demoUser);
    setIsDemoMode(true);
  };

  const handleTryProfessorDemo = () => {
    const demoProfessor = authService.createDemoProfessorSession();
    setCurrentUser(demoProfessor);
    setIsDemoMode(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading UniCodePrep...</p>
        </div>
      </div>
    );
  }

  // Show setup status if requested
  if (showSetup) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <SetupStatus onClose={handleCloseSetup} />
      </div>
    );
  }

  // Show forgot password page
  if (showForgotPassword && !currentUser) {
    return (
      <ForgotPassword 
        onBack={handleBackToHome} 
        onSuccess={handleForgotPasswordSuccess} 
      />
    );
  }

  // Show authentication page
  if (showAuth && !currentUser) {
    return (
      <Auth 
        onBack={handleBackToHome} 
        onAuthSuccess={handleAuthSuccess}
        onForgotPassword={handleShowForgotPassword}
      />
    );
  }

  // Show landing page if no user is logged in
  if (!currentUser) {
    return (
      <LandingPage 
        onGetStarted={handleShowAuth} 
        onShowSetup={handleShowSetup}
        onTryDemo={handleTryDemo}
        onTryProfessorDemo={handleTryProfessorDemo}
      />
    );
  }

  // Main application for authenticated users
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
        {/* Demo Mode Alert */}
        {isDemoMode && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800 px-4 py-2">
            <div className="max-w-7xl mx-auto">
              <Alert className="border-0 bg-transparent p-0">
                <CheckCircle className="w-4 h-4 text-blue-500" />
                <AlertDescription className="text-blue-700 dark:text-blue-300 text-sm ml-2">
                  <span className="font-medium">Demo Mode Active</span> - Your progress won't be saved. 
                  {currentUser.userType === 'professor' && (
                    <span> Professor features like Student Progress are only available after creating a full account.</span>
                  )}
                  {currentUser.userType === 'student' && (
                    <span> Create an account to save your work and track your progress.</span>
                  )}
                </AlertDescription>
              </Alert>
            </div>
          </div>
        )}
        
        <Navigation 
          currentUser={currentUser}
          onLogout={handleLogout}
          isDemoMode={isDemoMode}
        />
        
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              currentUser.userType === 'professor' ? (
                <ProfessorDashboard currentUser={currentUser} isDemoMode={isDemoMode} />
              ) : (
                <Dashboard currentUser={currentUser} />
              )
            } 
          />
          
          {/* Account Settings - Available to all users */}
          <Route 
            path="/account-settings" 
            element={<AccountSettings currentUser={currentUser} />} 
          />
          
          {/* Professor-only routes */}
          {currentUser.userType === 'professor' && (
            <Route 
              path="/student-progress" 
              element={<StudentProgress currentUser={currentUser} isDemoMode={isDemoMode} />} 
            />
          )}
          
          {/* Student-only routes */}
          {currentUser.userType === 'student' && (
            <Route 
              path="/courses" 
              element={<CoursesPage currentUser={currentUser} />} 
            />
          )}
          
          {/* Common routes for both user types */}
          <Route path="/problems" element={<ProblemsPage currentUser={currentUser} />} />
          <Route path="/roadmap" element={<RoadmapPage currentUser={currentUser} />} />
          <Route path="/interview" element={<InterviewSimulator currentUser={currentUser} />} />
          <Route path="/discussions" element={<DiscussionsPage currentUser={currentUser} />} />
          <Route path="/recommendations" element={<RecommendationsPage currentUser={currentUser} />} />
          
          {/* Database schema visualization (development/admin view) */}
          <Route path="/database-schema" element={<DatabaseSchema />} />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        
        {/* Toast notifications */}
        <Toaster 
          position="top-right"
          richColors
          closeButton
        />
      </div>
    </Router>
  );
}

function App() {
  const darkModeState = useDarkModeState();

  return (
    <DarkModeContext.Provider value={darkModeState}>
      <AppContent />
    </DarkModeContext.Provider>
  );
}

export default App;