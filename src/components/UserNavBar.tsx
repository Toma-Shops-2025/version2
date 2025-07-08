import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';

const UserNavBar: React.FC = () => {
  const { user } = useAppContext();
  if (!user) return null;
  return (
    <div className="bg-gray-100 border-b px-4 py-2 flex space-x-6">
      <Link to="/my-listings" className="font-medium text-gray-700 hover:text-teal-600">My Listings</Link>
      <Link to="/my-orders" className="font-medium text-gray-700 hover:text-teal-600">My Orders</Link>
      <Link to="/account" className="font-medium text-gray-700 hover:text-teal-600">Account</Link>
    </div>
  );
};

export default UserNavBar; 