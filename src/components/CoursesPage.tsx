import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  ExternalLink, 
  BookOpen, 
  Code2, 
  Database, 
  Globe, 
  Laptop,
  GraduationCap,
  Award,
  Target,
  Info
} from 'lucide-react';
import { User } from '../utils/auth';

interface CoursesPageProps {
  currentUser: User;
}

interface Course {
  id: string;
  title: string;
  provider: string;
  category: string;
  description: string;
  url: string;
  thumbnail: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  type: 'Course' | 'Practice' | 'Certification' | 'Bootcamp';
  duration?: string;
  rating?: number;
}

const courses: Course[] = [
  {
    id: '1',
    title: 'Django Essential Training',
    provider: 'LinkedIn Learning',
    category: 'Web Development',
    description: 'Learn Django framework fundamentals for building robust web applications with Python.',
    url: 'https://www.linkedin.com/learning/django-essential-training-25094632/creating-a-new-django-project?autoSkip=true&resume=false',
    thumbnail: '/api/placeholder/300/200',
    difficulty: 'Intermediate',
    type: 'Course',
    duration: '4h 30m',
    rating: 4.8
  },
  {
    id: '2',
    title: 'DataCamp - Data Science',
    provider: 'DataCamp',
    category: 'Data Science',
    description: 'Interactive platform for learning data science with hands-on coding exercises and real-world projects.',
    url: 'https://www.datacamp.com/',
    thumbnail: '/api/placeholder/300/200',
    difficulty: 'Beginner',
    type: 'Bootcamp',
    duration: 'Self-paced',
    rating: 4.6
  },
  {
    id: '3',
    title: 'Business Data Science',
    provider: 'Coursera',
    category: 'Business Analytics',
    description: 'Professional certificates and specializations in business data science and analytics.',
    url: 'https://www.coursera.org/search?query=business&language=English&productTypeDescription=Professional%20Certificates&productTypeDescription=Specializations&topic=Data%20Science&sortBy=BEST_MATCH&myLearningTab=IN_PROGRESS',
    thumbnail: '/api/placeholder/300/200',
    difficulty: 'Intermediate',
    type: 'Certification',
    duration: '3-6 months',
    rating: 4.7
  },
  {
    id: '4',
    title: 'Continuous Improvement',
    provider: 'Udemy',
    category: 'Business Process',
    description: 'Introduction to continuous improvement methodologies and practices for business optimization.',
    url: 'https://www.udemy.com/course/continuous-improvement-an-introduction/?couponCode=MT180825A',
    thumbnail: '/api/placeholder/300/200',
    difficulty: 'Beginner',
    type: 'Course',
    duration: '2h 15m',
    rating: 4.4
  },
  {
    id: '5',
    title: 'LeetCode Problem Set',
    provider: 'LeetCode',
    category: 'Coding Practice',
    description: 'Comprehensive collection of coding problems for technical interview preparation and skill improvement.',
    url: 'https://leetcode.com/problemset/',
    thumbnail: '/api/placeholder/300/200',
    difficulty: 'Advanced',
    type: 'Practice',
    duration: 'Unlimited',
    rating: 4.9
  },
  {
    id: '6',
    title: 'Mock Technical Interviews',
    provider: 'HackerRank',
    category: 'Interview Prep',
    description: 'Practice technical interviews with real-world scenarios and get instant feedback.',
    url: 'https://www.hackerrank.com/mock-interviews/software-engineer/coding',
    thumbnail: '/api/placeholder/300/200',
    difficulty: 'Intermediate',
    type: 'Practice',
    duration: '1-2 hours',
    rating: 4.5
  },
  {
    id: '7',
    title: 'NeetCode Practice',
    provider: 'NeetCode',
    category: 'Algorithm Practice',
    description: 'Curated list of LeetCode problems with detailed video explanations and optimal solutions.',
    url: 'https://neetcode.io/practice',
    thumbnail: '/api/placeholder/300/200',
    difficulty: 'Advanced',
    type: 'Practice',
    duration: 'Self-paced',
    rating: 4.8
  },
  {
    id: '8',
    title: 'Blockchain Basics',
    provider: 'Updraft Cyfrin',
    category: 'Blockchain',
    description: 'Comprehensive introduction to blockchain technology, smart contracts, and decentralized applications.',
    url: 'https://updraft.cyfrin.io/courses/blockchain-basics/basics/quick-recap',
    thumbnail: '/api/placeholder/300/200',
    difficulty: 'Beginner',
    type: 'Course',
    duration: '6h 45m',
    rating: 4.6
  }
];

