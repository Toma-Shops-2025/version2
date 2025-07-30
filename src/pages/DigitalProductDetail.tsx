import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ProductDetail from '@/components/ProductDetail';

const DigitalProductDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: listingError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('category', 'digital')
          .single();
        if (listingError) {
          console.error('Digital product fetch error:', listingError);
          throw listingError;
        }
        setListing(data);
      } catch (err: any) {
        console.error('Digital product detail error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading digital product...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">Error: {error}</div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center">Digital product not found.</div>;

  return <ProductDetail listing={listing} onBack={() => navigate(-1)} />;
};

export default DigitalProductDetail; 