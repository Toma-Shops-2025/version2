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
  const [downloadUrls, setDownloadUrls] = useState<string[]>([]);
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
          try {
            const { data: purchaseData, error: purchaseError } = await supabase
              .from('purchases')
              .select('*')
              .eq('listing_id', id)
              .eq('buyer_id', user.id)
              .single();
            if (purchaseError && purchaseError.code !== 'PGRST116') {
              console.error('Purchase check error:', purchaseError);
              throw purchaseError;
            }
            if (purchaseData) {
              console.log('Existing purchase found:', purchaseData);
              setIsBuyer(true);
              setConfirmed(!!purchaseData.confirmed);
              if (purchaseData.confirmed && Array.isArray(listingData.digital_file_urls) && listingData.digital_file_urls.length > 0) {
                // Get signed URLs for all files
                const urls: string[] = [];
                for (const fileUrl of listingData.digital_file_urls) {
                  try {
                    // fileUrl is a public URL, get the path after the bucket name
                    const match = fileUrl.match(/digital-products\/(.+)$/);
                    const filePath = match ? match[1] : null;
                    if (filePath) {
                      const { data, error: urlError } = await supabase.storage.from('digital-products').createSignedUrl(filePath, 60);
                      if (urlError) {
                        console.error('Signed URL error:', urlError);
                        throw urlError;
                      }
                      urls.push(data.signedUrl);
                    }
                  } catch (urlErr) {
                    console.error('Error getting signed URL for file:', fileUrl, urlErr);
                  }
                }
                setDownloadUrls(urls);
              }
            }
          } catch (purchaseErr) {
            console.error('Error checking purchase status:', purchaseErr);
            // Don't throw here, just log the error
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
    if (!user) {
      setError('You must be logged in to purchase this item.');
      return;
    }
    setBuying(true);
    setError(null);
    try {
      console.log('Attempting to purchase digital product:', { listing_id: id, buyer_id: user.id });
      
      // Check if purchase already exists
      const { data: existingPurchase, error: checkError } = await supabase
        .from('purchases')
        .select('*')
        .eq('listing_id', id)
        .eq('buyer_id', user.id)
        .single();
      
      if (checkError && checkError.code !== 'PGRST116') {
        console.error('Error checking existing purchase:', checkError);
        throw checkError;
      }
      
      if (existingPurchase) {
        setError('You have already requested access to this digital product.');
        setIsBuyer(true);
        setConfirmed(!!existingPurchase.confirmed);
        return;
      }
      
      // Insert new purchase
      const { data: purchaseData, error: insertError } = await supabase
        .from('purchases')
        .insert({
          listing_id: id,
          buyer_id: user.id,
          confirmed: false,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (insertError) {
        console.error('Purchase insert error:', insertError);
        throw insertError;
      }
      
      console.log('Purchase created successfully:', purchaseData);
      
      // Notify the seller
      if (listing && listing.seller_id) {
        try {
          const { error: notificationError } = await supabase.from('notifications').insert({
            user_id: listing.seller_id,
            type: 'order_requested',
            message: `You have a new digital order request for '${listing.title}'.`,
            link: `/seller-orders`,
            created_at: new Date().toISOString()
          });
          if (notificationError) {
            console.error('Notification error:', notificationError);
          }
        } catch (notificationErr) {
          console.error('Failed to create notification:', notificationErr);
        }
      }
      
      setIsBuyer(true);
      setConfirmed(false);
    } catch (err: any) {
      console.error('Purchase error:', err);
      setError(`Purchase failed: ${err.message}`);
    } finally {
      setBuying(false);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading digital product...</div>;
  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button onClick={() => navigate(-1)} className="bg-blue-600 text-white px-4 py-2 rounded">
          Go Back
        </button>
      </div>
    </div>
  );
  if (!listing) return <div className="min-h-screen flex items-center justify-center">Digital product not found.</div>;

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
          downloadUrls.length > 0 ? (
            <div>
              <div className="mb-2 font-semibold">Download your files:</div>
              <ul className="mb-4">
                {downloadUrls.map((url, idx) => (
                  <li key={idx} className="mb-2">
                    <a href={url} download className="bg-green-600 text-white px-4 py-2 rounded inline-block">Download File {idx + 1}</a>
                  </li>
                ))}
              </ul>
            </div>
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