import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { 
  Database, 
  Key, 
  Link as LinkIcon, 
  Users, 
  GraduationCap, 
  Shield, 
  Server,
  ArrowRight,
  Lock,
  Eye,
  Filter
} from 'lucide-react';

export default function DatabaseSchema() {
  const professorColumns = [
    { name: 'professor_id', type: 'UUID', primary: true, description: 'Primary Key' },
    { name: 'full_name', type: 'VARCHAR(255)', primary: false, description: 'Professor full name' },
    { name: 'email', type: 'VARCHAR(255)', primary: false, description: 'Unique email address' },
    { name: 'password_hash', type: 'VARCHAR(255)', primary: false, description: 'Encrypted password' },
    { name: 'university', type: 'VARCHAR(255)', primary: false, description: 'University affiliation' },
    { name: 'department', type: 'VARCHAR(255)', primary: false, description: 'Department (CS, EE, etc.)' },
    { name: 'title', type: 'VARCHAR(100)', primary: false, description: 'Academic title' },
    { name: 'created_at', type: 'TIMESTAMP', primary: false, description: 'Account creation date' },
    { name: 'updated_at', type: 'TIMESTAMP', primary: false, description: 'Last update date' }
  ];

  const studentColumns = [
    { name: 'student_id', type: 'UUID', primary: true, description: 'Primary Key' },
    { name: 'full_name', type: 'VARCHAR(255)', primary: false, description: 'Student full name' },
    { name: 'email', type: 'VARCHAR(255)', primary: false, description: 'Unique email address' },
    { name: 'password_hash', type: 'VARCHAR(255)', primary: false, description: 'Encrypted password' },
    { name: 'university', type: 'VARCHAR(255)', primary: false, description: 'University affiliation' },
    { name: 'major', type: 'VARCHAR(255)', primary: false, description: 'Academic major' },
    { name: 'academic_year', type: 'VARCHAR(50)', primary: false, description: 'Current year level' },
    { name: 'professor_id', type: 'UUID', primary: false, description: 'Foreign Key → Professors' },
    { name: 'department_link', type: 'VARCHAR(255)', primary: false, description: 'Links to prof department' },
    { name: 'progress_data', type: 'JSONB', primary: false, description: 'Learning progress & stats' },
    { name: 'created_at', type: 'TIMESTAMP', primary: false, description: 'Account creation date' },
    { name: 'updated_at', type: 'TIMESTAMP', primary: false, description: 'Last update date' }
  ];

  const sampleProfessors = [
    {
      id: 'prof-001',
      name: 'Dr. Sarah Chen',
      email: 'sarah.chen@stanford.edu',
      university: 'Stanford University',
      department: 'Computer Science',
      title: 'Professor'
    },
    {
      id: 'prof-002',
      name: 'Dr. Michael Rodriguez',
      email: 'michael.r@mit.edu',
      university: 'MIT',
      department: 'Electrical Engineering',
      title: 'Associate Professor'
    },
    {
      id: 'prof-003',
      name: 'Dr. Lisa Wang',
      email: 'lisa.w@berkeley.edu',
      university: 'UC Berkeley',
      department: 'Computer Science',
      title: 'Assistant Professor'
    }
  ];

  const sampleStudents = [
    {
      id: 'std-001',
      name: 'Alex Johnson',
      email: 'alex.j@stanford.edu',
      university: 'Stanford University',
      major: 'Computer Science',
      year: 'Junior',
      prof_id: 'prof-001',
      dept_link: 'Computer Science'
    },
    {
      id: 'std-002',
      name: 'Emma Davis',
      email: 'emma.d@stanford.edu',
      university: 'Stanford University',
      major: 'Software Engineering',
      year: 'Senior',
      prof_id: 'prof-001',
      dept_link: 'Computer Science'
    },
    {
      id: 'std-003',
      name: 'James Wilson',
      email: 'james.w@mit.edu',
      university: 'MIT',
      major: 'Electrical Engineering',
      year: 'Sophomore',
      prof_id: 'prof-002',
      dept_link: 'Electrical Engineering'
    },
    {
      id: 'std-004',
      name: 'Sofia Martinez',
      email: 'sofia.m@berkeley.edu',
      university: 'UC Berkeley',
      major: 'Computer Science',
      year: 'Junior',
      prof_id: 'prof-003',
      dept_link: 'Computer Science'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900">Backend Database Schema</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Visual representation of the UniCodePrep database architecture showing the relationship between 
          professors and students with proper access control and security measures.
        </p>
      </div>

      {/* Architecture Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Server className="w-5 h-5" />
            <span>Database Architecture</span>
          </CardTitle>
          <CardDescription>
            PostgreSQL/NoSQL database with separate tables for security and role-based access control
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Database className="w-12 h-12 mx-auto mb-2 text-blue-600" />
              <h3 className="font-medium">Database Engine</h3>
              <p className="text-sm text-gray-600">PostgreSQL or MongoDB</p>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <Shield className="w-12 h-12 mx-auto mb-2 text-green-600" />
              <h3 className="font-medium">Security</h3>
              <p className="text-sm text-gray-600">JWT + Row Level Security</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <Filter className="w-12 h-12 mx-auto mb-2 text-purple-600" />
              <h3 className="font-medium">Access Control</h3>
              <p className="text-sm text-gray-600">University/Department filtering</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Database Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Professors Table */}
        <Card className="border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="flex items-center space-x-2 text-blue-800">
              <Users className="w-5 h-5" />
              <span>Professors Database</span>
            </CardTitle>
            <CardDescription>
              Faculty members with access to student progress in their department
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Structure */}
            <div className="p-4 border-b">
              <h4 className="font-medium mb-3">Table Schema</h4>
              <div className="space-y-1">
                {professorColumns.map((column, index) => (
                  <div key={index} className="flex items-center justify-between py-1 px-2 rounded text-sm hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      {column.primary && <Key className="w-3 h-3 text-yellow-500" />}
                      <span className={`font-mono ${column.primary ? 'font-semibold' : ''}`}>
                        {column.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {column.type}
                      </Badge>
                      {column.primary && <Badge className="text-xs">PK</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Data */}
            <div className="p-4">
              <h4 className="font-medium mb-3">Sample Data</h4>
              <div className="space-y-2">
                {sampleProfessors.map((professor, index) => (
                  <div key={index} className="p-3 bg-blue-50 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{professor.name}</span>
                      <Badge variant="secondary" className="text-xs">{professor.id}</Badge>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>📧 {professor.email}</div>
                      <div>🏛️ {professor.university}</div>
                      <div>🎓 {professor.department}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Students Table */}
        <Card className="border-green-200">
          <CardHeader className="bg-green-50">
            <CardTitle className="flex items-center space-x-2 text-green-800">
              <GraduationCap className="w-5 h-5" />
              <span>Students Database</span>
            </CardTitle>
            <CardDescription>
              Student accounts with progress tracking and professor linkage
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {/* Table Structure */}
            <div className="p-4 border-b">
              <h4 className="font-medium mb-3">Table Schema</h4>
              <div className="space-y-1">
                {studentColumns.map((column, index) => (
                  <div key={index} className="flex items-center justify-between py-1 px-2 rounded text-sm hover:bg-gray-50">
                    <div className="flex items-center space-x-2">
                      {column.primary && <Key className="w-3 h-3 text-yellow-500" />}
                      {column.name === 'professor_id' && <LinkIcon className="w-3 h-3 text-blue-500" />}
                      <span className={`font-mono ${column.primary ? 'font-semibold' : ''}`}>
                        {column.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {column.type}
                      </Badge>
                      {column.primary && <Badge className="text-xs">PK</Badge>}
                      {column.name === 'professor_id' && <Badge variant="secondary" className="text-xs">FK</Badge>}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sample Data */}
            <div className="p-4">
              <h4 className="font-medium mb-3">Sample Data</h4>
              <div className="space-y-2">
                {sampleStudents.map((student, index) => (
                  <div key={index} className="p-3 bg-green-50 rounded border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-sm">{student.name}</span>
                      <Badge variant="secondary" className="text-xs">{student.id}</Badge>
                    </div>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>📧 {student.email}</div>
                      <div>🏛️ {student.university}</div>
                      <div>📚 {student.major} • {student.year}</div>
                      <div className="flex items-center space-x-1">
                        <LinkIcon className="w-3 h-3 text-blue-500" />
                        <span>→ {student.prof_id}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Relationships */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <LinkIcon className="w-5 h-5" />
            <span>Database Relationships</span>
          </CardTitle>
          <CardDescription>
            Entity relationships and access control mechanisms
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Relationship Diagram */}
            <div className="flex items-center justify-center">
              <div className="flex items-center space-x-8">
                <div className="text-center">
                  <div className="w-24 h-16 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                    <Users className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-sm font-medium">Professors</p>
                  <p className="text-xs text-gray-500">One</p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-0.5 bg-gray-400"></div>
                  <div className="w-3 h-3 border-2 border-gray-400 rounded-full bg-white"></div>
                  <div className="w-8 h-0.5 bg-gray-400"></div>
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                  <div className="w-8 h-0.5 bg-gray-400"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                  <div className="w-8 h-0.5 bg-gray-400"></div>
                </div>
                
                <div className="text-center">
                  <div className="w-24 h-16 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                    <GraduationCap className="w-8 h-8 text-green-600" />
                  </div>
                  <p className="text-sm font-medium">Students</p>
                  <p className="text-xs text-gray-500">Many</p>
                </div>
              </div>
            </div>

            {/* Relationship Types */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Key className="w-4 h-4 text-yellow-500" />
                  <span>Primary Relationship</span>
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  One-to-Many via <code className="bg-gray-100 px-1 rounded">professor_id</code> foreign key
                </p>
                <div className="text-xs text-gray-500">
                  Students.professor_id → Professors.professor_id
                </div>
              </div>

              <div className="p-4 border rounded-lg">
                <h4 className="font-medium mb-2 flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-purple-500" />
                  <span>Access Control</span>
                </h4>
                <p className="text-sm text-gray-600 mb-2">
                  University + Department filtering for security
                </p>
                <div className="text-xs text-gray-500">
                  WHERE university = prof.university AND department_link = prof.department
                </div>
              </div>
            </div>

            {/* Implementation Notes */}
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <h4 className="font-medium mb-2 flex items-center space-x-2">
                <Server className="w-4 h-4 text-yellow-600" />
                <span>Implementation Notes</span>
              </h4>
              <div className="text-sm text-gray-700 space-y-2">
                <div className="flex items-start space-x-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2"></span>
                  <span><strong>Separate DBs for security/compliance:</strong> Student and professor data isolated</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2"></span>
                  <span><strong>JWT Authentication:</strong> Role-based access (professor only features)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2"></span>
                  <span><strong>Query Filtering:</strong> Professors query Students WHERE major IN (department majors)</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="w-1 h-1 bg-gray-400 rounded-full mt-2"></span>
                  <span><strong>Database Engine:</strong> PostgreSQL recommended for JSONB progress data</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security & Access Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security & Access Control</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 border rounded-lg">
              <Lock className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <h4 className="font-medium mb-2">Authentication</h4>
              <p className="text-sm text-gray-600">
                JWT tokens with role-based claims (student/professor)
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Eye className="w-8 h-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium mb-2">Authorization</h4>
              <p className="text-sm text-gray-600">
                Professors can only view students from their department/university
              </p>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <Database className="w-8 h-8 mx-auto mb-2 text-green-500" />
              <h4 className="font-medium mb-2">Data Privacy</h4>
              <p className="text-sm text-gray-600">
                Row-level security ensures data isolation between institutions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}