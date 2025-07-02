import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Notifications</h1>
      <p className="mb-6">Your notifications will appear here.</p>
      <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
};

export default Notifications; 