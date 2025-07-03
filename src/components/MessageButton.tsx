import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import ChatWindow from './ChatWindow';
import { useAppContext } from '@/contexts/AppContext';

interface MessageButtonProps {
  listingId: string;
  sellerId: string;
  listingTitle: string;
}

const MessageButton: React.FC<MessageButtonProps> = ({ 
  listingId, 
  sellerId,
  listingTitle
}) => {
  const [showChat, setShowChat] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAppContext();

  const handleMessageSeller = async () => {
    try {
      const buyerId = user?.id;
      if (!buyerId) throw new Error('Not logged in');
      
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .eq('listing_id', listingId)
        .eq('buyer_id', buyerId)
        .eq('seller_id', sellerId)
        .single();

      let convId = existingConv?.id;

      if (!convId) {
        const { data: newConv, error } = await supabase
          .from('conversations')
          .insert({
            listing_id: listingId,
            buyer_id: buyerId,
            seller_id: sellerId
          })
          .select('id')
          .single();

        if (error) throw error;
        convId = newConv.id;
      }

      setConversationId(convId);
      setShowChat(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive"
      });
    }
  };

  if (showChat && conversationId) {
    return (
      <ChatWindow
        conversationId={conversationId}
        listingTitle={listingTitle}
        listingId={listingId}
        onBack={() => setShowChat(false)}
      />
    );
  }

  return (
    <Button 
      className="w-full bg-blue-600 hover:bg-blue-700"
      onClick={handleMessageSeller}
    >
      <MessageCircle className="h-4 w-4 mr-2" />
      Message seller
    </Button>
  );
};

export default MessageButton;