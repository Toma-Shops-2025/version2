import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase, addPlayerIdToUser } from '@/lib/supabase';

interface User {
  id: string;
  name: string;
  email: string;
  email_confirmed_at?: string | null;
}

interface AppContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  sidebarOpen: boolean;
  toggleSidebar: () => void;
  showToast: (message: string, type?: 'success' | 'error') => void;
  loading: boolean;
}

const defaultAppContext: AppContextType = {
  user: null,
  setUser: () => {},
  logout: () => {},
  sidebarOpen: false,
  toggleSidebar: () => {},
  showToast: () => {},
  loading: true,
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

declare global {
  interface Window {
    OneSignal: any;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotifButton, setShowNotifButton] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Supabase getSession:', session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          email_confirmed_at: session.user.email_confirmed_at || null,
        });
      }
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Supabase onAuthStateChange:', session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          name: session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          email_confirmed_at: session.user.email_confirmed_at || null,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  // OneSignal subscription and player ID saving logic
  useEffect(() => {
    if (typeof window !== 'undefined' && user?.id && (window as any).OneSignal) {
      setShowNotifButton(true);
      // Prompt for push notifications (auto)
      (window as any).OneSignal.showSlidedownPrompt();
      // Listen for subscription and save player ID
      (window as any).OneSignal.getUserId().then((playerId: string | null) => {
        if (playerId) {
          addPlayerIdToUser(playerId);
        }
      });
      // Listen for changes in subscription
      (window as any).OneSignal.on('subscriptionChange', function (isSubscribed: boolean) {
        if (isSubscribed) {
          (window as any).OneSignal.getUserId().then((playerId: string | null) => {
            if (playerId) {
              addPlayerIdToUser(playerId);
            }
          });
        }
      });
    } else {
      setShowNotifButton(false);
    }
  }, [user]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    toast({
      title: type === 'success' ? 'Success' : 'Error',
      description: message,
      variant: type === 'error' ? 'destructive' : 'default',
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    showToast('Logged out successfully.');
  };

  // Show loading spinner/message while checking session
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-black text-white">Checking session...</div>;
  }

  return (
    <AppContext.Provider
      value={{
        user,
        setUser,
        logout,
        sidebarOpen,
        toggleSidebar,
        showToast,
        loading,
      }}
    >
      {showNotifButton && (
        <button
          style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, padding: '12px 20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}
          onClick={() => (window as any).OneSignal.showSlidedownPrompt()}
        >
          Enable Notifications
        </button>
      )}
      {children}
    </AppContext.Provider>
  );
};