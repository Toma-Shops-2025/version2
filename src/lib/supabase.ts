import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hfhnslaprxowdxvyhpco.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmaG5zbGFwcnhvd2R4dnlocGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDQzOTcsImV4cCI6MjA2Njg4MDM5N30._zRZW21nqWFFpYO9_BmAghUz05V2-m6jKKaILeaV-MA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// To use your own credentials, create a .env file in the project root with:
// VITE_SUPABASE_URL=your-supabase-url
// VITE_SUPABASE_ANON_KEY=your-anon-key