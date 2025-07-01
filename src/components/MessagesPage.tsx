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
  } | null>(null);

  const handleSelectConversation = (conversationId: string, listingTitle: string) => {
    setSelectedConversation({ id: conversationId, title: listingTitle });
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
  };

  if (selectedConversation) {
    return (
      <ChatWindow
        conversationId={selectedConversation.id}
        listingTitle={selectedConversation.title}
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