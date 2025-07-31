import React from 'react';
import { Link } from 'react-router-dom';
import { Home, MessageCircle, Plus, List, Tag, Bell, Heart } from 'lucide-react';
import { useUnreadMessagesCount } from '@/hooks/use-unread-messages-count';
import { useUnreadNotificationsCount } from '@/hooks/use-unread-notifications-count';

const BottomNavBar: React.FC = () => {
  const unreadCount = useUnreadMessagesCount();
  const unreadNotificationsCount = useUnreadNotificationsCount();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-gray-950 border-t border-gray-900 z-50 flex justify-around items-center h-16 shadow-lg opacity-0 hover:opacity-100 transition-opacity duration-300 md:opacity-100">
      <Link to="/" className="flex flex-col items-center text-gray-500 hover:text-blue-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-blue-700 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200 opacity-80">
          <Home className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs">Home</span>
      </Link>

      <Link to="/messages" className="flex flex-col items-center text-gray-500 hover:text-purple-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200 relative opacity-80">
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
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-600 to-cyan-700 flex items-center justify-center mb-1 shadow-lg hover:scale-110 transition-transform duration-200 opacity-80">
          <Plus className="h-6 w-6 text-white" />
        </div>
        <span className="text-xs">Sell</span>
      </Link>

      <Link to="/browse" className="flex flex-col items-center text-gray-500 hover:text-green-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-600 to-green-700 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200 opacity-80">
          <List className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs">Listings</span>
      </Link>

      <Link to="/ads" className="flex flex-col items-center text-gray-500 hover:text-orange-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-orange-700 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200 opacity-80">
          <Tag className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs">Ads</span>
      </Link>

      <Link to="/notifications" className="flex flex-col items-center text-gray-500 hover:text-yellow-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-yellow-600 to-yellow-700 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200 relative opacity-80">
          <Bell className="h-5 w-5 text-white" />
          {unreadNotificationsCount > 0 && (
            <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadNotificationsCount}
            </div>
          )}
        </div>
        <span className="text-xs">Notifications</span>
      </Link>

      <Link to="/favorites" className="flex flex-col items-center text-gray-500 hover:text-red-400 transition-colors duration-200">
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-red-600 to-red-700 flex items-center justify-center mb-1 hover:scale-110 transition-transform duration-200 opacity-80">
          <Heart className="h-5 w-5 text-white" />
        </div>
        <span className="text-xs">Favorites</span>
      </Link>
    </nav>
  );
};

export default BottomNavBar; 