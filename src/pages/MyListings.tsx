import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import ListingsGrid from '@/components/ListingsGrid';
import { Button } from '@/components/ui/button';

const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('listings')
      .select('*')
      .eq('seller_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setListings(data || []);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please log in to view your listings.</div>;

  return (
    <div className="min-h-screen bg-white p-6">
      <Button variant="secondary" className="mb-4" onClick={() => navigate(-1)}>Back</Button>
      <h1 className="text-2xl font-bold mb-6">My Listings</h1>
      {loading ? (
        <div>Loading...</div>
      ) : listings.length === 0 ? (
        <div className="text-center text-gray-500">No listings yet. <Button asChild><a href="/sell">Create your first listing</a></Button></div>
      ) : (
        <ListingsGrid listings={listings} />
      )}
    </div>
  );
};

export default MyListings; 