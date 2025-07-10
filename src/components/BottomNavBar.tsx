import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, MessageCircle, PlusCircle, List, Tag } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';

const BottomNavBar: React.FC = () => {
  const { user } = useAppContext();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 shadow-lg md:hidden">
      <Link to="/" className="flex flex-col items-center text-gray-600 hover:text-teal-600">
        <Home className="h-6 w-6" />
        <span className="text-xs">Home</span>
      </Link>
      <button
        className="flex flex-col items-center text-gray-600 hover:text-teal-600 focus:outline-none"
        onClick={() => user && navigate('/messages')}
        disabled={!user}
        style={!user ? { opacity: 0.4, pointerEvents: 'none' } : {}}
      >
        <MessageCircle className="h-6 w-6" />
        <span className="text-xs">Messages</span>
      </button>
      <Link to="/sell" className="flex flex-col items-center text-teal-600">
        <PlusCircle className="h-8 w-8" />
        <span className="text-xs font-bold">Sell</span>
      </Link>
      <button
        className="flex flex-col items-center text-gray-600 hover:text-teal-600 focus:outline-none"
        onClick={() => user && navigate(`/mylistings`)}
        disabled={!user}
        style={!user ? { opacity: 0.4, pointerEvents: 'none' } : {}}
      >
        <List className="h-6 w-6" />
        <span className="text-xs">Listings</span>
      </button>
      <button
        className="flex flex-col items-center text-gray-600 hover:text-teal-600 focus:outline-none"
        onClick={() => user && navigate('/offers')}
        disabled={!user}
        style={!user ? { opacity: 0.4, pointerEvents: 'none' } : {}}
      >
        <Tag className="h-6 w-6" />
        <span className="text-xs">Offers</span>
      </button>
    </nav>
  );
};

export default BottomNavBar; 