export default function CoursesPage({ currentUser }: CoursesPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading courses data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Access control - only students can access
  if (currentUser.userType !== 'student') {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <Alert className="border-red-200 bg-red-50">
          <Info className="w-4 h-4 text-red-600" />
          <AlertDescription className="text-red-700">
            Access denied. This page is only available to students.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const categories = [...new Set(courses.map(course => course.category))];
  const types = [...new Set(courses.map(course => course.type))];

  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'all' || course.category === selectedCategory;
    const matchesType = selectedType === 'all' || course.type === selectedType;
    return matchesCategory && matchesType;
  });

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'web development':
        return <Globe className="w-4 h-4" />;
      case 'data science':
        return <Database className="w-4 h-4" />;
      case 'coding practice':
      case 'algorithm practice':
        return <Code2 className="w-4 h-4" />;
      case 'interview prep':
        return <Target className="w-4 h-4" />;
      case 'blockchain':
        return <Laptop className="w-4 h-4" />;
      default:
        return <BookOpen className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Course':
        return 'bg-blue-100 text-blue-800';
      case 'Practice':
        return 'bg-green-100 text-green-800';
      case 'Certification':
        return 'bg-purple-100 text-purple-800';
      case 'Bootcamp':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const openCourse = (url: string, title: string) => {
    // Open course in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-80 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Courses</h1>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              Explore curated learning resources and external courses
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Badge variant="outline" className="text-sm">
              <GraduationCap className="w-4 h-4 mr-1" />
              {filteredCourses.length} Courses
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Category:</span>
            <div className="flex space-x-2">
              <Button
                variant={selectedCategory === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory('all')}
              >
                All
              </Button>
              {categories.map(category => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="flex items-center space-x-1"
                >
                  {getCategoryIcon(category)}
                  <span>{category}</span>
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Type:</span>
            <div className="flex space-x-2">
              <Button
                variant={selectedType === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedType('all')}
              >
                All
              </Button>
              {types.map(type => (
                <Button
                  key={type}
                  variant={selectedType === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedType(type)}
                >
                  {type}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.map((course) => (
          <Card 
            key={course.id} 
            className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:scale-105"
            style={{ width: '300px' }}
          >
            <CardHeader className="pb-3">
              {/* Thumbnail */}
              <div className="w-full h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center mb-3">
                <div className="text-center">
                  {getCategoryIcon(course.category)}
                  <div className="text-xs text-gray-600 mt-1">{course.provider}</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg line-clamp-2">{course.title}</CardTitle>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge className={getTypeColor(course.type)} variant="secondary">
                    {course.type}
                  </Badge>
                  <Badge className={getDifficultyColor(course.difficulty)} variant="secondary">
                    {course.difficulty}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              <CardDescription className="line-clamp-3">
                {course.description}
              </CardDescription>

              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>{course.duration}</span>
                {course.rating && (
                  <div className="flex items-center space-x-1">
                    <Award className="w-4 h-4 text-yellow-500" />
                    <span>{course.rating}</span>
                  </div>
                )}
              </div>

              <Button
                onClick={() => openCourse(course.url, course.title)}
                className="w-full"
                style={{ backgroundColor: '#007BFF', color: 'white' }}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Visit Course
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCourses.length === 0 && (
        <div className="text-center py-12">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No courses found</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Try adjusting your filters to see more courses.
          </p>
        </div>
      )}

      {/* Sticky Note Annotation */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-yellow-200 border-l-4 border-yellow-500 p-3 rounded shadow-lg max-w-xs">
          <p className="text-xs text-yellow-800 font-medium">
            📝 Design Note: Courses tab for students; links to external resources.
          </p>
        </div>
      </div>
    </div>
  );
}