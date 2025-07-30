import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, PlusCircle, List, Tag, Heart, Grid, Bell } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { useUnreadMessagesCount } from '@/hooks/use-unread-messages-count';
import { useUnreadNotificationsCount } from '@/hooks/use-unread-notifications-count';

const BottomNavBar: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();
  const unreadCount = useUnreadMessagesCount();
  const unreadNotificationsCount = useUnreadNotificationsCount();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 shadow-lg md:hidden">
      <Link to="/" className="flex flex-col items-center text-gray-600 hover:text-teal-600">
        <Home className="h-6 w-6" />
        <span className="text-xs">Home</span>
      </Link>
      <Link
        to="/messages"
        className="flex flex-col items-center text-gray-600 hover:text-teal-600 focus:outline-none relative"
        style={!user ? { opacity: 0.4, pointerEvents: 'none' } : {}}
      >
        <div className="relative">
          <MessageCircle className="h-6 w-6" />
          {user && unreadCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 min-w-[18px] text-center font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-xs">Messages</span>
      </Link>
      <Link 
        to="/sell" 
        className="flex flex-col items-center text-teal-600"
        style={!user ? { opacity: 0.4, pointerEvents: 'none' } : {}}
      >
        <PlusCircle className="h-8 w-8" />
        <span className="text-xs font-bold">Sell</span>
      </Link>
      <Link
        to="/my-listings"
        className="flex flex-col items-center text-gray-600 hover:text-teal-600 focus:outline-none"
        style={!user ? { opacity: 0.4, pointerEvents: 'none' } : {}}
      >
        <List className="h-6 w-6" />
        <span className="text-xs">Listings</span>
      </Link>
      <Link
        to="/ads"
        className="flex flex-col items-center text-gray-600 hover:text-teal-600 focus:outline-none"
        style={!user ? { opacity: 0.4, pointerEvents: 'none' } : {}}
      >
        <Tag className="h-6 w-6" />
        <span className="text-xs">Ads</span>
      </Link>
      <Link
        to="/notifications"
        className="flex flex-col items-center text-gray-600 hover:text-teal-600 focus:outline-none relative"
        style={!user ? { opacity: 0.4, pointerEvents: 'none' } : {}}
      >
        <div className="relative">
          <Bell className="h-6 w-6" />
          {user && unreadNotificationsCount > 0 && (
            <span className="absolute -top-1 -right-2 bg-red-500 text-white rounded-full text-xs px-1.5 py-0.5 min-w-[18px] text-center font-bold">
              {unreadNotificationsCount}
            </span>
          )}
        </div>
        <span className="text-xs">Notifications</span>
      </Link>
      <Link to="/favorites" className="flex flex-col items-center text-gray-600 hover:text-teal-600">
        <Heart className="h-6 w-6" />
        <span className="text-xs">Favorites</span>
      </Link>
    </nav>
  );
};

export default BottomNavBar; 