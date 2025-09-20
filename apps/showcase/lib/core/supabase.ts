import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ivmqzthpqocpfplcjgfd.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml2bXF6dGhwcW9jcGZwbGNqZ2ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTkyOTUsImV4cCI6MjA3Mjg5NTI5NX0.ti-s1mwc-1Miv6exhShFDCYGeqTPnxXezSYq_v_DoUU';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);




