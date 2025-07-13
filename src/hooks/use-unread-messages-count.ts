import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

export function useUnreadMessagesCount(refetchTrigger?: any) {
  const { user } = useAppContext();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!user?.id) {
      setUnreadCount(0);
      return;
    }
    let isMounted = true;
    const fetchUnread = async () => {
      // Fetch all conversations for this user
      const { data: conversations, error } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      if (error || !conversations) {
        setUnreadCount(0);
        return;
      }
      const convIds = conversations.map((c: any) => c.id);
      if (convIds.length === 0) {
        setUnreadCount(0);
        return;
      }
      // Fetch last message for each conversation
      const { data: messages } = await supabase
        .from('messages')
        .select('id, conversation_id, created_at, receiver_id')
        .in('conversation_id', convIds)
        .order('created_at', { ascending: false });
      if (!messages) {
        setUnreadCount(0);
        return;
      }
      // Map: conversationId -> last message
      const lastMsgByConv: Record<string, any> = {};
      messages.forEach((m: any) => {
        if (!lastMsgByConv[m.conversation_id]) {
          lastMsgByConv[m.conversation_id] = m;
        }
      });
      // Count conversations where last message is for this user and is newer than last viewed
      let count = 0;
      for (const convId of convIds) {
        const lastMsg = lastMsgByConv[convId];
        if (!lastMsg) continue;
        if (lastMsg.receiver_id !== user.id) continue;
        const lastViewed = localStorage.getItem(`conv_last_viewed_${user.id}_${convId}`);
        if (!lastViewed || new Date(lastMsg.created_at) > new Date(lastViewed)) {
          count++;
        }
      }
      if (isMounted) setUnreadCount(count);
    };
    fetchUnread();
    return () => { isMounted = false; };
  }, [user, refetchTrigger]);

  return unreadCount;
} 