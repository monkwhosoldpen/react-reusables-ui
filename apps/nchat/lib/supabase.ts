import { createClient } from '@supabase/supabase-js';
import { Database } from './types/database.types';

export const GlobalSupabaseUrl = "https://anktghprsqjeynpynzfs.supabase.co";
export const GlobalsupabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFua3RnaHByc3FqZXlucHluemZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY2NzQxNjAsImV4cCI6MjA1MjI1MDE2MH0.-AbMiJKycjgJ19kDl8q80JY_ufn37itC3Jdaad3uQME";

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
