import React from 'react';
import { Button } from './button';
import { Moon, Sun } from 'lucide-react';

interface DarkModeToggleProps {
  isDarkMode: boolean;
  onToggle: () => void;
  className?: string;
}

export default function DarkModeToggle({ isDarkMode, onToggle, className = '' }: DarkModeToggleProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onToggle}
      className={`relative w-10 h-10 p-0 border-2 transition-all duration-300 ${className}`}
      style={{
        backgroundColor: isDarkMode ? '#1A1A1A' : '#6C757D',
        borderColor: isDarkMode ? '#333' : '#6C757D',
        color: 'white'
      }}
      aria-label="Toggle dark mode"
    >
      <div 
        className="absolute inset-1 bg-white rounded-sm transition-transform duration-300 flex items-center justify-center"
        style={{
          transform: isDarkMode ? 'translateX(0)' : 'translateX(0)',
          backgroundColor: isDarkMode ? '#333' : 'white'
        }}
      >
        {isDarkMode ? (
          <Moon className="w-4 h-4 text-white" />
        ) : (
          <Sun className="w-4 h-4 text-gray-600" />
        )}
      </div>
    </Button>
  );
}