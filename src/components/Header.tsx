import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from '@/contexts/AppContext';
import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';

const Header: React.FC = () => {
  const { user } = useAppContext();
  const { theme, setTheme } = useTheme();

  return (
    <header className="">
      {/* Top White Area */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              TomaShops™ <span className="text-teal-600">Video 1st</span>
            </h1>
          </div>
          <nav className="flex items-center space-x-8">
            <Link to="/categories">Categories</Link>
            <Link to="/favorites">Favorites</Link>
            {user ? (
              <Link to="/account">Account</Link>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </nav>
        </div>
      </div>
      {/* Dark Area Below */}
      {/* Removed section links row from here, now handled in HomePage */}
    </header>
  );
};

export default Header;