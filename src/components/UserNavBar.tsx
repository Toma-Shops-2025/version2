import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

const UserNavBar: React.FC = () => {
  const { user } = useAppContext();
  const [unreadCount, setUnreadCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    if (!user) return;
    let subscription;
    const fetchUnread = async () => {
      const { count } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false);
      setUnreadCount(count || 0);
    };
    fetchUnread();

    // Subscribe to real-time notifications for this user
    subscription = supabase
      .channel('notifications-realtime-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setUnreadCount((prev) => prev + 1);
          // Show a toast popup for the new notification
          const notification = payload.new;
          if (notification && notification.message) {
            toast({
              title: 'New Notification',
              description: notification.message,
            });
          }
        }
      )
      .subscribe();

    return () => {
      if (subscription) supabase.removeChannel(subscription);
    };
  }, [user, toast]);

  if (!user) return null;
  return (
    <div className="bg-gray-100 border-b px-4 py-2 flex space-x-6">
      <Link to="/my-listings" className="font-medium text-gray-700 hover:text-teal-600">My Listings</Link>
      <Link to="/my-orders" className="font-medium text-gray-700 hover:text-teal-600">My Orders</Link>
      <Link to="/notifications" className="font-medium text-gray-700 hover:text-teal-600 relative">
        Notifications
        {unreadCount > 0 && (
          <span className="absolute -top-2 -right-3 bg-green-500 text-white rounded-full text-xs px-2 py-0.5">{unreadCount}</span>
        )}
      </Link>
    </div>
  );
};

export default UserNavBar; 