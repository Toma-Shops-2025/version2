import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Star, Heart, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Map from '@/components/Map';
import MessageButton from '@/components/MessageButton';
import OfferButton from '@/components/OfferButton';
import ListingsGrid from '@/components/ListingsGrid';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  description: string;
  video?: string;
  images?: string[];
  seller_id?: string;
  isJustListed?: boolean;
  latitude?: number;
  longitude?: number;
  category?: string;
}

const AdDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [hasPurchased, setHasPurchased] = useState(false);
  const [sellerName, setSellerName] = useState<string>('');
  const [similarListings, setSimilarListings] = useState<any[]>([]);
  const [sellerListings, setSellerListings] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('category', 'ad')
          .single();
        
        if (error) {
          console.error('Error fetching listing:', error);
          setError(error.message);
        } else {
          setListing(data);
        }
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError('Failed to load listing');
      }
      setLoading(false);
    };

    if (id) {
      fetchListing();
    }
  }, [id]);

  useEffect(() => {
    if (listing) {
      fetchFavorite();
      checkPurchase();
      fetchSellerName();
      fetchSimilar();
      fetchSellerListings();
      fetchReviews();
      checkReviewed();
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

  const checkPurchase = async () => {
    if (!listing) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('purchases')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('listing_id', listing.id)
      .single();

    setHasPurchased(!!data);
  };

  const fetchSellerName = async () => {
    if (!listing?.seller_id) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', listing.seller_id)
        .single();
      
      if (!error && data) {
        setSellerName(data.full_name || 'Unknown Seller');
      }
    } catch (err) {
      console.error('Error fetching seller name:', err);
      setSellerName('Unknown Seller');
    }
  };

  const fetchSimilar = async () => {
    if (!listing) return;
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('category', 'ad')
      .neq('id', listing.id)
      .limit(6);
    
    setSimilarListings(data || []);
  };

  const fetchSellerListings = async () => {
    if (!listing?.seller_id) return;
    const { data } = await supabase
      .from('listings')
      .select('*')
      .eq('seller_id', listing.seller_id)
      .neq('id', listing.id)
      .limit(6);
    
    setSellerListings(data || []);
  };

  const fetchReviews = async () => {
    if (!listing?.seller_id) return;
    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('seller_id', listing.seller_id)
      .order('created_at', { ascending: false });
    
    setReviews(data || []);
  };

  const checkReviewed = async () => {
    if (!listing?.seller_id) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('reviews')
      .select('*')
      .eq('buyer_id', user.id)
      .eq('seller_id', listing.seller_id)
      .single();

    setHasReviewed(!!data);
  };

  const handleFavorite = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !listing) return;

    if (isFavorite) {
      await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('listing_id', listing.id);
    } else {
      await supabase
        .from('favorites')
        .insert({ user_id: user.id, listing_id: listing.id });
    }

    setIsFavorite(!isFavorite);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: listing?.title,
        text: listing?.description,
        url: window.location.href,
      });
    } else {
      await navigator.clipboard.writeText(window.location.href);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!listing?.seller_id) return;
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setSubmittingReview(true);
    try {
      await supabase
        .from('reviews')
        .insert({
          buyer_id: user.id,
          seller_id: listing.seller_id,
          rating: reviewRating,
          comment: reviewComment,
        });

      setReviewRating(0);
      setReviewComment('');
      setHasReviewed(true);
      fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
    }
    setSubmittingReview(false);
  };

  if (loading) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-gray-400">Loading ad details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    </div>
  );

  if (!listing) return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-400 mb-4">Ad not found</p>
        <Button onClick={() => navigate(-1)} variant="outline">Go Back</Button>
      </div>
    </div>
  );

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
          <h1 className="text-2xl font-bold text-white mb-2">${listing.price === 0 ? 'Free' : listing.price.toLocaleString()}</h1>
          <h2 className="text-lg text-gray-200 mb-3">{listing.title}</h2>
          <div className="flex items-center text-gray-400 text-sm mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{listing.location}</span>
          </div>
          {listing.latitude && listing.longitude && (
            <div className="mb-6">
              <Map listings={[{ id: listing.id, title: listing.title, latitude: listing.latitude, longitude: listing.longitude }]} lat={listing.latitude} lng={listing.longitude} zoom={13} />
            </div>
          )}
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

        {hasPurchased && !hasReviewed && (
          <div className="mb-6 border-t border-gray-800 pt-6">
            <h3 className="font-semibold text-white mb-2">Leave a Review</h3>
            <form onSubmit={handleReviewSubmit}>
              <div className="flex items-center mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-6 h-6 cursor-pointer ${reviewRating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} onClick={() => setReviewRating(star)} />
                ))}
              </div>
              <textarea className="w-full border border-gray-700 bg-gray-900 text-white rounded p-2" rows={3} placeholder="Share your experience..." value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} required />
              <Button type="submit" disabled={submittingReview} className="mt-2">
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </div>
        )}

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
          {listing.price > 0 && (
            <OfferButton listingId={listing.id} sellerId={listing.seller_id} currentPrice={listing.price} listingTitle={listing.title} />
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-8 bg-black">
        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">Seller Reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-400">No reviews for this seller yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="border-b border-gray-800 pb-2">
                  <div className="flex items-center mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}`} />
                    ))}
                  </div>
                  <p className="text-sm text-gray-300">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">More from this Seller</h3>
          {sellerListings.length === 0 ? (
            <div className="text-gray-400">No other listings from this seller.</div>
          ) : (
            <ListingsGrid listings={sellerListings} />
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2 text-white">Similar Ads</h3>
          {similarListings.length === 0 ? (
            <div className="text-gray-400">No similar ads found.</div>
          ) : (
            <ListingsGrid listings={similarListings} />
          )}
        </div>
      </div>
    </div>
  );
};

export default AdDetail; 