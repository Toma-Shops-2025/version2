import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { ArrowLeft } from 'lucide-react';

const DigitalDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAppContext();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBuyer, setIsBuyer] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [buying, setBuying] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch listing
        const { data: listingData, error: listingError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .single();
        if (listingError) throw listingError;
        setListing(listingData);
        // Check if user is a confirmed buyer
        if (user) {
          const { data: purchaseData, error: purchaseError } = await supabase
            .from('purchases')
            .select('*')
            .eq('listing_id', id)
            .eq('buyer_id', user.id)
            .single();
          if (purchaseError && purchaseError.code !== 'PGRST116') throw purchaseError;
          if (purchaseData) {
            setIsBuyer(true);
            setConfirmed(!!purchaseData.confirmed);
            if (purchaseData.confirmed && listingData.digital_file_url) {
              // Get signed URL for download
              const filePath = listingData.digital_file_url.split('/digital-products/')[1];
              const { data, error: urlError } = await supabase.storage.from('digital-products').createSignedUrl(filePath, 60);
              if (urlError) throw urlError;
              setDownloadUrl(data.signedUrl);
            }
          }
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, user]);

  const handleBuy = async () => {
    if (!user) return;
    setBuying(true);
    setError(null);
    try {
      const { error: insertError } = await supabase.from('purchases').insert({
        listing_id: id,
        buyer_id: user.id,
        confirmed: false
      });
      if (insertError) throw insertError;
      setIsBuyer(true);
      setConfirmed(false);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">{error}</div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center">Listing not found.</div>;

  return (
    <div className="container mx-auto py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-teal-600 hover:underline font-semibold"
      >
        <ArrowLeft className="h-5 w-5 mr-1" /> Back
      </button>
      <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
      <div className="mb-2 text-blue-700 font-bold">${listing.price}</div>
      <div className="mb-2 text-gray-700">{listing.location}</div>
      <div className="mb-4 text-gray-600">{listing.description}</div>
      {isBuyer ? (
        confirmed ? (
          downloadUrl ? (
            <a href={downloadUrl} download className="bg-green-600 text-white px-4 py-2 rounded">Download Digital File</a>
          ) : (
            <div className="text-green-700">Your purchase is confirmed. Preparing download...</div>
          )
        ) : (
          <div className="text-yellow-600">Waiting for seller to confirm your purchase.</div>
        )
      ) : (
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleBuy} disabled={buying}>{buying ? 'Processing...' : 'Buy & Request Access'}</button>
      )}
    </div>
  );
};

export default DigitalDetail; 