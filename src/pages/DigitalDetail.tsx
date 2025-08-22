import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { ArrowLeft, Heart, Share2, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { MessageButton } from '@/components/MessageButton';

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
  const [isFavorite, setIsFavorite] = useState(false);

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

  const handleFavorite = async () => {
    if (!user) {
      setError('You must be logged in to favorite this item.');
      return;
    }
    setIsFavorite(prev => !prev);
    try {
      const { error: favoriteError } = await supabase.from('favorites').upsert({
        user_id: user.id,
        listing_id: id,
      });
      if (favoriteError) {
        console.error('Error toggling favorite:', favoriteError);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
    }
  };

  const handleShare = () => {
    if (window.navigator.share) {
      window.navigator.share({
        title: listing.title,
        text: listing.description,
        url: window.location.href,
      }).then(() => {
        console.log('Listing shared successfully');
      }).catch((error) => {
        console.error('Error sharing listing:', error);
      });
    } else {
      alert('Web Share API not supported in your browser.');
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
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 bg-black border-b border-gray-800 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" onClick={handleFavorite}>
              <Heart className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-400'}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare}>
              <Share2 className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white mb-2">
            {listing.price === 0 ? 'Free' : 
             listing.price && typeof listing.price === 'string' ? 
             listing.price : 
             listing.price && typeof listing.price === 'number' && !isNaN(listing.price) ? 
             `$${listing.price.toLocaleString()}` : 
             'Contact for pricing'}
          </h1>
          <h2 className="text-lg text-gray-200 mb-3">{listing.title}</h2>
          <div className="flex items-center text-gray-400 text-sm mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{listing.location}</span>
          </div>
        </div>

        {listing.images && listing.images.length > 0 && (
          <div className="mb-6">
            <img src={listing.images[0]} alt={listing.title} className="w-full rounded-lg" crossOrigin="anonymous" />
          </div>
        )}

        {listing.video && (
          <div className="mb-6">
            <video src={listing.video} controls className="w-full rounded-lg" crossOrigin="anonymous" />
          </div>
        )}

        <div className="mb-6 border-t border-gray-800 pt-6">
          <h3 className="font-semibold text-white mb-2">Description</h3>
          <p className="text-gray-300">{listing.description}</p>
        </div>

        {listing.seller_id && (
          <div className="mb-6 border-t border-gray-800 pt-6">
            <h3 className="font-semibold text-white mb-2">About the Seller</h3>
            <Link to={`/profile/${listing.seller_id}`} className="text-blue-400 hover:underline">
              View Seller's Profile
            </Link>
          </div>
        )}

        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
          <MessageButton listingId={listing.id} sellerId={listing.seller_id} listingTitle={listing.title} />
          {isBuyer ? (
            confirmed ? (
              downloadUrls.length > 0 ? (
                <div className="flex-1">
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
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleBuy} disabled={buying}>
              {buying ? 'Processing...' : 'Buy & Request Access'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default DigitalDetail; 