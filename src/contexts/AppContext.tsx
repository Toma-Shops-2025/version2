import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase';
import { requestFirebaseNotificationPermission } from '@/lib/fcmToken';
import { onMessage, messaging } from '@/lib/firebase';

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

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showNotifButton, setShowNotifButton] = useState(false);

  useEffect(() => {
    setLoading(true);
    console.log('AppContext useEffect: MOUNT');
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('onAuthStateChange fired:', session);
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
      console.log('onAuthStateChange: setUser and setLoading(false)', session?.user);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('getSession resolved:', session);
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
      console.log('getSession: setUser and setLoading(false)', session?.user);
    });
    return () => {
      listener?.subscription.unsubscribe();
      console.log('AppContext useEffect: UNMOUNT');
    };
  }, []);

  // Request FCM permission and save token after login
  useEffect(() => {
    if (user) {
      requestFirebaseNotificationPermission().then(token => {
        if (token) {
          supabase
            .from('users')
            .update({ fcm_token: token })
            .eq('id', user.id);
        }
      });
    }
  }, [user]);

  // Foreground notification handling
  useEffect(() => {
    const unsubscribe = onMessage(messaging, (payload) => {
      toast({
        title: payload?.notification?.title || 'New Message',
        description: payload?.notification?.body || '',
      });
    });
    // No unsubscribe needed for onMessage
    return () => {};
  }, []);

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
      {children}
    </AppContext.Provider>
  );
};