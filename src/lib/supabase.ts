import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://nkkpfzqtgbpncdtyirid.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'YOUR_NEW_ANON_KEY_HERE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// To use your own credentials, create a .env file in the project root with:
// VITE_SUPABASE_URL=your-supabase-url
// VITE_SUPABASE_ANON_KEY=your-anon-key