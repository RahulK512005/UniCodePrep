import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Code2, 
  Menu, 
  X, 
  Home,
  BookOpen,
  MessageSquare,
  Target,
  Users,
  Database,
  Settings,
  LogOut,
  User,
  ChevronDown,
  GraduationCap,
  Building,
  Map
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import DarkModeToggle from './ui/dark-mode-toggle';
import { User as AuthUser } from '../utils/auth';
import { useDarkModeState } from '../utils/darkMode';

interface NavigationProps {
  currentUser: AuthUser;
  onLogout: () => void;
  isDemoMode?: boolean;
}

export default function Navigation({ currentUser, onLogout, isDemoMode = false }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { isDarkMode, toggleDarkMode } = useDarkModeState();

  const getNavigationItems = () => {
    const commonItems = [
      { path: '/dashboard', icon: Home, label: 'Dashboard' },
      { path: '/problems', icon: Code2, label: 'Problems' },
      { path: '/roadmap', icon: Map, label: 'Roadmap' },
      { path: '/interview', icon: Target, label: 'Interview' },
      { path: '/discussions', icon: MessageSquare, label: 'Discussions' },
      { path: '/recommendations', icon: BookOpen, label: 'Recommendations' }
    ];

    if (currentUser.userType === 'student') {
      // Add courses tab for students only
      commonItems.splice(5, 0, { path: '/courses', icon: GraduationCap, label: 'Courses' });
    }

    if (currentUser.userType === 'professor') {
      return [
        ...commonItems,
        { path: '/student-progress', icon: Users, label: 'Student Progress' }
      ];
    }

    return commonItems;
  };

  const navigationItems = getNavigationItems();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side - Logo and Dark Mode Toggle */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <DarkModeToggle
              isDarkMode={isDarkMode}
              onToggle={toggleDarkMode}
              className="mr-2"
            />

            {/* Logo */}
            <Link to="/dashboard" className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Code2 className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900 dark:text-white">UniCodePrep</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Right side - User menu */}
          <div className="flex items-center space-x-4">
            {/* User Role Badge */}
            <Badge 
              variant="outline" 
              className="hidden sm:flex items-center space-x-1 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300"
            >
              {currentUser.userType === 'professor' ? (
                <Building className="w-3 h-3" />
              ) : (
                <GraduationCap className="w-3 h-3" />
              )}
              <span className="capitalize">{currentUser.userType}</span>
            </Badge>

            {/* Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 hover:bg-gray-50 dark:hover:bg-gray-800">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="hidden sm:block text-gray-700 dark:text-gray-300">
                    {currentUser.userData?.name?.split(' ')[0] || 'User'}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {currentUser.userData?.name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {currentUser.userData?.email || 'No email'}
                    </p>
                    {isDemoMode && (
                      <Badge variant="secondary" className="text-xs mt-1">Demo Mode</Badge>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/account-settings" className="flex items-center">
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onLogout} className="text-red-600 dark:text-red-400">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={closeMenu}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              
              {/* Mobile Profile Section */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <Link
                  to="/account-settings"
                  onClick={closeMenu}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  <Settings className="w-5 h-5" />
                  <span>Account Settings</span>
                </Link>
                <button
                  onClick={() => {
                    closeMenu();
                    onLogout();
                  }}
                  className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-red-600 dark:text-red-400 hover:bg-gray-50 dark:hover:bg-gray-800 w-full text-left"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}