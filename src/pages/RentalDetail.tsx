import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const RentalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
      if (error) setError(error.message);
      setListing(data);
      setLoading(false);
    };
    fetchListing();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!listing) return <div className="p-8">Not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">Back</Button>
      <h1 className="text-2xl font-bold mb-2">{listing.title}</h1>
      <div className="mb-2">Location: {listing.location}</div>
      <div className="mb-2">Price: ${listing.price}</div>
      <div className="mb-2">Description: {listing.description}</div>
      {listing.images && listing.images.length > 0 && (
        <img src={listing.images[0]} alt={listing.title} className="w-full max-w-md rounded mb-4" crossOrigin="anonymous" />
      )}
      {listing.video && (
        <video src={listing.video} controls className="w-full max-w-md rounded mb-4" crossOrigin="anonymous" />
      )}
    </div>
  );
};

export default RentalDetail; 