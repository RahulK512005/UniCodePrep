import { User } from './auth';

export interface ProblemSubmission {
  problemId: string;
  code: string;
  language: string;
  status: 'passed' | 'failed' | 'pending';
  testResults: TestResult[];
  submittedAt: Date;
  executionTime?: number;
  memoryUsed?: number;
}

export interface TestResult {
  input: string;
  expectedOutput: string;
  actualOutput: string;
  passed: boolean;
  executionTime: number;
}

export interface ProblemProgress {
  problemId: string;
  status: 'not_started' | 'attempted' | 'solved';
  submissions: ProblemSubmission[];
  firstAttemptDate?: Date;
  solvedDate?: Date;
  bestSubmission?: ProblemSubmission;
}

export interface InterviewProgress {
  sessionId: string;
  type: 'technical' | 'behavioral' | 'system_design';
  difficulty: 'easy' | 'medium' | 'hard';
  duration: number;
  score: number;
  feedback: string;
  completedAt: Date;
  questions: Array<{
    question: string;
    answer: string;
    rating: number;
  }>;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD format
  problemsSolved: number;
  interviewsCompleted: number;
  timeSpent: number; // in minutes
  activitiesCompleted: string[]; // list of activity IDs
}

export interface UserProgress {
  userId: string;
  problemsProgress: { [problemId: string]: ProblemProgress };
  interviewsProgress: InterviewProgress[];
  dailyActivities: { [date: string]: DailyActivity };
  totalScore: number;
  currentStreak: number;
  longestStreak: number;
  consistencyCoins: number;
  rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  lastActivityDate?: string;
  statistics: {
    problemsSolved: number;
    problemsAttempted: number;
    interviewsCompleted: number;
    totalTimeSpent: number;
    averageScore: number;
  };
}

class ProgressTracker {
  private static instance: ProgressTracker;
  private currentUser: User | null = null;
  private userProgress: UserProgress | null = null;

  static getInstance(): ProgressTracker {
    if (!ProgressTracker.instance) {
      ProgressTracker.instance = new ProgressTracker();
    }
    return ProgressTracker.instance;
  }

  setCurrentUser(user: User) {
    this.currentUser = user;
    this.loadUserProgress();
  }

  private loadUserProgress() {
    if (!this.currentUser) return;

    const storageKey = `progress_${this.currentUser.id}`;
    const stored = localStorage.getItem(storageKey);
    
    if (stored) {
      try {
        this.userProgress = JSON.parse(stored);
        // Convert date strings back to Date objects
        this.convertDatesFromStorage();
      } catch (error) {
        console.error('Error loading progress:', error);
        this.initializeUserProgress();
      }
    } else {
      this.initializeUserProgress();
    }
  }

  private convertDatesFromStorage() {
    if (!this.userProgress) return;

    // Convert submission dates
    Object.values(this.userProgress.problemsProgress).forEach(problem => {
      if (problem.firstAttemptDate) {
        problem.firstAttemptDate = new Date(problem.firstAttemptDate);
      }
      if (problem.solvedDate) {
        problem.solvedDate = new Date(problem.solvedDate);
      }
      problem.submissions.forEach(submission => {
        submission.submittedAt = new Date(submission.submittedAt);
      });
    });

    // Convert interview dates
    this.userProgress.interviewsProgress.forEach(interview => {
      interview.completedAt = new Date(interview.completedAt);
    });
  }

  private initializeUserProgress() {
    if (!this.currentUser) return;

    this.userProgress = {
      userId: this.currentUser.id,
      problemsProgress: {},
      interviewsProgress: [],
      dailyActivities: {},
      totalScore: 0,
      currentStreak: 0,
      longestStreak: 0,
      consistencyCoins: 0,
      rank: 'bronze',
      statistics: {
        problemsSolved: 0,
        problemsAttempted: 0,
        interviewsCompleted: 0,
        totalTimeSpent: 0,
        averageScore: 0
      }
    };
    this.saveProgress();
  }

  private saveProgress() {
    if (!this.currentUser || !this.userProgress) return;

    const storageKey = `progress_${this.currentUser.id}`;
    localStorage.setItem(storageKey, JSON.stringify(this.userProgress));

    // Also update the user's data in auth service
    if (this.currentUser.userData) {
      this.currentUser.userData.progress = {
        total_score: this.userProgress.totalScore,
        problems_solved: this.userProgress.statistics.problemsSolved,
        interviews_completed: this.userProgress.statistics.interviewsCompleted,
        current_streak: this.userProgress.currentStreak,
        longest_streak: this.userProgress.longestStreak,
        consistency_coins: this.userProgress.consistencyCoins,
        rank: this.userProgress.rank
      };
    }
  }

  getUserProgress(): UserProgress | null {
    return this.userProgress;
  }

  getProblemProgress(problemId: string): ProblemProgress {
    if (!this.userProgress) {
      throw new Error('User progress not initialized');
    }

    if (!this.userProgress.problemsProgress[problemId]) {
      this.userProgress.problemsProgress[problemId] = {
        problemId,
        status: 'not_started',
        submissions: []
      };
    }

    return this.userProgress.problemsProgress[problemId];
  }

