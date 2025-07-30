import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';

function shuffleArray(array: any[]) {
  // Fisher-Yates shuffle
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

const Browse = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setListings(shuffleArray(data || []));
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, []);

  return (
    <div className="container mx-auto py-8">
      <Button variant="secondary" className="mb-4" onClick={() => navigate(-1)}>Back</Button>
      <h1 className="text-3xl font-bold mb-4">Browse All Listings</h1>
      <div className="mt-8">
        {loading ? (
          <div className="text-gray-500">Loading listings...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-gray-500">No listings found.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                {listing.images && listing.images.length > 0 && (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-40 object-cover rounded mb-2" crossOrigin="anonymous" />
                )}
                <h2 className="text-xl font-semibold mb-1">{listing.title}</h2>
                <div className="text-blue-700 font-bold mb-1">${listing.price}</div>
                <div className="text-gray-700 mb-1">{listing.location}</div>
                <div className="text-gray-600 mt-2 line-clamp-2">{listing.description}</div>
                {listing.video && (
                  <video src={listing.video} controls className="w-full mt-2 rounded" style={{ maxHeight: 120 }} crossOrigin="anonymous" />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Browse; 