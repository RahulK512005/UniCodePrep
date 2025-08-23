import { 
  Code2, 
  Target, 
  MessageSquare, 
  BookOpen, 
  Users, 
  BarChart3, 
  Award 
} from 'lucide-react';

export const features = [
  {
    icon: Code2,
    title: "Coding Problems",
    description: "Practice with curated problems from top tech companies",
    stats: "500+ Problems"
  },
  {
    icon: Target,
    title: "AI Interview Coach",  
    description: "Realistic interview simulations with instant feedback",
    stats: "Real-time Analysis"
  },
  {
    icon: MessageSquare,
    title: "Discussion Forums",
    description: "Collaborate with peers and get help from experts",
    stats: "10k+ Students"
  },
  {
    icon: BookOpen,
    title: "Learning Paths",
    description: "Personalized roadmaps based on your goals",
    stats: "AI-Powered"
  }
];

export const professorFeatures = [
  {
    icon: Users,
    title: "Student Progress Tracking",
    description: "Monitor your students' learning journey and performance",
    highlight: "Professor Only"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Detailed insights into class performance and engagement",
    highlight: "Advanced Metrics"
  },
  {
    icon: Award,
    title: "Achievement System",
    description: "Track student milestones and celebrate successes",
    highlight: "Gamification"
  }
];

export const testimonials = [
  {
    name: "Sarah Chen",
    role: "CS Student at Stanford",
    avatar: "S",
    quote: "UniCodePrep helped me land my dream internship at Google. The AI interview coach was incredibly realistic!"
  },
  {
    name: "Dr. Michael Rodriguez",
    role: "Professor at MIT",
    avatar: "M",
    quote: "As a professor, I love how I can track my students' progress and provide targeted guidance. Game-changing platform!"
  },
  {
    name: "Alex Johnson",
    role: "Software Engineer",
    avatar: "A",
    quote: "The consistency tracking and streak system kept me motivated throughout my job search. Highly recommended!"
  }
];

export const keyStats = [
  { value: "10K+", label: "Active Students", color: "text-blue-600" },
  { value: "500+", label: "Problems", color: "text-green-600" },
  { value: "50+", label: "Universities", color: "text-purple-600" },
  { value: "95%", label: "Success Rate", color: "text-orange-600" }
];