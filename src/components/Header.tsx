import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Home, Grid3X3, Heart, Bell, ShoppingCart, User, Plus } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from "react-router-dom";

const Header: React.FC = () => {
  const { user, logout } = useAppContext();

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
            <Link to="/categories/vehicles" className="flex items-center space-x-2">
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
            <Link to="/notifications" className="flex items-center space-x-2">
              <Button variant="ghost">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </Button>
            </Link>
            <Link to="/cart" className="flex items-center space-x-2">
              <Button variant="ghost">
                <ShoppingCart className="h-5 w-5" />
                <span>Cart</span>
              </Button>
            </Link>
            <Link to="/profile" className="flex items-center space-x-2">
              <Button variant="ghost">
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Button>
            </Link>
          </nav>

          {/* Search Bar */}
          <div className="flex-1 max-w-lg mx-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search for anything..."
                className="pl-10 pr-4 py-2 w-full"
              />
            </div>
          </div>

          {/* Post Listing Button */}
          <Link to="/sell" className="flex items-center space-x-2">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Post New Listing</span>
            </Button>
          </Link>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            {user && (
              <div className="relative group">
                <button className="flex items-center space-x-2 px-3 py-1 rounded hover:bg-gray-100">
                  <span className="font-medium">{user.name || user.email}</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                </button>
                <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-30">
                  <button onClick={logout} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden border-t border-gray-200">
        <div className="flex justify-around py-2">
          <Button variant="ghost" size="sm" className="flex flex-col items-center">
            <Home className="h-5 w-5" />
            <span className="text-xs mt-1">Home</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center">
            <Grid3X3 className="h-5 w-5" />
            <span className="text-xs mt-1">Categories</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center">
            <Search className="h-5 w-5" />
            <span className="text-xs mt-1">Search</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center">
            <Heart className="h-5 w-5" />
            <span className="text-xs mt-1">Favorites</span>
          </Button>
          <Button variant="ghost" size="sm" className="flex flex-col items-center">
            <User className="h-5 w-5" />
            <span className="text-xs mt-1">Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;