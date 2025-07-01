import React, { useState } from 'react';
import HomePage from './HomePage';
import { AppProvider } from '@/contexts/AppContext';

const AppLayout: React.FC = () => {
  return (
    <AppProvider>
      <HomePage />
    </AppProvider>
  );
};

export default AppLayout;