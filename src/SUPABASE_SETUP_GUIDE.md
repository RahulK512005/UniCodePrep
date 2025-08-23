# Complete Supabase Setup Guide for UniCodePrep

## Prerequisites
- A Supabase account (sign up at https://supabase.com)
- Your Gemini API key: `AIzaSyCw7ds6fpOFSxhIYhfZKW-UM-siuXNiQ_M`

## Step 1: Create a New Supabase Project

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Choose your organization
4. Set up your project:
   - **Name**: UniCodePrep
   - **Database Password**: Choose a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Free tier is sufficient for development

## Step 2: Get Your Project Credentials

1. After project creation, go to **Settings > API**
2. Copy the following values:
   - **Project URL** (under Project URL)
   - **Anon Key** (under Project API keys - anon/public)

## Step 3: Configure Environment Variables

1. Create a `.env.local` file in your project root:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url-here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
GEMINI_API_KEY=AIzaSyCw7ds6fpOFSxhIYhfZKW-UM-siuXNiQ_M
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

2. Replace the placeholder values with your actual Supabase credentials

## Step 4: Set Up Database Schema

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire contents of `/supabase/sql/complete-setup.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the script

This will create all necessary tables:
- `user_profiles` - Student and professor profiles
- `attendance` - Daily activity tracking
- `coding_sessions` - Coding practice records
- `interview_sessions` - AI interview records
- `discussions` - Forum discussions
- `discussion_replies` - Discussion responses
- `learning_recommendations` - Personalized roadmaps
- `leaderboard_entries` - Cached leaderboard data

## Step 5: Configure Authentication

1. Go to **Authentication > Settings**
2. Configure the following:

### Site URL Configuration
- **Site URL**: `http://localhost:3000` (for development)
- **Redirect URLs**: Add `http://localhost:3000` and any other domains you'll use

### Email Settings
For development, you can disable email confirmation:
- **Enable email confirmations**: OFF
- **Enable email change confirmations**: OFF

For production, configure your email provider (Resend, SendGrid, etc.)

### Auth Providers
- **Email**: Enabled (default)
- **Phone**: Disabled (optional)
- **Third-party providers**: Configure as needed (Google, GitHub, etc.)

## Step 6: Set Up Row Level Security (RLS)

The SQL script automatically configures RLS policies, but here's what it does:

### Security Features:
- ✅ Users can only access their own data
- ✅ Public read access for discussions and leaderboard
- ✅ Professors can manage their courses
- ✅ Students can track their progress
- ✅ Secure data isolation between users

## Step 7: Test Database Connection

1. Start your development server: `npm run dev`
2. Try creating a student account
3. Try creating a professor account
4. Check the Supabase dashboard **Table Editor** to see if profiles are created

## Step 8: Verify All Features

### Test Checklist:
- [ ] **Authentication**: Sign up, sign in, sign out
- [ ] **User Profiles**: Student and professor registration
- [ ] **Attendance Tracking**: Daily activity completion
- [ ] **Coding Sessions**: Practice problem tracking
- [ ] **Interview Sessions**: AI interview recording
- [ ] **Discussions**: Create and reply to discussions
- [ ] **Leaderboard**: View rankings and scores
- [ ] **Learning Recommendations**: Create and track roadmaps

## Step 9: Production Deployment

When deploying to production:

1. **Update Environment Variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-production-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
   NEXT_PUBLIC_APP_URL=https://your-domain.com
   ```

2. **Update Supabase Auth Settings**:
   - **Site URL**: `https://your-domain.com`
   - **Redirect URLs**: Add your production domain

3. **Enable Email Confirmations**: Turn ON for production security

## Database Functions Available

Your setup includes these powerful functions:

### `update_user_progress(user_id, activity_type, completed)`
- Automatically updates streaks and coins
- Calculates rank progression
- Handles attendance tracking

### `update_leaderboard()`
- Refreshes the top 100 leaderboard
- Calculates consistency scores
- Updates rank positions

## Troubleshooting

### Common Issues:

1. **"Invalid API key"**: Check your environment variables
2. **"Table doesn't exist"**: Run the SQL setup script
3. **"Permission denied"**: Check RLS policies
4. **"Cannot read user"**: Verify authentication is working

### Debug Commands:

```javascript
// Test database connection
import { supabase } from './utils/supabase/client'
const { data, error } = await supabase.from('user_profiles').select('count')
console.log(data, error)

// Test authentication
const user = await supabase.auth.getUser()
console.log(user)
```

## Data Migration (if needed)

If you have existing user data:

1. Export from your current system
2. Use Supabase's CSV import feature
3. Or create a migration script using the Supabase client

## Backup and Recovery

Supabase automatically backs up your database, but for additional safety:

1. **Regular Exports**: Use Supabase's backup feature
2. **Version Control**: Keep your SQL schema in git
3. **Environment Separation**: Use separate projects for dev/staging/prod

## Monitoring and Analytics

Monitor your application through:

1. **Supabase Dashboard**: Real-time database metrics
2. **Authentication logs**: User activity tracking
3. **Performance insights**: Query performance monitoring

## Security Best Practices

- ✅ Row Level Security enabled
- ✅ API keys properly configured
- ✅ Environment variables secured
- ✅ Email confirmation for production
- ✅ Proper authentication flows

Your UniCodePrep platform is now fully connected to Supabase with:
- Real user authentication
- Persistent data storage
- Attendance tracking with streaks
- Leaderboard with rankings
- AI interview session storage
- Discussion forum data
- Learning recommendation tracking

## Support

If you encounter issues:
1. Check the Supabase logs in your dashboard
2. Review the browser console for errors
3. Verify environment variables are loaded
4. Test database connection manually

Your platform should now be fully functional with real data persistence!