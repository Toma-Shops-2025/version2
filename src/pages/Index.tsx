import React from 'react';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import HomePage from '@/components/HomePage';
import AuthPage from '@/components/AuthPage';

const Main: React.FC = () => {
  const { user } = useAppContext();
  if (!user) return <AuthPage />;
  if (!user.email_confirmed_at) return <div className="flex flex-col items-center justify-center min-h-screen"><h2 className="text-2xl font-bold mb-4">Please verify your email address to log in.</h2></div>;
  return <HomePage />;
};

const Index = () => (
  <AppProvider>
    <Main />
  </AppProvider>
);

export default Index;