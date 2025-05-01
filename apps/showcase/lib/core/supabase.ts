import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ilzjdtlikhhavnfzfnvj.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlsempkdGxpa2hoYXZuZnpmbnZqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwODAzODksImV4cCI6MjA1NTY1NjM4OX0.dweaUpbV3YQvQK4VFCQYAeTSLW_FRVKeeLyZbJ8x5oQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);