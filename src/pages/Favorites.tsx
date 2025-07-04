import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import ListingsGrid from '@/components/ListingsGrid';

const Favorites: React.FC = () => {
  const navigate = useNavigate();
  const { user, loading } = useAppContext();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    if (loading) return; // Wait for session to finish loading
    const fetchFavorites = async () => {
      setDataLoading(true);
      if (!user) {
        setFavorites([]);
        setDataLoading(false);
        return;
      }
      // Get favorite listing IDs
      const { data: favs, error: favsError } = await supabase
        .from('favorites')
        .select('listing_id')
        .eq('user_id', user.id);
      if (favsError || !favs || favs.length === 0) {
        setFavorites([]);
        setDataLoading(false);
        return;
      }
      const listingIds = favs.map(f => f.listing_id);
      // Get listings
      const { data: listings, error: listingsError } = await supabase
        .from('listings')
        .select('*')
        .in('id', listingIds);
      if (listingsError) {
        setFavorites([]);
      } else {
        setFavorites(listings || []);
      }
      setDataLoading(false);
    };
    fetchFavorites();
  }, [user, loading]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-2xl font-bold mb-4">Favorites</h1>
      {loading || dataLoading ? (
        <div className="mb-6">Loading...</div>
      ) : !user ? (
        <p className="mb-6">You must be logged in to view your favorites.</p>
      ) : favorites.length === 0 ? (
        <p className="mb-6">You have no favorite items yet.</p>
      ) : (
        <div className="w-full max-w-3xl mb-6">
          <ListingsGrid listings={favorites} />
        </div>
      )}
      <Button variant="secondary" onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
};

export default Favorites; 