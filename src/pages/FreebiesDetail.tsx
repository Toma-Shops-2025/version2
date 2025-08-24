import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Star, Heart, Share2, Gift } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Map from '@/components/Map';
import MessageButton from '@/components/MessageButton';
import ImageGallery from '@/components/ImageGallery';

interface Listing {
  id: string;
  title: string;
  location: string;
  description: string;
  video?: string;
  images?: string[];
  seller_id?: string;
  isJustListed?: boolean;
  latitude?: number;
  longitude?: number;
  category?: string;
  condition?: string;
  pickup_instructions?: string;
}

const FreebiesDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [listing, setListing] = useState<any>(null);
  const [similarFreebies, setSimilarFreebies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sellerName, setSellerName] = useState<string>('');
  const [similarListings, setSimilarListings] = useState<any[]>([]);
  const [sellerListings, setSellerListings] = useState<any[]>([]);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('category', 'freebie')
          .single();
        
        if (error) {
          console.error('Error fetching listing:', error);
          setError(error.message);
        } else {
          setListing(data);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  useEffect(() => {
    if (listing) {
      fetchFavorite();
      fetchSellerName();
      fetchSimilar();
      fetchSellerListings();
    }
  }, [listing]);

  const fetchFavorite = async () => {
    if (!listing) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', user.id)
      .eq('listing_id', listing.id)
      .single();

    setIsFavorite(!!data);
  };

  const fetchSellerName = async () => {
    if (!listing?.seller_id) return;
    try {
      const { data } = await supabase
        .from('profiles')
        .select('full_name, username')
        .eq('id', listing.seller_id)
        .single();
      
      if (data) {
        setSellerName(data.full_name || data.username || 'Unknown User');
      }
    } catch (err) {
      console.error('Error fetching seller name:', err);
    }
  };

  const fetchSimilar = async () => {
    if (!listing) return;
    try {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('category', 'freebie')
        .eq('status', 'active')
        .neq('id', listing.id)
        .limit(6);
      
      setSimilarListings(data || []);
    } catch (err) {
      console.error('Error fetching similar listings:', err);
    }
  };

  const fetchSellerListings = async () => {
    if (!listing?.seller_id) return;
    try {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', listing.seller_id)
        .eq('status', 'active')
        .neq('id', listing.id)
        .limit(6);
      
      setSellerListings(data || []);
    } catch (err) {
      console.error('Error fetching seller listings:', err);
    }
  };

  const toggleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/login');
      return;
    }

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listing.id);
    } else {
      await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          listing_id: listing.id,
        });
    }
    
    setIsFavorite(!isFavorite);
  };

  const shareListing = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.title,
          text: listing.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You could show a toast here
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-6">Loading...</div>;
  if (error) return <div className="min-h-screen bg-black text-white p-6">Error: {error}</div>;
  if (!listing) return <div className="min-h-screen bg-black text-white p-6">Listing not found</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="text-white hover:bg-gray-800"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              onClick={toggleFavorite}
              className={`text-white hover:bg-gray-800 ${isFavorite ? 'text-red-500' : ''}`}
            >
              <Heart className={`h-6 w-6 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              onClick={shareListing}
              className="text-white hover:bg-gray-800"
            >
              <Share2 className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Title and Price */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
            <div className="flex items-center justify-center space-x-2 text-green-400 text-xl font-semibold">
              <Gift className="h-6 w-6" />
              <span>FREE</span>
            </div>
          </div>

          {/* Images/Video */}
          {listing.images && listing.images.length > 0 && (
            <div className="mb-6">
              <ImageGallery images={listing.images} title={listing.title} />
            </div>
          )}

          {listing.video && (
            <div className="mb-6">
              <video 
                controls 
                className="w-full rounded-lg"
                src={listing.video}
              >
                Your browser does not support the video tag.
              </video>
            </div>
          )}

          {/* Details */}
          <Card className="p-6 bg-gray-900 border-gray-700">
            <div className="space-y-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <MapPin className="h-5 w-5" />
                <span>{listing.location}</span>
              </div>

              {listing.condition && (
                <div>
                  <strong className="text-white">Condition:</strong>
                  <span className="ml-2 text-gray-300">{listing.condition}</span>
                </div>
              )}

              <div>
                <strong className="text-white">Description:</strong>
                <p className="mt-2 text-gray-300">{listing.description}</p>
              </div>

              {listing.pickup_instructions && (
                <div>
                  <strong className="text-white">Pickup Instructions:</strong>
                  <p className="mt-2 text-gray-300">{listing.pickup_instructions}</p>
                </div>
              )}

              {listing.isJustListed && (
                <div className="bg-green-600 text-white px-3 py-1 rounded-full text-sm inline-block">
                  Just Listed
                </div>
              )}
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
            <MessageButton 
              listingId={listing.id} 
              sellerId={listing.seller_id} 
              listingTitle={listing.title}
              className="flex-1"
            />
            <Button 
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                // Handle claiming the freebie
                alert('Contact the seller to arrange pickup!');
              }}
            >
              Claim This Item
            </Button>
          </div>

          {/* Map */}
          {listing.latitude && listing.longitude && (
            <Card className="p-6 bg-gray-900 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Location</h3>
              <Map 
                latitude={listing.latitude} 
                longitude={listing.longitude} 
                zoom={13}
                className="h-64 rounded-lg"
              />
            </Card>
          )}

          {/* Seller Info */}
          {sellerName && (
            <Card className="p-6 bg-gray-900 border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">About the Giver</h3>
              <Link 
                to={`/profile/${listing.seller_id}`} 
                className="text-cyan-400 hover:underline"
              >
                {sellerName}
              </Link>
            </Card>
          )}

          {/* More from this seller */}
          {sellerListings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">More Free Items from {sellerName}</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {sellerListings.map((item) => (
                  <Card 
                    key={item.id} 
                    className="p-4 bg-gray-900 border-gray-700 cursor-pointer hover:bg-gray-800"
                    onClick={() => navigate(`/freebies`)}
                  >
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                    <p className="text-green-400 text-sm">FREE</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Similar freebies */}
          {similarListings.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">More Free Items Nearby</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {similarListings.map((item) => (
                  <Card 
                    key={item.id} 
                    className="p-4 bg-gray-900 border-gray-700 cursor-pointer hover:bg-gray-800"
                    onClick={() => navigate(`/freebies`)}
                  >
                    {item.image_url && (
                      <img 
                        src={item.image_url} 
                        alt={item.title}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                    )}
                    <h4 className="font-semibold text-white text-sm">{item.title}</h4>
                    <p className="text-green-400 text-sm">FREE</p>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FreebiesDetail; 