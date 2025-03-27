import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';

export const GlobalSupabaseUrl = "https://risbemjewosmlvzntjkd.supabase.co";
export const GlobalsupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpc2JlbWpld29zbWx2em50amtkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzIxNDIsImV4cCI6MjA1NTcwODE0Mn0._5wXtDjCr9ZnYatWD7RO5DNhx_YxUjqCcdc6qhZpwGM";

// Create a single instance of the Supabase client
export const supabase = createClient<Database>(GlobalSupabaseUrl, GlobalsupabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
});
