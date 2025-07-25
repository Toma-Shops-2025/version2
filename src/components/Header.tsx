import React, { useState } from 'react';
import { Link, useNavigate } from "react-router-dom";
import { useAppContext } from '@/contexts/AppContext';
import { useTheme } from '@/components/theme-provider';
import { Moon, Sun } from 'lucide-react';
import { supabase } from '@/lib/supabase';

const Header: React.FC = () => {
  const { user } = useAppContext();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      {/* Top White Area */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              TomaShops™ <span className="text-teal-600">Video 1st</span>
            </h1>
          </div>
          {/* Simple Search Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              const form = e.target as HTMLFormElement;
              const input = form.elements.namedItem('search') as HTMLInputElement;
              if (input && input.value.trim()) {
                navigate(`/?search=${encodeURIComponent(input.value.trim())}`);
              } else {
                navigate('/');
              }
            }}
            className="flex items-center mr-4"
            style={{ flex: 1, maxWidth: 400 }}
          >
            <input
              type="text"
              name="search"
              placeholder="Search TomaShops..."
              className="border border-gray-300 rounded-l px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-teal-500"
              defaultValue={window.location.search.match(/search=([^&]+)/)?.[1] ? decodeURIComponent(window.location.search.match(/search=([^&]+)/)![1]) : ''}
            />
            <button
              type="submit"
              className="bg-teal-600 text-white px-4 py-1 rounded-r hover:bg-teal-700"
            >
              Search
            </button>
          </form>
          <nav className="flex items-center space-x-8">
            {user ? (
              <button onClick={handleLogout} className="text-gray-700 hover:text-teal-600 font-medium">Logout</button>
            ) : (
              <Link to="/login" className="text-gray-700 hover:text-teal-600 font-medium">Login</Link>
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