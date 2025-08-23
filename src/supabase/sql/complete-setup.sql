-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable Row Level Security
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    university TEXT NOT NULL,
    college TEXT,
    user_type TEXT NOT NULL CHECK (user_type IN ('student', 'professor')),
    
    -- Student-specific fields
    major TEXT,
    year TEXT,
    progress JSONB DEFAULT '{
        "problems_solved": 0, 
        "interviews_completed": 0, 
        "study_streak": 0,
        "current_streak": 0,
        "longest_streak": 0,
        "consistency_coins": 0,
        "total_score": 0,
        "rank": "bronze",
        "badge_level": 1
    }',
    
    -- Professor-specific fields
    department TEXT,
    title TEXT,
    courses JSONB DEFAULT '[]',
    students JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table for daily activity tracking
CREATE TABLE IF NOT EXISTS public.attendance (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('coding', 'interview', 'discussion', 'recommendation')),
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    streak_count INTEGER DEFAULT 0,
    coins_earned INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date, activity_type)
);

-- Create coding_sessions table
CREATE TABLE IF NOT EXISTS public.coding_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    problem_title TEXT NOT NULL,
    problem_difficulty TEXT CHECK (problem_difficulty IN ('easy', 'medium', 'hard')),
    language TEXT NOT NULL,
    code TEXT,
    test_results JSONB,
    completed BOOLEAN DEFAULT FALSE,
    time_spent INTEGER, -- in minutes
    hints_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interview_sessions table
CREATE TABLE IF NOT EXISTS public.interview_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    experience_level TEXT NOT NULL,
    company TEXT,
    duration INTEGER, -- in minutes
    questions JSONB,
    responses JSONB,
    ai_feedback JSONB,
    overall_score INTEGER,
    confidence_rating INTEGER,
    areas_to_improve JSONB,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discussions table
CREATE TABLE IF NOT EXISTS public.discussions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    tags JSONB DEFAULT '[]',
    category TEXT,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    is_solved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create discussion_replies table
