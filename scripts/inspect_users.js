import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const url = process.env.VITE_SUPABASE_URL || 'https://yuykjagarpubbwpxsush.supabase.co';
const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;
const sb = createClient(url, key);

async function inspect() {
  console.log('Inspecting Supabase database members...');
  const { data, error } = await sb
    .from('members')
    .select('id, membership_no, full_name, email, national_id, created_at, auth_user_id, status, role')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching members:', error);
  } else {
    console.log(`Found ${data.length} total members in Supabase:`);
    console.table(data);
  }
}

inspect();
