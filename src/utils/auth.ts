export interface User {
  id: string;
  email: string;
  userType: 'student' | 'professor';
  userData?: any;
}

export interface StudentData {
  name: string;
  email: string;
  password: string;
  university: string;
  major: string;
  academicYear: string;
}

export interface ProfessorData {
  name: string;
  email: string;
  password: string;
  university: string;
  department: string;
  title: string;
  students?: any[];
}

class AuthService {
  private currentUser: User | null = null;
  private isDemoActive = false;

  async login(email: string, password: string, userType: 'student' | 'professor'): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Demo login for testing
    if (email === 'demo@unicodeprep.edu' || email.includes('demo')) {
      return this.createDemoUserSession();
    }

    if (email === 'prof@unicodeprep.edu' || email.includes('prof')) {
      return this.createDemoProfessorSession();
    }

    // In a real app, this would make an API call to your backend
    // For now, we'll simulate a successful login
    const userData = this.createMockUserData(email, userType);
    
    const user: User = {
      id: `${userType}_${Date.now()}`,
      email,
      userType,
      userData
    };

    this.currentUser = user;
    this.isDemoActive = false;
    
    // Store in localStorage for persistence
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
  }

  async registerStudent(data: StudentData): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, this would make an API call to create the user
    const user: User = {
      id: `student_${Date.now()}`,
      email: data.email,
      userType: 'student',
      userData: {
        name: data.name,
        email: data.email,
        university: data.university,
        major: data.major,
        academicYear: data.academicYear,
        progress: {
          total_score: 0,
          problems_solved: 0,
          interviews_completed: 0,
          current_streak: 0,
          longest_streak: 0,
          consistency_coins: 0,
          rank: 'bronze'
        }
      }
    };

    this.currentUser = user;
    this.isDemoActive = false;
    
    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
  }

  async registerProfessor(data: ProfessorData): Promise<User> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // In a real app, this would make an API call to create the user
    const user: User = {
      id: `professor_${Date.now()}`,
      email: data.email,
      userType: 'professor',
      userData: {
        name: data.name,
        email: data.email,
        university: data.university,
        department: data.department,
        title: data.title,
        students: this.generateMockStudents()
      }
    };

    this.currentUser = user;
    this.isDemoActive = false;
    
    // Store in localStorage
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    return user;
  }

  async checkUserExists(email: string): Promise<boolean> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));

    // In a real app, this would check against your database
    // For demo purposes, we'll return true for most emails
    const demoEmails = [
      'demo@unicodeprep.edu',
      'prof@unicodeprep.edu',
      'student@example.com',
      'professor@example.com',
      'test@university.edu',
      'john.doe@university.edu',
      'jane.smith@university.edu',
      'alex.johnson@university.edu'
    ];

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return false;
    }

    // Return true for demo emails or any email that looks valid (for demo purposes)
    return demoEmails.includes(email) || email.includes('@');
  }

  async resetPassword(email: string, newPassword: string, otp: string): Promise<{ success: boolean; message: string }> {
    // Simulate API delay for database operations
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // In a real app, this would:
      // 1. Verify the OTP is valid and not expired (already done by emailService)
      // 2. Hash the new password using bcrypt or similar
      // 3. Update the password in the database
      // 4. Invalidate all existing sessions for this user
      // 5. Log the password change for security audit
      
      console.log('=== PASSWORD RESET DATABASE OPERATION ===');
      console.log(`Email: ${email}`);
      console.log(`OTP Verified: ${otp}`);
      console.log(`New Password Hash: ${this.hashPassword(newPassword)}`);
      console.log('Database Operations:');
      console.log('  1. ✅ Password hash updated in database');
      console.log('  2. ✅ All existing sessions invalidated');
      console.log('  3. ✅ Password change logged for security audit');
      console.log('  4. ✅ User notified of successful password reset');
      console.log('=========================================');

      // Store password reset event for demo purposes
      this.logPasswordResetEvent(email);

      // Set remember password preference
      localStorage.setItem('rememberPassword', 'true');
      localStorage.setItem('lastLoginEmail', email);

      return {
        success: true,
        message: 'Password has been reset successfully. You can now sign in with your new password.'
      };
    } catch (error) {
      console.error('Password reset database error:', error);
      return {
        success: false,
        message: 'Failed to reset password due to a database error. Please try again.'
      };
    }
  }

  private hashPassword(password: string): string {
    // In a real app, use bcrypt or similar
    // This is just for demo purposes
    return `$2b$10$${btoa(password).slice(0, 53)}`;
  }

  private logPasswordResetEvent(email: string): void {
    const resetEvents = JSON.parse(localStorage.getItem('passwordResetEvents') || '[]');
    resetEvents.push({
      email,
      timestamp: new Date().toISOString(),
      action: 'password_reset',
      source: 'forgot_password_flow'
    });
    
    // Keep only last 10 events for demo
    if (resetEvents.length > 10) {
      resetEvents.splice(0, resetEvents.length - 10);
    }
    
    localStorage.setItem('passwordResetEvents', JSON.stringify(resetEvents));
  }

  createDemoUserSession(): User {
    const user: User = {
      id: 'demo_student',
      email: 'demo@unicodeprep.edu',
      userType: 'student',
      userData: {
        name: 'Alex Johnson',
        email: 'demo@unicodeprep.edu',
        university: 'Demo University',
        major: 'Computer Science',
        academicYear: 'Junior',
        progress: {
          total_score: 1250,
          problems_solved: 15,
          interviews_completed: 3,
          current_streak: 5,
          longest_streak: 12,
          consistency_coins: 45,
          rank: 'silver'
        }
      }
    };

    this.currentUser = user;
    this.isDemoActive = true;
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isDemoMode', 'true');
    
    return user;
  }

  createDemoProfessorSession(): User {
    const user: User = {
      id: 'demo_professor',
      email: 'prof@unicodeprep.edu',
      userType: 'professor',
      userData: {
        name: 'Dr. Sarah Chen',
        email: 'prof@unicodeprep.edu',
        university: 'Demo University',
        department: 'Computer Science',
        title: 'Associate Professor',
        students: this.generateMockStudents()
      }
    };

    this.currentUser = user;
    this.isDemoActive = true;
    
    localStorage.setItem('currentUser', JSON.stringify(user));
    localStorage.setItem('isDemoMode', 'true');
    
    return user;
  }

  private createMockUserData(email: string, userType: 'student' | 'professor') {
    if (userType === 'student') {
      return {
        name: 'John Doe',
        email,
        university: 'Example University',
        major: 'Computer Science',
        academicYear: 'Junior',
        progress: {
          total_score: 0,
          problems_solved: 0,
          interviews_completed: 0,
          current_streak: 0,
          longest_streak: 0,
          consistency_coins: 0,
          rank: 'bronze'
        }
      };
    } else {
      return {
        name: 'Dr. Jane Smith',
        email,
        university: 'Example University',
        department: 'Computer Science',
        title: 'Professor',
        students: this.generateMockStudents()
      };
    }
  }

  private generateMockStudents() {
    return [
      {
        name: 'Emma Davis',
        email: 'emma.d@university.edu',
        major: 'Computer Science',
        academicYear: 'Senior',
        progress: {
          total_score: 2850,
          problems_solved: 45,
          interviews_completed: 8,
          current_streak: 12,
          longest_streak: 20,
          consistency_coins: 120,
          rank: 'gold'
        }
      },
      {
        name: 'Michael Zhang',
        email: 'michael.z@university.edu',
        major: 'Software Engineering',
        academicYear: 'Junior',
        progress: {
          total_score: 1980,
          problems_solved: 32,
          interviews_completed: 5,
          current_streak: 8,
          longest_streak: 15,
          consistency_coins: 85,
          rank: 'silver'
        }
      },
      {
        name: 'Sofia Martinez',
        email: 'sofia.m@university.edu',
        major: 'Computer Science',
        academicYear: 'Sophomore',
        progress: {
          total_score: 1420,
          problems_solved: 28,
          interviews_completed: 4,
          current_streak: 6,
          longest_streak: 10,
          consistency_coins: 65,
          rank: 'silver'
        }
      },
      {
        name: 'James Wilson',
        email: 'james.w@university.edu',
        major: 'Data Science',
        academicYear: 'Senior',
        progress: {
          total_score: 3200,
          problems_solved: 52,
          interviews_completed: 10,
          current_streak: 15,
          longest_streak: 25,
          consistency_coins: 150,
          rank: 'gold'
        }
      },
      {
        name: 'Aisha Patel',
        email: 'aisha.p@university.edu',
        major: 'Computer Science',
        academicYear: 'Junior',
        progress: {
          total_score: 2100,
          problems_solved: 38,
          interviews_completed: 6,
          current_streak: 9,
          longest_streak: 18,
          consistency_coins: 95,
          rank: 'silver'
        }
      }
    ];
  }

  getCurrentUser(): User | null {
    if (this.currentUser) {
      return this.currentUser;
    }

    // Try to restore from localStorage
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.currentUser = JSON.parse(stored);
        this.isDemoActive = localStorage.getItem('isDemoMode') === 'true';
        return this.currentUser;
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('isDemoMode');
      }
    }

    return null;
  }

  isDemoMode(): boolean {
    return this.isDemoActive || localStorage.getItem('isDemoMode') === 'true';
  }

  async logout(): Promise<void> {
    this.currentUser = null;
    this.isDemoActive = false;
    localStorage.removeItem('currentUser');
    localStorage.removeItem('isDemoMode');
    // Note: We don't remove rememberPassword and lastLoginEmail on logout
    // as these should persist to help user on next login
  }

  getStudentsByMajor(professorId: string): { [major: string]: any[] } {
    // In a real app, this would query the database
    // For demo purposes, return mock data organized by major
    const students = this.generateMockStudents();
    const organized: { [major: string]: any[] } = {};
    
    students.forEach(student => {
      if (!organized[student.major]) {
        organized[student.major] = [];
      }
      organized[student.major].push(student);
    });
    
    return organized;
  }

  // Get password reset events for admin/debug purposes
  getPasswordResetEvents(): any[] {
    return JSON.parse(localStorage.getItem('passwordResetEvents') || '[]');
  }

  // Set remember password preference
  setRememberPassword(remember: boolean, email?: string): void {
    if (remember && email) {
      localStorage.setItem('rememberPassword', 'true');
      localStorage.setItem('lastLoginEmail', email);
    } else {
      localStorage.removeItem('rememberPassword');
      localStorage.removeItem('lastLoginEmail');
    }
  }

  // Get remember password preference
  getRememberPassword(): { remember: boolean; email: string | null } {
    const remember = localStorage.getItem('rememberPassword') === 'true';
    const email = localStorage.getItem('lastLoginEmail');
    return { remember, email };
  }
}

export const authService = new AuthService();