  submitProblemSolution(
    problemId: string,
    code: string,
    language: string,
    testResults: TestResult[]
  ): ProblemSubmission {
    if (!this.userProgress) {
      throw new Error('User progress not initialized');
    }

    const problemProgress = this.getProblemProgress(problemId);
    const allTestsPassed = testResults.every(result => result.passed);
    
    const submission: ProblemSubmission = {
      problemId,
      code,
      language,
      status: allTestsPassed ? 'passed' : 'failed',
      testResults,
      submittedAt: new Date(),
      executionTime: testResults.reduce((sum, result) => sum + result.executionTime, 0),
      memoryUsed: Math.random() * 50 + 10 // Mock memory usage
    };

    // Add submission to history
    problemProgress.submissions.push(submission);

    // Update problem status
    if (problemProgress.status === 'not_started') {
      problemProgress.status = 'attempted';
      problemProgress.firstAttemptDate = new Date();
      this.userProgress.statistics.problemsAttempted++;
    }

    if (allTestsPassed && problemProgress.status !== 'solved') {
      problemProgress.status = 'solved';
      problemProgress.solvedDate = new Date();
      problemProgress.bestSubmission = submission;
      this.userProgress.statistics.problemsSolved++;
      
      // Award points for solving
      this.awardPoints(100);
      
      // Mark attendance for today
      this.markAttendanceForToday('problem_solved');
    }

    this.saveProgress();
    return submission;
  }

  completeInterview(interviewData: Omit<InterviewProgress, 'sessionId' | 'completedAt'>): InterviewProgress {
    if (!this.userProgress) {
      throw new Error('User progress not initialized');
    }

    const interview: InterviewProgress = {
      ...interviewData,
      sessionId: `interview_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      completedAt: new Date()
    };

    this.userProgress.interviewsProgress.push(interview);
    this.userProgress.statistics.interviewsCompleted++;
    
    // Award points based on score
    this.awardPoints(Math.round(interview.score * 10));
    
    // Mark attendance for today
    this.markAttendanceForToday('interview_completed');
    
    this.saveProgress();
    return interview;
  }

  private awardPoints(points: number) {
    if (!this.userProgress) return;

    this.userProgress.totalScore += points;
    
    // Update rank based on total score
    if (this.userProgress.totalScore >= 10000) {
      this.userProgress.rank = 'diamond';
    } else if (this.userProgress.totalScore >= 5000) {
      this.userProgress.rank = 'platinum';
    } else if (this.userProgress.totalScore >= 2500) {
      this.userProgress.rank = 'gold';
    } else if (this.userProgress.totalScore >= 1000) {
      this.userProgress.rank = 'silver';
    } else {
      this.userProgress.rank = 'bronze';
    }

    // Update statistics
    const totalActivities = this.userProgress.statistics.problemsSolved + this.userProgress.statistics.interviewsCompleted;
    if (totalActivities > 0) {
      this.userProgress.statistics.averageScore = this.userProgress.totalScore / totalActivities;
    }
  }

  private markAttendanceForToday(activityType: string) {
    if (!this.userProgress) return;

    const today = new Date().toISOString().split('T')[0];
    
    if (!this.userProgress.dailyActivities[today]) {
      this.userProgress.dailyActivities[today] = {
        date: today,
        problemsSolved: 0,
        interviewsCompleted: 0,
        timeSpent: 0,
        activitiesCompleted: []
      };
    }

    const dailyActivity = this.userProgress.dailyActivities[today];
    
    if (!dailyActivity.activitiesCompleted.includes(activityType)) {
      dailyActivity.activitiesCompleted.push(activityType);
    }

    if (activityType === 'problem_solved') {
      dailyActivity.problemsSolved++;
    } else if (activityType === 'interview_completed') {
      dailyActivity.interviewsCompleted++;
    }

    // Update streak
    this.updateStreak(today);
    
    // Award consistency coins (doubled based on streak)
    const coinsToAward = Math.max(1, Math.floor(this.userProgress.currentStreak / 2)) * 2;
    this.userProgress.consistencyCoins += coinsToAward;
  }

  private updateStreak(today: string) {
    if (!this.userProgress) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    if (this.userProgress.lastActivityDate === yesterdayStr || !this.userProgress.lastActivityDate) {
      // Continue streak
      this.userProgress.currentStreak++;
    } else if (this.userProgress.lastActivityDate !== today) {
      // Streak broken, reset to 1
      this.userProgress.currentStreak = 1;
    }

    // Update longest streak
    if (this.userProgress.currentStreak > this.userProgress.longestStreak) {
      this.userProgress.longestStreak = this.userProgress.currentStreak;
    }

    this.userProgress.lastActivityDate = today;
  }

  getAttendanceData(): { [date: string]: boolean } {
    if (!this.userProgress) return {};

    const attendanceData: { [date: string]: boolean } = {};
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      attendanceData[dateKey] = !!this.userProgress.dailyActivities[dateKey]?.activitiesCompleted.length;
    }

    return attendanceData;
  }

  getSubmissionHistory(problemId?: string): ProblemSubmission[] {
    if (!this.userProgress) return [];

    if (problemId) {
      const problemProgress = this.userProgress.problemsProgress[problemId];
      return problemProgress ? problemProgress.submissions : [];
    }

    // Return all submissions across all problems
    return Object.values(this.userProgress.problemsProgress)
      .flatMap(problem => problem.submissions)
      .sort((a, b) => b.submittedAt.getTime() - a.submittedAt.getTime());
  }

  clearUserProgress() {
    if (!this.currentUser) return;
    
    const storageKey = `progress_${this.currentUser.id}`;
    localStorage.removeItem(storageKey);
    this.userProgress = null;
    this.currentUser = null;
  }

  // Helper method to simulate problem execution
  executeCode(code: string, language: string, testCases: Array<{input: string, expectedOutput: string}>): TestResult[] {
    // This is a mock implementation - in a real app, this would call a backend service
    return testCases.map(testCase => {
      const executionTime = Math.random() * 100 + 50; // Random execution time
      const passed = Math.random() > 0.3; // 70% chance of passing for demo
      
      return {
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: passed ? testCase.expectedOutput : 'Wrong Answer',
        passed,
        executionTime
      };
    });
  }
}

export const progressTracker = ProgressTracker.getInstance();