CREATE TABLE IF NOT EXISTS public.discussion_replies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    discussion_id UUID REFERENCES public.discussions(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    upvotes INTEGER DEFAULT 0,
    downvotes INTEGER DEFAULT 0,
    is_ai_response BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create learning_recommendations table
CREATE TABLE IF NOT EXISTS public.learning_recommendations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    skill_area TEXT NOT NULL,
    current_level TEXT CHECK (current_level IN ('beginner', 'intermediate', 'advanced')),
    target_level TEXT CHECK (target_level IN ('beginner', 'intermediate', 'advanced')),
    roadmap JSONB,
    progress_percentage INTEGER DEFAULT 0,
    estimated_completion_weeks INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create leaderboard_entries table for caching leaderboard data
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    university TEXT NOT NULL,
    college TEXT,
    consistency_score INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    total_coins INTEGER DEFAULT 0,
    rank_position INTEGER,
    badge_level TEXT DEFAULT 'bronze',
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable RLS on all tables
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coding_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.discussion_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create policies for attendance
CREATE POLICY "Users can view own attendance" ON public.attendance
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own attendance" ON public.attendance
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own attendance" ON public.attendance
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for coding_sessions
CREATE POLICY "Users can view own coding sessions" ON public.coding_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own coding sessions" ON public.coding_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own coding sessions" ON public.coding_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for interview_sessions
CREATE POLICY "Users can view own interview sessions" ON public.interview_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own interview sessions" ON public.interview_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own interview sessions" ON public.interview_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for discussions
CREATE POLICY "Anyone can view discussions" ON public.discussions
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create discussions" ON public.discussions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discussions" ON public.discussions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discussions" ON public.discussions
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for discussion_replies
CREATE POLICY "Anyone can view discussion replies" ON public.discussion_replies
    FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create replies" ON public.discussion_replies
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own replies" ON public.discussion_replies
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own replies" ON public.discussion_replies
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for learning_recommendations
CREATE POLICY "Users can view own recommendations" ON public.learning_recommendations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recommendations" ON public.learning_recommendations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recommendations" ON public.learning_recommendations
    FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for leaderboard_entries
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_entries
    FOR SELECT USING (true);

CREATE POLICY "System can update leaderboard" ON public.leaderboard_entries
    FOR ALL USING (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at columns
CREATE TRIGGER handle_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_discussions
    BEFORE UPDATE ON public.discussions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_updated_at_learning_recommendations
    BEFORE UPDATE ON public.learning_recommendations
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Create function to update leaderboard
CREATE OR REPLACE FUNCTION public.update_leaderboard()
RETURNS VOID AS $$
BEGIN
    -- Delete existing entries
    DELETE FROM public.leaderboard_entries;
    
    -- Insert updated leaderboard data
    INSERT INTO public.leaderboard_entries (
        user_id, name, university, college, consistency_score, 
        current_streak, total_coins, badge_level
    )
    SELECT 
        up.id,
        up.name,
        up.university,
        up.college,
        COALESCE((up.progress->>'total_score')::INTEGER, 0) as consistency_score,
        COALESCE((up.progress->>'current_streak')::INTEGER, 0) as current_streak,
        COALESCE((up.progress->>'consistency_coins')::INTEGER, 0) as total_coins,
        COALESCE(up.progress->>'rank', 'bronze') as badge_level
    FROM public.user_profiles up
    WHERE up.user_type = 'student'
    ORDER BY consistency_score DESC
    LIMIT 100;
    
    -- Update rank positions
    UPDATE public.leaderboard_entries 
    SET rank_position = sub.row_num
    FROM (
        SELECT id, ROW_NUMBER() OVER (ORDER BY consistency_score DESC) as row_num
        FROM public.leaderboard_entries
    ) sub
    WHERE leaderboard_entries.id = sub.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update user streak and coins
CREATE OR REPLACE FUNCTION public.update_user_progress(
    p_user_id UUID,
    p_activity_type TEXT,
    p_completed BOOLEAN DEFAULT TRUE
)
RETURNS VOID AS $$
DECLARE
    current_progress JSONB;
    current_streak INTEGER;
    coins_to_add INTEGER;
    new_total_coins INTEGER;
    new_total_score INTEGER;
BEGIN
    -- Get current progress
    SELECT progress INTO current_progress 
    FROM public.user_profiles 
    WHERE id = p_user_id;
    
    IF current_progress IS NULL THEN
        current_progress := '{
            "problems_solved": 0, 
            "interviews_completed": 0, 
            "study_streak": 0,
            "current_streak": 0,
            "longest_streak": 0,
            "consistency_coins": 0,
            "total_score": 0,
            "rank": "bronze",
            "badge_level": 1
        }';
    END IF;
    
    current_streak := COALESCE((current_progress->>'current_streak')::INTEGER, 0);
    
    IF p_completed THEN
        -- Increment streak and calculate coins
        current_streak := current_streak + 1;
        coins_to_add := CASE 
            WHEN current_streak <= 7 THEN 10
            WHEN current_streak <= 14 THEN 20
            WHEN current_streak <= 30 THEN 40
            ELSE 80
        END;
        
        -- Update activity count
        CASE p_activity_type
            WHEN 'coding' THEN
                current_progress := jsonb_set(current_progress, '{problems_solved}', 
                    to_jsonb(COALESCE((current_progress->>'problems_solved')::INTEGER, 0) + 1));
            WHEN 'interview' THEN
                current_progress := jsonb_set(current_progress, '{interviews_completed}', 
                    to_jsonb(COALESCE((current_progress->>'interviews_completed')::INTEGER, 0) + 1));
        END CASE;
        
        -- Update progress
        new_total_coins := COALESCE((current_progress->>'consistency_coins')::INTEGER, 0) + coins_to_add;
        new_total_score := COALESCE((current_progress->>'total_score')::INTEGER, 0) + coins_to_add;
        
        current_progress := jsonb_set(current_progress, '{current_streak}', to_jsonb(current_streak));
        current_progress := jsonb_set(current_progress, '{longest_streak}', 
            to_jsonb(GREATEST(current_streak, COALESCE((current_progress->>'longest_streak')::INTEGER, 0))));
        current_progress := jsonb_set(current_progress, '{consistency_coins}', to_jsonb(new_total_coins));
        current_progress := jsonb_set(current_progress, '{total_score}', to_jsonb(new_total_score));
        
        -- Update rank based on total score
        current_progress := jsonb_set(current_progress, '{rank}', to_jsonb(
            CASE 
                WHEN new_total_score >= 10000 THEN 'diamond'
                WHEN new_total_score >= 5000 THEN 'platinum'
                WHEN new_total_score >= 2000 THEN 'gold'
                WHEN new_total_score >= 500 THEN 'silver'
                ELSE 'bronze'
            END
        ));
        
        -- Insert/update attendance record
        INSERT INTO public.attendance (user_id, date, activity_type, completed, completed_at, streak_count, coins_earned)
        VALUES (p_user_id, CURRENT_DATE, p_activity_type, TRUE, NOW(), current_streak, coins_to_add)
        ON CONFLICT (user_id, date, activity_type) 
        DO UPDATE SET 
            completed = TRUE, 
            completed_at = NOW(), 
            streak_count = current_streak,
            coins_earned = coins_to_add;
    ELSE
        -- Reset streak to 0
        current_progress := jsonb_set(current_progress, '{current_streak}', to_jsonb(0));
        
        -- Insert/update attendance record as missed
        INSERT INTO public.attendance (user_id, date, activity_type, completed, streak_count, coins_earned)
        VALUES (p_user_id, CURRENT_DATE, p_activity_type, FALSE, 0, 0)
        ON CONFLICT (user_id, date, activity_type) 
        DO UPDATE SET completed = FALSE, streak_count = 0, coins_earned = 0;
    END IF;
    
    -- Update user profile
    UPDATE public.user_profiles 
    SET progress = current_progress, updated_at = NOW()
    WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_user_date ON public.attendance(user_id, date);
CREATE INDEX IF NOT EXISTS idx_coding_sessions_user ON public.coding_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_sessions_user ON public.interview_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_discussions_created_at ON public.discussions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leaderboard_score ON public.leaderboard_entries(consistency_score DESC);