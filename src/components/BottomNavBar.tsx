import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageCircle, Plus, List, Tag, Bell, Heart } from 'lucide-react';
import { useUnreadMessagesCount } from '@/hooks/use-unread-messages-count';
import { useUnreadNotificationsCount } from '@/hooks/use-unread-notifications-count';

const BottomNavBar: React.FC = () => {
  const unreadCount = useUnreadMessagesCount();
  const unreadNotificationsCount = useUnreadNotificationsCount();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-black border-t border-gray-800 z-50 flex justify-around items-center h-16 shadow-lg md:hidden opacity-0 hover:opacity-100 transition-opacity duration-300">
      <Link to="/" className="flex flex-col items-center text-gray-400 hover:text-blue-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200">
          <Home className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs">Home</span>
      </Link>

      <Link to="/messages" className="flex flex-col items-center text-gray-400 hover:text-purple-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-purple-600 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200 relative">
          <MessageCircle className="h-5 w-5 text-white" />
          {unreadCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </div>
          )}
        </div>
        <span className="text-xs">Messages</span>
      </Link>

      <Link to="/sell" className="flex flex-col items-center text-cyan-400">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-500 to-cyan-600 flex items-center justify-center mb-1 shadow-lg hover:scale-110 transition-transform duration-200">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <span className="text-xs">Sell</span>
      </Link>

      <Link to="/browse" className="flex flex-col items-center text-gray-400 hover:text-green-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200">
          <List className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs">Listings</span>
      </Link>

      <Link to="/ads" className="flex flex-col items-center text-gray-400 hover:text-orange-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200">
          <Tag className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs">Ads</span>
      </Link>

      <Link to="/notifications" className="flex flex-col items-center text-gray-400 hover:text-yellow-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200 relative">
          <Bell className="h-5 w-5 text-white" />
          {unreadNotificationsCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadNotificationsCount}
            </div>
          )}
        </div>
        <span className="text-xs">Notifications</span>
      </Link>

      <Link to="/favorites" className="flex flex-col items-center text-gray-400 hover:text-red-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-500 to-red-600 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs">Favorites</span>
      </Link>
    </nav>
  );
};

export default BottomNavBar; 