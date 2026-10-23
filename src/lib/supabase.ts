import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://qghvlulieauezqenpoya.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFnaHZsdWxpZWF1ZXpxZW5wb3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU0MTc0MTEsImV4cCI6MjEwMDk5MzQxMX0.A6fgO8uhIhgY8YCauhvOglL4HrMdXlkVFhsBh1Pxt_k';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
