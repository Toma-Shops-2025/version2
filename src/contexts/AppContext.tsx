import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';

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
}

const defaultAppContext: AppContextType = {
  user: null,
  setUser: () => {},
  logout: () => {},
  sidebarOpen: false,
  toggleSidebar: () => {},
  showToast: () => {},
};

const AppContext = createContext<AppContextType>(defaultAppContext);

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
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
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && window.OneSignalDeferred && user?.id) {
      window.OneSignalDeferred.push(function(OneSignal) {
        OneSignal.setExternalUserId(user.id);
      });
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
      }}
    >
      {children}
    </AppContext.Provider>
  );
};