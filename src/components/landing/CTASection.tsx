import React from 'react';
import { Button } from '../ui/button';
import { ArrowRight, Globe } from 'lucide-react';

interface CTASectionProps {
  onGetStarted: () => void;
  onShowSetup: () => void;
}

export default function CTASection({ onGetStarted, onShowSetup }: CTASectionProps) {
  return (
    <div className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
      <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-white mb-4">
          Ready to ace your next interview?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Join thousands of students and professors who trust UniCodePrep
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Button 
            size="lg" 
            onClick={onGetStarted}
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-3 text-lg"
          >
            Start Free Today
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
          <Button 
            variant="outline" 
            size="lg"
            onClick={onShowSetup}
            className="border-white text-white hover:bg-white hover:text-blue-600 px-6 py-3"
          >
            <Globe className="w-5 h-5 mr-2" />
            View Setup Guide
          </Button>
        </div>
      </div>
    </div>
  );
}