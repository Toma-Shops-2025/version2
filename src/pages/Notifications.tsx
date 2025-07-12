import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

const Notifications = () => {
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
    <div>
      <h2>Notifications</h2>
      {notifications.length === 0 && <div>No notifications.</div>}
      {notifications.map(n => (
        <div key={n.id} style={{ background: n.read ? '#f0f0f0' : '#e0ffe0', padding: 10, margin: '10px 0', borderRadius: 6 }}>
          <div>{n.message}</div>
          {n.link && <a href={n.link}>View</a>}
          <div style={{ fontSize: 12, color: '#888' }}>{new Date(n.created_at).toLocaleString()}</div>
        </div>
      ))}
    </div>
  );
};

export default Notifications; 