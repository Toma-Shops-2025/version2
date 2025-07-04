import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, Grid3X3, Heart, Bell, ShoppingCart, User, Plus } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Link, useNavigate } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout } = useAppContext();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/?search=${encodeURIComponent(search)}`);
      setSearch('');
    }
  };

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">
              TomaShops™ <span className="text-teal-600">Video 1st Marketplace</span>
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="flex items-center space-x-2">
              <Button variant="ghost">
                <Home className="h-5 w-5" />
                <span>Home</span>
              </Button>
            </Link>
            <Link to="/categories" className="flex items-center space-x-2">
              <Button variant="ghost">
                <Grid3X3 className="h-5 w-5" />
                <span>Categories</span>
              </Button>
            </Link>
            <Link to="/favorites" className="flex items-center space-x-2">
              <Button variant="ghost">
                <Heart className="h-5 w-5" />
                <span>Favorites</span>
              </Button>
            </Link>
            <Link to="/offers" className="flex items-center space-x-2">
              <Button variant="ghost">
                <ShoppingCart className="h-5 w-5" />
                <span>Offers</span>
              </Button>
            </Link>
          </nav>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <Link to="/account" className="flex items-center space-x-2 px-3 py-1 rounded hover:bg-gray-100">
                <span className="font-medium">{user.name || user.email}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className="flex flex-col items-center">
              <Home className="h-5 w-5" />
              <span className="text-xs mt-1">Home</span>
            </Button>
          </Link>
          <Link to="/categories">
            <Button variant="ghost" size="sm" className="flex flex-col items-center">
              <Grid3X3 className="h-5 w-5" />
              <span className="text-xs mt-1">Categories</span>
            </Button>
          </Link>
          <Link to="/favorites">
            <Button variant="ghost" size="sm" className="flex flex-col items-center">
              <Heart className="h-5 w-5" />
              <span className="text-xs mt-1">Favorites</span>
            </Button>
          </Link>
          <Link to="/offers">
            <Button variant="ghost" size="sm" className="flex flex-col items-center">
              <ShoppingCart className="h-5 w-5" />
              <span className="text-xs mt-1">Offers</span>
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;