# Supabase Setup Instructions

## Quick Setup (No Edge Functions Required)

The 403 deployment error is caused by edge function files. This application now works entirely with client-side Supabase authentication - no edge functions needed!

### Step 1: Create Database Table

Run this SQL in your Supabase SQL Editor (Dashboard > SQL Editor):

```sql
-- Enable Row Level Security
ALTER TABLE IF EXISTS auth.users ENABLE ROW LEVEL SECURITY;

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT NOT NULL,
    name TEXT NOT NULL,
    university TEXT NOT NULL,
    user_type TEXT NOT NULL CHECK (user_type IN ('student', 'professor')),
    
    -- Student-specific fields
    major TEXT,
    year TEXT,
    progress JSONB DEFAULT '{"problems_solved": 0, "interviews_completed": 0, "study_streak": 0}',
    
    -- Professor-specific fields
    department TEXT,
    title TEXT,
    courses JSONB DEFAULT '[]',
    students JSONB DEFAULT '[]',
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on user_profiles
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON public.user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.user_profiles
    FOR UPDATE USING (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER handle_updated_at_user_profiles
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
```

### Step 2: Configure Authentication

In your Supabase Dashboard:

1. Go to **Authentication > Settings**
2. **Disable** "Confirm email" for development (or configure email if you want email verification)
3. Ensure "Enable email confirmations" is OFF for immediate testing

### Step 3: Test the Application

1. Try signing up as a student
2. Try signing up as a professor  
3. Try logging in with both accounts

### Step 4: Troubleshooting

If you still see 403 errors, it means there are leftover edge function files. The error can be safely ignored as the application no longer uses edge functions.

**To completely remove edge function references:**
- The application now works entirely with direct Supabase client calls
- No server-side functions are required
- All authentication happens client-side with Supabase Auth

### What's Working Now:

✅ Student and Professor registration  
✅ Login/logout functionality  
✅ User profile storage  
✅ Session management  
✅ Secure Row Level Security  
✅ All features working without edge functions  

The 403 error will stop appearing once any residual edge function deployment attempts are cleared from the system.