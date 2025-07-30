import React, { useState } from 'react';
import ConversationsList from './ConversationsList';
import ChatWindow from './ChatWindow';

interface MessagesPageProps {
  onBack: () => void;
}

const MessagesPage: React.FC<MessagesPageProps> = ({ onBack }) => {
  const [selectedConversation, setSelectedConversation] = useState<{
    id: string;
    title: string;
    listingId: string;
  } | null>(null);

  const handleSelectConversation = (conversationId: string, listingTitle: string, listingId: string) => {
    setSelectedConversation({ id: conversationId, title: listingTitle, listingId });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (selectedConversation) {
    return (
      <ChatWindow
        conversationId={selectedConversation.id}
        listingTitle={selectedConversation.title}
        listingId={selectedConversation.listingId}
        onBack={handleBackToList}
      />
    );
  }

  return (
    <ConversationsList
      onBack={onBack}
      onSelectConversation={handleSelectConversation}
    />
  );
};

export default MessagesPage;