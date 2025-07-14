import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { ArrowLeft, Send, Trash2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { useAppContext } from '@/contexts/AppContext';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  created_at: string;
  status?: string;
  trashed_at?: string | null;
}

interface ChatWindowProps {
  conversationId: string;
  listingTitle: string;
  listingId: string;
  onBack: () => void;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ 
  conversationId, 
  listingTitle, 
  listingId, 
  onBack 
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAppContext();
  const currentUserId = user?.id;
  const [otherUserEmail, setOtherUserEmail] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isOtherTyping, setIsOtherTyping] = useState(false);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);
  const typingChannel = useRef<any>(null);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadMessages();
    // Subscribe to new messages in this conversation
    const channel = supabase.channel('messages-realtime')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, (payload) => {
        loadMessages();
      })
      .subscribe();
    // Typing indicator channel
    typingChannel.current = supabase.channel(`typing-${conversationId}`)
      .on('broadcast', { event: 'typing' }, (payload) => {
        if (payload.payload.userId !== currentUserId) {
          setIsOtherTyping(true);
          if (typingTimeout.current) clearTimeout(typingTimeout.current);
          typingTimeout.current = setTimeout(() => setIsOtherTyping(false), 2000);
        }
      })
      .subscribe();
    // Fetch other user's email
    fetchOtherUserEmail();
    return () => {
      supabase.removeChannel(channel);
      if (typingChannel.current) supabase.removeChannel(typingChannel.current);
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchOtherUserEmail = async () => {
    // Get conversation info
    const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
    if (conv && currentUserId) {
      const otherUserId = conv.buyer_id === currentUserId ? conv.seller_id : conv.buyer_id;
      const { data: userData } = await supabase.from('users').select('email').eq('id', otherUserId).single();
      if (userData) setOtherUserEmail(userData.email);
    }
  };

  const loadMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to get the other user's ID
  const getOtherUserId = async () => {
    const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
    if (conv && currentUserId) {
      return conv.buyer_id === currentUserId ? conv.seller_id : conv.buyer_id;
    }
    return null;
  };

  const sendMessage = async () => {
    console.log('Current user object:', user);
    console.log('Current user ID:', currentUserId);
    if (!newMessage.trim() || !currentUserId) return;
    setIsSending(true);
    try {
      const otherUserId = await getOtherUserId();
      const { data: conv } = await supabase.from('conversations').select('*').eq('id', conversationId).single();
      console.log('Conversation:', conv);
      console.log('Current user ID:', currentUserId);
      console.log('Other user ID:', otherUserId);
      if (!otherUserId) throw new Error('Could not determine receiver');
      const payload = {
        conversation_id: conversationId,
        sender_id: currentUserId,
        receiver_id: otherUserId,
        listing_id: conv?.listing_id,
        content: newMessage.trim()
      };
      console.log('Message payload:', payload); // Debug log
      const { data, error } = await supabase
        .from('messages')
        .insert(payload)
        .select(); // Get the inserted row(s)
      if (error) {
        console.error('Supabase insert error:', error); // Debug log
        toast({
          title: "Error",
          description: error.message || "Failed to send message",
          variant: "destructive"
        });
        return;
      }
      if (data && data.length > 0) {
        // Send push notification to recipient
        try {
          await fetch('/.netlify/functions/send-notification', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              recipientUserId: otherUserId,
              title: `New Message from ${user?.name || user?.email || 'TomaShops User'}`,
              message: newMessage.length > 50 ? newMessage.slice(0, 50) + '...' : newMessage
            })
          });
        } catch (err) {
          console.error('Failed to send push notification:', err);
        }
        setNewMessage('');
        loadMessages();
        toast({
          title: "Message sent",
          description: "Your message was sent successfully.",
          variant: "default"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error?.message || "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    if (typingChannel.current && currentUserId) {
      typingChannel.current.send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId }
      });
    }
  };

  const handleTrashMessage = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ status: 'trashed', trashed_at: new Date().toISOString() })
        .eq('id', messageId);
      if (error) throw error;
      loadMessages();
      toast({
        title: 'Message deleted',
        description: 'Your message was moved to trash.',
        variant: 'default',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: error?.message || 'Failed to delete message',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b p-4">
        <div className="flex items-center">
          <Button variant="ghost" size="sm" onClick={onBack} className="mr-3">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h2 className="font-semibold">{listingTitle}</h2>
            <p className="text-sm text-gray-500">Chat with {otherUserEmail || 'user'}</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {isLoading ? (
          <div className="text-center text-gray-500">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="text-center text-gray-500">No messages yet. Start the conversation!</div>
        ) : (
          messages
            .filter((message) => message.status !== 'trashed')
            .map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender_id === currentUserId ? 'justify-end' : 'justify-start'
              }`}
            >
              <Card className={`max-w-xs p-3 ${
                message.sender_id === currentUserId 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-white'
              }`}>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold mb-1">
                      {message.sender_id === currentUserId ? 'You' : otherUserEmail || 'User'}
                    </span>
                    <div className="flex items-center">
                      <p className="text-sm mr-2">{message.content}</p>
                      {message.sender_id === currentUserId && (
                        <button
                          className="ml-1 text-white hover:text-red-400"
                          title="Delete"
                          onClick={() => handleTrashMessage(message.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                <p className={`text-xs mt-1 ${
                  message.sender_id === currentUserId ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {new Date(message.created_at).toLocaleTimeString()}
                </p>
                  </div>
              </Card>
            </div>
          ))
        )}
        {isOtherTyping && (
          <div className="text-left text-xs text-gray-400 pl-2">{otherUserEmail || 'User'} is typing…</div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        {currentUserId ? (
        <div className="flex space-x-2">
          <Input
            value={newMessage}
              onChange={handleInputChange}
            placeholder="Type a message..."
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          />
            <Button onClick={sendMessage} disabled={!newMessage.trim() || isSending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
        ) : (
          <div className="text-center text-red-500">
            Please <a href="/login" className="underline text-blue-600">log in</a> to send messages.
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;