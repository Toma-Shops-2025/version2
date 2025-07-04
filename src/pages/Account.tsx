import React from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

const Account: React.FC = () => {
  const { user, logout, loading } = useAppContext();

  console.log('Account page - user:', user, 'loading:', loading);

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-black text-white">You must be logged in to view your account.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center py-8 bg-black text-white">
      <div className="bg-gray-900 rounded-lg shadow p-6 w-full max-w-xl flex flex-col items-center mb-8">
        <h1 className="text-2xl font-bold mb-1">Account</h1>
        <p className="text-gray-400 mb-2">{user.email}</p>
        <p className="text-gray-500 text-sm mb-2">User ID: {user.id}</p>
        <Button variant="destructive" onClick={logout} className="mt-4">Logout</Button>
      </div>
    </div>
  );
};

export default Account; 