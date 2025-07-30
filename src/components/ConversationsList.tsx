import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';

interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  listing?: {
    title: string;
    price: number;
  };
  last_message?: {
    content: string;
    created_at: string;
  };
}

interface ConversationsListProps {
  onBack: () => void;
  onSelectConversation: (conversationId: string, listingTitle: string, listingId: string) => void;
}

const ConversationsList: React.FC<ConversationsListProps> = ({ 
  onBack, 
  onSelectConversation 
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAppContext();
  const currentUserId = user?.id;
  const [usersById, setUsersById] = useState<Record<string, string>>({});
  const [listingsById, setListingsById] = useState<Record<string, string>>({});
  const [lastMessages, setLastMessages] = useState<Record<string, { content: string; created_at: string }>>({});

  useEffect(() => {
    if (currentUserId) {
      loadConversations();
    }
  }, [currentUserId]);

  const loadConversations = async () => {
    if (!currentUserId) {
      console.log('No current user ID, skipping conversation load');
      return;
    }
    try {
      console.log('Loading conversations for user:', currentUserId);
      
      // First, get a list of users that the current user has blocked
      const { data: blockedUsers, error: blockedError } = await supabase
        .from('blocks')
        .select('blocked_id')
        .eq('blocker_id', currentUserId);

      if (blockedError) {
        console.error('Error loading blocked users:', blockedError);
        throw blockedError;
      }
      const blockedUserIds = blockedUsers?.map(b => b.blocked_id) || [];

      // Also get a list of users who have blocked the current user
      const { data: usersWhoBlockedMe, error: blockedMeError } = await supabase
        .from('blocks')
        .select('blocker_id')
        .eq('blocked_id', currentUserId);
      
      if (blockedMeError) {
        console.error('Error loading users who blocked me:', blockedMeError);
        throw blockedMeError;
      }
      const usersWhoBlockedMeIds = usersWhoBlockedMe?.map(b => b.blocker_id) || [];

      const allBlockedIds = [...new Set([...blockedUserIds, ...usersWhoBlockedMeIds])];
      console.log('Blocked user IDs:', allBlockedIds);

      const { data, error } = await supabase
        .from('conversations')
        .select('*')
        .or(`buyer_id.eq.${currentUserId},seller_id.eq.${currentUserId}`)
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error loading conversations:', error);
        throw error;
      }
      
      console.log('Raw conversations data:', data);
      
      // Filter out blocked conversations
      const filteredData = (data || []).filter(c => 
        !allBlockedIds.includes(c.buyer_id) && !allBlockedIds.includes(c.seller_id)
      );
      
      console.log('Filtered conversations:', filteredData);
      
      setConversations(filteredData);
      
      if (!filteredData || filteredData.length === 0) {
        console.log('No conversations found');
        setIsLoading(false);
        return;
      }
      
      const userIds = Array.from(new Set(filteredData.flatMap((c: any) => [c.buyer_id, c.seller_id])));
      const listingIds = Array.from(new Set(filteredData.map((c: any) => c.listing_id)));
      
      console.log('Loading user data for IDs:', userIds);
      if (userIds.length > 0) {
        try {
          const { data: users, error: usersError } = await supabase.from('users').select('id, email').in('id', userIds);
          if (usersError) {
            console.error('Error loading users:', usersError);
          } else if (users) {
            const map: Record<string, string> = {};
            users.forEach((u: any) => { map[u.id] = u.email; });
            setUsersById(map);
            console.log('Users loaded:', map);
          }
        } catch (userErr) {
          console.error('Error in user loading:', userErr);
        }
      }
      
      console.log('Loading listing data for IDs:', listingIds);
      if (listingIds.length > 0) {
        try {
          const { data: listings, error: listingsError } = await supabase.from('listings').select('id, title').in('id', listingIds);
          if (listingsError) {
            console.error('Error loading listings:', listingsError);
          } else if (listings) {
            const map: Record<string, string> = {};
            listings.forEach((l: any) => { map[l.id] = l.title; });
            setListingsById(map);
            console.log('Listings loaded:', map);
          }
        } catch (listingErr) {
          console.error('Error in listing loading:', listingErr);
        }
      }
      
      if (filteredData.length > 0) {
        const convIds = filteredData.map((c: any) => c.id);
        console.log('Loading messages for conversation IDs:', convIds);
        try {
          const { data: messages, error: messagesError } = await supabase
            .from('messages')
            .select('id, conversation_id, content, created_at')
            .in('conversation_id', convIds)
            .order('created_at', { ascending: false });
          if (messagesError) {
            console.error('Error loading messages:', messagesError);
          } else if (messages) {
            const map: Record<string, { content: string; created_at: string }> = {};
            messages.forEach((m: any) => {
              if (!map[m.conversation_id]) {
                map[m.conversation_id] = { content: m.content, created_at: m.created_at };
              }
            });
            setLastMessages(map);
            console.log('Messages loaded:', map);
          }
        } catch (messageErr) {
          console.error('Error in message loading:', messageErr);
        }
      }
    } catch (error: any) {
      console.error('Error in loadConversations:', error);
      toast({
        title: "Error",
        description: `Failed to load conversations: ${error.message || 'Unknown error'}`,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getLastViewed = (convId: string) => {
    if (!currentUserId) return null;
    return localStorage.getItem(`conv_last_viewed_${currentUserId}_${convId}`);
  };
  const isUnread = (convId: string, lastMsgTime: string) => {
    const lastViewed = getLastViewed(convId);
    if (!lastViewed) return !!lastMsgTime;
    return new Date(lastMsgTime) > new Date(lastViewed);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold">Messages</h1>
        </div>
      </div>

      <div className="p-4">
        {isLoading ? (
          <div className="text-center text-gray-500 py-8">Loading conversations...</div>
        ) : conversations.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No conversations yet</p>
            <p className="text-sm">Start messaging sellers to see your chats here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conversation) => {
              const otherUserId = conversation.buyer_id === currentUserId ? conversation.seller_id : conversation.buyer_id;
              const otherUserEmail = usersById[otherUserId] || 'User';
              const listingTitle = listingsById[conversation.listing_id] || 'Listing';
              return (
                <Card 
                  key={conversation.id} 
                  className="p-4 cursor-pointer hover:bg-gray-50 relative"
                  onClick={() => {
                    if (currentUserId && lastMessages[conversation.id]?.created_at) {
                      localStorage.setItem(`conv_last_viewed_${currentUserId}_${conversation.id}`, new Date().toISOString());
                    }
                    onSelectConversation(conversation.id, listingTitle, conversation.listing_id);
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 flex items-center">
                        {listingTitle}
                        {isUnread(conversation.id, lastMessages[conversation.id]?.created_at) && (
                          <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full" title="Unread" />
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 mb-1">with {otherUserEmail}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {lastMessages[conversation.id]?.content || 'No messages yet'}
                      </p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {lastMessages[conversation.id]?.created_at ? 
                        new Date(lastMessages[conversation.id].created_at).toLocaleString() : 
                        conversation.created_at ? 
                          new Date(conversation.created_at).toLocaleDateString() : 
                          'No date'
                      }
                    </span>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConversationsList;