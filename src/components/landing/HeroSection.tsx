import React from 'react';
import { Button } from '../ui/button';
import { Code2, ArrowRight, GraduationCap, Users } from 'lucide-react';
import { keyStats } from '../../constants/landingPageData';

interface HeroSectionProps {
  onGetStarted: () => void;
  onTryDemo: () => void;
  onTryProfessorDemo?: () => void;
}

export default function HeroSection({ onGetStarted, onTryDemo, onTryProfessorDemo }: HeroSectionProps) {
  return (
    <div className="relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
              <Code2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900">
              Uni<span className="text-blue-600">Code</span>Prep
            </h1>
          </div>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            The comprehensive platform for coding interview preparation and career success
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-12">
            <Button 
              size="lg" 
              onClick={onGetStarted}
              className="px-8 py-3 text-lg"
            >
              Get Started Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="lg"
                onClick={onTryDemo}
                className="px-6 py-3"
              >
                <GraduationCap className="w-5 h-5 mr-2" />
                Student Demo
              </Button>
              
              {onTryProfessorDemo && (
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={onTryProfessorDemo}
                  className="px-6 py-3"
                >
                  <Users className="w-5 h-5 mr-2" />
                  Professor Demo
                </Button>
              )}
            </div>
          </div>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
            {keyStats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}