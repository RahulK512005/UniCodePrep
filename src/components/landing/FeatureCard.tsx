import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  stats?: string;
  highlight?: string;
  variant?: 'default' | 'professor';
}

export default function FeatureCard({ 
  icon: Icon, 
  title, 
  description, 
  stats, 
  highlight,
  variant = 'default' 
}: FeatureCardProps) {
  const isProfessor = variant === 'professor';
  
  return (
    <Card className={`hover:shadow-lg transition-shadow ${isProfessor ? 'border-purple-200' : ''}`}>
      <CardHeader>
        {isProfessor && highlight ? (
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Icon className="w-6 h-6 text-purple-600" />
            </div>
            <Badge className="bg-purple-100 text-purple-700">
              {highlight}
            </Badge>
          </div>
        ) : (
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
            <Icon className="w-6 h-6 text-blue-600" />
          </div>
        )}
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {stats && (
        <CardContent>
          <Badge variant="secondary">{stats}</Badge>
        </CardContent>
      )}
    </Card>
  );
}