
import { createClient } from '@supabase/supabase-js';
import { Database } from './types';

// Hard-code these values since they're already in the codebase
// and this ensures they're always available
const supabaseUrl = 'https://qbwfitonbkorftjacqzp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFid2ZpdG9uYmtvcmZ0amFjcXpwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAxMzkzMTIsImV4cCI6MjA1NTcxNTMxMn0.2SWRXANe4goXIXV6hT3G0ERJ0uWyo02O8uv8NZkKPrw';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing. Please check environment variables.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
