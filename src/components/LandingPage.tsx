import React from 'react';
import HeroSection from './landing/HeroSection';
import FeaturesSection from './landing/FeaturesSection';
import TestimonialsSection from './landing/TestimonialsSection';
import CTASection from './landing/CTASection';
import Footer from './landing/Footer';

interface LandingPageProps {
  onGetStarted: () => void;
  onShowSetup: () => void;
  onTryDemo: () => void;
  onTryProfessorDemo?: () => void;
}

export default function LandingPage({ 
  onGetStarted, 
  onShowSetup, 
  onTryDemo, 
  onTryProfessorDemo 
}: LandingPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <HeroSection 
        onGetStarted={onGetStarted}
        onTryDemo={onTryDemo}
        onTryProfessorDemo={onTryProfessorDemo}
      />
      
      <FeaturesSection />
      
      <TestimonialsSection />
      
      <CTASection 
        onGetStarted={onGetStarted}
        onShowSetup={onShowSetup}
      />
      
      <Footer />
    </div>
  );
}