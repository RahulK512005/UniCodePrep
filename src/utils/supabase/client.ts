import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Database type definitions
export interface UserProfile {
  id: string
  email: string
  name: string
  university: string
  college?: string
  user_type: 'student' | 'professor'
  major?: string
  year?: string
  progress?: {
    problems_solved: number
    interviews_completed: number
    study_streak: number
    current_streak: number
    longest_streak: number
    consistency_coins: number
    total_score: number
    rank: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
    badge_level: number
  }
  department?: string
  title?: string
  courses?: string[]
  students?: string[]
  created_at?: string
  updated_at?: string
}

export interface AttendanceRecord {
  id: string
  user_id: string
  date: string
  activity_type: 'coding' | 'interview' | 'discussion' | 'recommendation'
  completed: boolean
  completed_at?: string
  streak_count: number
  coins_earned: number
  created_at: string
}

export interface CodingSession {
  id: string
  user_id: string
  problem_title: string
  problem_difficulty: 'easy' | 'medium' | 'hard'
  language: string
  code?: string
  test_results?: any
  completed: boolean
  time_spent?: number
  hints_used: number
  created_at: string
}

export interface InterviewSession {
  id: string
  user_id: string
  role: string
  experience_level: string
  company?: string
  duration?: number
  questions?: any
  responses?: any
  ai_feedback?: any
  overall_score?: number
  confidence_rating?: number
  areas_to_improve?: any
  completed: boolean
  created_at: string
}

export interface Discussion {
  id: string
  user_id: string
  title: string
  content: string
  tags: string[]
  category?: string
  upvotes: number
  downvotes: number
  view_count: number
  is_solved: boolean
  created_at: string
  updated_at: string
}

export interface DiscussionReply {
  id: string
  discussion_id: string
  user_id: string
  content: string
  upvotes: number
  downvotes: number
  is_ai_response: boolean
  created_at: string
}

export interface LearningRecommendation {
  id: string
  user_id: string
  skill_area: string
  current_level: 'beginner' | 'intermediate' | 'advanced'
  target_level: 'beginner' | 'intermediate' | 'advanced'
  roadmap?: any
  progress_percentage: number
  estimated_completion_weeks?: number
  created_at: string
  updated_at: string
}

export interface LeaderboardEntry {
  id: string
  user_id: string
  name: string
  university: string
  college?: string
  consistency_score: number
  current_streak: number
  total_coins: number
  rank_position?: number
  badge_level: string
  last_updated: string
}

// Authentication helpers
export const auth = {
  signUp: async (email: string, password: string, userData: Partial<UserProfile>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (error) throw error
    
    if (data.user) {
      // Create user profile
      const { error: profileError } = await supabase
        .from('user_profiles')
        .insert({
          id: data.user.id,
          email: userData.email || email,
          name: userData.name || '',
          university: userData.university || '',
          college: userData.college || '',
          user_type: userData.user_type || 'student',
          major: userData.major,
          year: userData.year,
          department: userData.department,
          title: userData.title,
        })
      
      if (profileError) throw profileError
    }
    
    return data
  },

  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    
    if (error) throw error
    return data
  },

  signOut: async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },

  getCurrentUserProfile: async () => {
    const user = await auth.getCurrentUser()
    if (!user) return null
    
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    
    if (error) throw error
    return data as UserProfile
  }
}

// Database helpers
export const db = {
  // Attendance functions
  updateUserProgress: async (userId: string, activityType: string, completed: boolean = true) => {
    const { error } = await supabase.rpc('update_user_progress', {
      p_user_id: userId,
      p_activity_type: activityType,
      p_completed: completed
    })
    
    if (error) throw error
  },

  getAttendanceRecords: async (userId: string, startDate?: string, endDate?: string) => {
    let query = supabase
      .from('attendance')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })
    
    if (startDate) query = query.gte('date', startDate)
    if (endDate) query = query.lte('date', endDate)
    
    const { data, error } = await query
    if (error) throw error
    return data as AttendanceRecord[]
  },

  // Coding session functions
  createCodingSession: async (session: Omit<CodingSession, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('coding_sessions')
      .insert(session)
      .select()
      .single()
    
    if (error) throw error
    return data as CodingSession
  },

  getCodingSessions: async (userId: string) => {
    const { data, error } = await supabase
      .from('coding_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as CodingSession[]
  },

  // Interview session functions
  createInterviewSession: async (session: Omit<InterviewSession, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('interview_sessions')
      .insert(session)
      .select()
      .single()
    
    if (error) throw error
    return data as InterviewSession
  },

  getInterviewSessions: async (userId: string) => {
    const { data, error } = await supabase
      .from('interview_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as InterviewSession[]
  },

  // Discussion functions
  createDiscussion: async (discussion: Omit<Discussion, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('discussions')
      .insert(discussion)
      .select()
      .single()
    
    if (error) throw error
    return data as Discussion
  },

  getDiscussions: async (limit = 50) => {
    const { data, error } = await supabase
      .from('discussions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as Discussion[]
  },

  createDiscussionReply: async (reply: Omit<DiscussionReply, 'id' | 'created_at'>) => {
    const { data, error } = await supabase
      .from('discussion_replies')
      .insert(reply)
      .select()
      .single()
    
    if (error) throw error
    return data as DiscussionReply
  },

  getDiscussionReplies: async (discussionId: string) => {
    const { data, error } = await supabase
      .from('discussion_replies')
      .select('*')
      .eq('discussion_id', discussionId)
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data as DiscussionReply[]
  },

  // Leaderboard functions
  updateLeaderboard: async () => {
    const { error } = await supabase.rpc('update_leaderboard')
    if (error) throw error
  },

  getLeaderboard: async (limit = 100) => {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .order('consistency_score', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data as LeaderboardEntry[]
  },

  // Learning recommendation functions
  createLearningRecommendation: async (recommendation: Omit<LearningRecommendation, 'id' | 'created_at' | 'updated_at'>) => {
    const { data, error } = await supabase
      .from('learning_recommendations')
      .insert(recommendation)
      .select()
      .single()
    
    if (error) throw error
    return data as LearningRecommendation
  },

  getLearningRecommendations: async (userId: string) => {
    const { data, error } = await supabase
      .from('learning_recommendations')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data as LearningRecommendation[]
  }
}