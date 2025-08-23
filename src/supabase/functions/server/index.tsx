import { Hono } from 'npm:hono';
import { cors } from 'npm:hono/cors';
import { logger } from 'npm:hono/logger';
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as kv from './kv_store.tsx';

const app = new Hono();

app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

app.use('*', logger(console.log));

const supabase = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

// Student signup
app.post('/make-server-388b925d/signup/student', async (c) => {
  try {
    const { email, password, name, university, major, year } = await c.req.json();
    
    console.log('Creating student account:', { email, name });
    
    // Create user in Supabase Auth directly - let Supabase handle duplicate checking
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        university,
        major,
        year,
        user_type: 'student'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log('Auth error creating student:', authError);
      
      // Handle specific Supabase auth errors
      if (authError.message.includes('already been registered') || 
          authError.message.includes('already exists') ||
          authError.message.includes('User already registered')) {
        return c.json({ 
          error: 'An account with this email address already exists. Please try logging in instead.',
          code: 'USER_EXISTS'
        }, 400);
      }
      
      return c.json({ error: `Failed to create account: ${authError.message}` }, 400);
    }

    // Store student data in KV store
    const studentData = {
      id: authData.user.id,
      email,
      name,
      university,
      major,
      year,
      user_type: 'student',
      created_at: new Date().toISOString(),
      progress: {
        problems_solved: 0,
        interviews_completed: 0,
        study_streak: 0
      }
    };

    await kv.set(`student:${authData.user.id}`, studentData);
    
    console.log('Student account created successfully:', authData.user.id);
    return c.json({ 
      success: true, 
      user: { 
        id: authData.user.id, 
        email: authData.user.email,
        user_type: 'student'
      } 
    });
    
  } catch (error) {
    console.log('Error creating student account:', error);
    return c.json({ error: `Server error during student signup: ${error}` }, 500);
  }
});

// Professor signup
app.post('/make-server-388b925d/signup/professor', async (c) => {
  try {
    const { email, password, name, university, department, title } = await c.req.json();
    
    console.log('Creating professor account:', { email, name });
    
    // Create user in Supabase Auth directly - let Supabase handle duplicate checking
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { 
        name,
        university,
        department,
        title,
        user_type: 'professor'
      },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });

    if (authError) {
      console.log('Auth error creating professor:', authError);
      
      // Handle specific Supabase auth errors
      if (authError.message.includes('already been registered') || 
          authError.message.includes('already exists') ||
          authError.message.includes('User already registered')) {
        return c.json({ 
          error: 'An account with this email address already exists. Please try logging in instead.',
          code: 'USER_EXISTS'
        }, 400);
      }
      
      return c.json({ error: `Failed to create account: ${authError.message}` }, 400);
    }

    // Store professor data in KV store
    const professorData = {
      id: authData.user.id,
      email,
      name,
      university,
      department,
      title,
      user_type: 'professor',
      created_at: new Date().toISOString(),
      courses: [],
      students: []
    };

    await kv.set(`professor:${authData.user.id}`, professorData);
    
    console.log('Professor account created successfully:', authData.user.id);
    return c.json({ 
      success: true, 
      user: { 
        id: authData.user.id, 
        email: authData.user.email,
        user_type: 'professor'
      } 
    });
    
  } catch (error) {
    console.log('Error creating professor account:', error);
    return c.json({ error: `Server error during professor signup: ${error}` }, 500);
  }
});

// Login endpoint (works for both students and professors)
app.post('/make-server-388b925d/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    console.log('Login attempt for:', email);
    
    // Try to sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      console.log('Login error:', authError);
      
      // Handle common auth errors with user-friendly messages
      if (authError.message.includes('Invalid login credentials')) {
        return c.json({ error: 'Invalid email or password. Please check your credentials and try again.' }, 401);
      } else if (authError.message.includes('Email not confirmed')) {
        return c.json({ error: 'Please confirm your email address before logging in.' }, 401);
      } else if (authError.message.includes('Too many requests')) {
        return c.json({ error: 'Too many login attempts. Please wait a moment and try again.' }, 429);
      }
      
      return c.json({ error: `Login failed: ${authError.message}` }, 401);
    }

    // Get user metadata to determine if student or professor
    const userType = authData.user.user_metadata?.user_type;
    
    // Retrieve full user data from KV store
    let userData;
    if (userType === 'student') {
      userData = await kv.get(`student:${authData.user.id}`);
    } else if (userType === 'professor') {
      userData = await kv.get(`professor:${authData.user.id}`);
    }
    
    console.log('Login successful for:', email, 'Type:', userType);
    return c.json({ 
      success: true, 
      user: {
        id: authData.user.id,
        email: authData.user.email,
        user_type: userType,
        access_token: authData.session.access_token,
        userData
      }
    });
    
  } catch (error) {
    console.log('Error during login:', error);
    return c.json({ error: `Server error during login: ${error}` }, 500);
  }
});

// Get user profile (requires authentication)
app.get('/make-server-388b925d/profile', async (c) => {
  try {
    const accessToken = c.req.header('Authorization')?.split(' ')[1];
    
    if (!accessToken) {
      return c.json({ error: 'No access token provided' }, 401);
    }
    
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    if (error || !user?.id) {
      console.log('Profile fetch auth error:', error);
      return c.json({ error: 'Invalid or expired access token' }, 401);
    }

    const userType = user.user_metadata?.user_type;
    let userData;
    
    if (userType === 'student') {
      userData = await kv.get(`student:${user.id}`);
    } else if (userType === 'professor') {
      userData = await kv.get(`professor:${user.id}`);
    }

    return c.json({ success: true, userData });
    
  } catch (error) {
    console.log('Error getting profile:', error);
    return c.json({ error: `Server error getting profile: ${error}` }, 500);
  }
});

// Health check
app.get('/make-server-388b925d/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Test endpoint to check if admin functions work
app.get('/make-server-388b925d/test-admin', async (c) => {
  try {
    // Test if we can list users (admin function)
    const { data, error } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
    
    if (error) {
      return c.json({ 
        error: 'Admin functions not available', 
        details: error.message,
        suggestion: 'Make sure SUPABASE_SERVICE_ROLE_KEY is correctly set'
      }, 500);
    }
    
    return c.json({ 
      success: true, 
      message: 'Admin functions are working correctly',
      userCount: data.users?.length || 0
    });
    
  } catch (error) {
    return c.json({ 
      error: 'Test failed', 
      details: error.toString()
    }, 500);
  }
});

Deno.serve(app.fetch);