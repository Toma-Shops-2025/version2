import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hfhnslaprxowdxvyhpco.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhmaG5zbGFwcnhvd2R4dnlocGNvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTEzMDQzOTcsImV4cCI6MjA2Njg4MDM5N30._zRZW21nqWFFpYO9_BmAghUz05V2-m6jKKaILeaV-MA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// To use your own credentials, create a .env file in the project root with:
// VITE_SUPABASE_URL=your-supabase-url
// VITE_SUPABASE_ANON_KEY=your-anon-key

/**
 * Add a OneSignal player ID to the current user's onesignal_player_ids array.
 */
export async function addPlayerIdToUser(playerId: string) {
  const user = supabase.auth.user?.();
  if (!user) return;
  // Fetch current array
  const { data, error } = await supabase
    .from('users')
    .select('onesignal_player_ids')
    .eq('id', user.id)
    .single();
  if (error) return;
  const currentIds: string[] = data?.onesignal_player_ids || [];
  if (!currentIds.includes(playerId)) {
    const newIds = [...currentIds, playerId];
    await supabase
      .from('users')
      .update({ onesignal_player_ids: newIds })
      .eq('id', user.id);
  }
}

/**
 * Remove a OneSignal player ID from the current user's onesignal_player_ids array.
 */
export async function removePlayerIdFromUser(playerId: string) {
  const user = supabase.auth.user?.();
  if (!user) return;
  // Fetch current array
  const { data, error } = await supabase
    .from('users')
    .select('onesignal_player_ids')
    .eq('id', user.id)
    .single();
  if (error) return;
  const currentIds: string[] = data?.onesignal_player_ids || [];
  if (currentIds.includes(playerId)) {
    const newIds = currentIds.filter((id) => id !== playerId);
    await supabase
      .from('users')
      .update({ onesignal_player_ids: newIds })
      .eq('id', user.id);
  }
}