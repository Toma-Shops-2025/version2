import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const AdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ad, setAd] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAd = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase.from('listings').select('*').eq('id', id).single();
      if (error) setError(error.message);
      setAd(data);
      setLoading(false);
    };
    fetchAd();
  }, [id]);

  if (loading) return <div className="p-8">Loading...</div>;
  if (error) return <div className="p-8 text-red-600">{error}</div>;
  if (!ad) return <div className="p-8">Not found.</div>;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Button variant="secondary" onClick={() => navigate(-1)} className="mb-4">Back</Button>
      <h1 className="text-2xl font-bold mb-2">{ad.title}</h1>
      <div className="mb-2">Category: {ad.ad_type}</div>
      <div className="mb-2">Location: {ad.location}</div>
      <div className="mb-2">Price: {ad.price ? `$${ad.price}` : 'N/A'}</div>
      <div className="mb-2">Description: {ad.description}</div>
      {ad.images && ad.images.length > 0 && (
        <img src={ad.images[0]} alt={ad.title} className="w-full max-w-md rounded mb-4" crossOrigin="anonymous" />
      )}
      {ad.video && (
        <video src={ad.video} controls className="w-full max-w-md rounded mb-4" crossOrigin="anonymous" />
      )}
      {ad.contact_info && <div className="mb-2">Contact: {ad.contact_info}</div>}
    </div>
  );
};

export default AdDetail; 