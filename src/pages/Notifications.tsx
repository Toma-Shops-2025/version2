import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    if (!user) return;
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      setNotifications(data || []);
      // Mark all as read
      await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false);
    };
    fetchNotifications();
  }, [user]);

  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      <Button variant="secondary" className="mb-6" onClick={() => navigate(-1)}>Back</Button>
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">Notifications</h2>
      {notifications.length === 0 && (
        <div className="text-lg text-gray-600 dark:text-gray-400 text-center py-8">
          No notifications.
        </div>
      )}
      {notifications.map(n => (
        <div 
          key={n.id} 
          className={`p-6 mb-4 rounded-lg border shadow-sm transition-all duration-200 hover:shadow-md ${
            n.read 
              ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' 
              : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-700'
          }`}
        >
          <div className="text-lg font-medium text-gray-900 dark:text-white mb-3 leading-relaxed">
            {n.message}
          </div>
          {n.link && (
            <a 
              href={n.link} 
              className="inline-block text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium text-base mb-3 transition-colors duration-200"
            >
              View →
            </a>
          )}
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {new Date(n.created_at).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Notifications; 