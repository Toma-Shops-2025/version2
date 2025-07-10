import React, { useState } from 'react';
import HomePage from './HomePage';
import { AppProvider } from '@/contexts/AppContext';
import BottomNavBar from './BottomNavBar';

const AppLayout: React.FC = () => {
  // State to control header and bottom nav visibility
  const [showBars, setShowBars] = useState(true);
  const lastScrollY = React.useRef(0);

  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setShowBars(false); // Hide on scroll down
      } else {
        setShowBars(true); // Show on scroll up
      }
      lastScrollY.current = currentScrollY;
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <AppProvider>
      <div>
        <div style={{ transition: 'transform 0.3s', transform: showBars ? 'translateY(0)' : 'translateY(-100%)' }}>
          <HomePage />
        </div>
        <div style={{ transition: 'transform 0.3s', transform: showBars ? 'translateY(0)' : 'translateY(100%)' }}>
          <BottomNavBar />
        </div>
      </div>
    </AppProvider>
  );
};

export default AppLayout;