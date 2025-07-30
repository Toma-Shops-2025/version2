import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

export function useUnreadNotificationsCount(refetchTrigger?: any) {
  const { user } = useAppContext();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }

    let isMounted = true;
    let subscription: any;

    const fetchUnread = async () => {
      try {
        const { count, error } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('read', false);

        if (error) {
          console.error('Error fetching unread notifications count:', error);
          if (isMounted) setUnreadCount(0);
          return;
        }

        if (isMounted) setUnreadCount(count || 0);
      } catch (error) {
        console.error('Error in fetchUnread:', error);
        if (isMounted) setUnreadCount(0);
      }
    };

    const setupRealtimeSubscription = () => {
      subscription = supabase
        .channel('notifications-count-realtime-' + user.id)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          () => {
            // Refetch count when notifications change
            fetchUnread();
          }
        )
        .subscribe();
    };

    fetchUnread();
    setupRealtimeSubscription();

    return () => {
      isMounted = false;
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [user, refetchTrigger]);

  return unreadCount;
} 