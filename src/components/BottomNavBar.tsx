import React from 'react';
import { Link } from 'react-router-dom';
import { Home, List, PlusCircle, Heart, User } from 'lucide-react';

const BottomNavBar: React.FC = () => {
  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 z-50 flex justify-around items-center h-16 shadow-lg md:max-w-2xl md:mx-auto">
      <Link to="/" className="flex flex-col items-center text-gray-600 hover:text-teal-600">
        <Home className="h-6 w-6" />
        <span className="text-xs">Home</span>
      </Link>
      <Link to="/categories" className="flex flex-col items-center text-gray-600 hover:text-teal-600">
        <List className="h-6 w-6" />
        <span className="text-xs">Categories</span>
      </Link>
      <Link to="/sell" className="flex flex-col items-center text-teal-600">
        <PlusCircle className="h-8 w-8" />
        <span className="text-xs font-bold">Sell</span>
      </Link>
      <Link to="/favorites" className="flex flex-col items-center text-gray-600 hover:text-teal-600">
        <Heart className="h-6 w-6" />
        <span className="text-xs">Favorites</span>
      </Link>
      <Link to="/account" className="flex flex-col items-center text-gray-600 hover:text-teal-600">
        <User className="h-6 w-6" />
        <span className="text-xs">Account</span>
      </Link>
    </nav>
  );
};

export default BottomNavBar; 