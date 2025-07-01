import React from 'react';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import HomePage from '@/components/HomePage';
import AuthPage from '@/components/AuthPage';

const Main: React.FC = () => {
  const { user } = useAppContext();
  return user ? <HomePage /> : <AuthPage />;
};

const Index = () => (
  <AppProvider>
    <Main />
  </AppProvider>
);

export default Index;