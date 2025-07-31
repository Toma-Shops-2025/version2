import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Heart, Share, X, Star } from 'lucide-react';
import MessageButton from './MessageButton';
import OfferButton from './OfferButton';
import Map from './Map';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import ListingsGrid from './ListingsGrid';
import { Link } from 'react-router-dom';

interface ProductDetailProps {
  listing: Listing;
  onBack: () => void;
}

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

const ProductDetail: React.FC<ProductDetailProps> = ({ listing, onBack }) => {
  const { user } = useAppContext();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [modalImg, setModalImg] = useState<string | null>(null);
  const [similarListings, setSimilarListings] = useState<Listing[]>([]);
  const [sellerListings, setSellerListings] = useState<Listing[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);
  const [sellerName, setSellerName] = useState('');
  const [hasPurchased, setHasPurchased] = useState(false);

  useEffect(() => {
    const fetchFavorite = async () => {
      if (!user) return;
      const { data } = await supabase
        .from('favorites')
        .select('id')
        .eq('user_id', user.id)
        .eq('listing_id', listing.id)
        .single();
      if (data) {
        setIsFavorite(true);
        setFavoriteId(data.id);
      } else {
        setIsFavorite(false);
        setFavoriteId(null);
      }
    };
    fetchFavorite();
  }, [user, listing.id]);

  useEffect(() => {
    const checkPurchase = async () => {
      if (!user || !listing.id) return;
      const { data } = await supabase
        .from('purchases')
        .select('id')
        .eq('buyer_id', user.id)
        .eq('listing_id', listing.id)
        .single();
      setHasPurchased(!!data);
    };

    const fetchSellerName = async () => {
      if (!listing.seller_id) return;
      try {
        const { data, error } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', listing.seller_id)
          .single();
        if (error) {
          console.error('Error fetching seller name:', error);
          setSellerName('Seller');
        } else if (data) {
          setSellerName(data.name || data.email || 'Seller');
        } else {
          setSellerName('Seller');
        }
      } catch (err) {
        console.error('Error in fetchSellerName:', err);
        setSellerName('Seller');
      }
    };

    const fetchSimilar = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('category', listing.category)
        .neq('id', listing.id)
        .limit(6);
      setSimilarListings(data || []);
    };
    
    const fetchSellerListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', listing.seller_id)
        .neq('id', listing.id)
        .limit(6);
      setSellerListings(data || []);
    };
    
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('seller_id', listing.seller_id)
        .order('created_at', { ascending: false })
        .limit(5);
      setReviews(data || []);
    };
    checkPurchase();
    fetchSellerName();
    fetchSimilar();
    fetchSellerListings();
    fetchReviews();
  }, [listing, user]);

  useEffect(() => {
    if (!user || !listing.seller_id || !listing.id) return;
    const checkReviewed = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('id')
        .eq('listing_id', listing.id)
        .eq('reviewer_id', user.id)
        .single();
      setHasReviewed(!!data);
    };
    checkReviewed();
  }, [user, listing.seller_id, listing.id]);

  const handleFavorite = async () => {
    if (!user) return;
    if (isFavorite && favoriteId) {
      await supabase.from('favorites').delete().eq('id', favoriteId);
      setIsFavorite(false);
      setFavoriteId(null);
    } else {
      const { data } = await supabase.from('favorites').insert({ user_id: user.id, listing_id: listing.id }).select('id').single();
      setIsFavorite(true);
      setFavoriteId(data?.id || null);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({ title: listing.title, url });
      } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !listing.seller_id || !listing.id) return;
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      seller_id: listing.seller_id,
      listing_id: listing.id,
      reviewer_id: user.id,
      comment: reviewComment,
      rating: reviewRating,
    });
    setSubmittingReview(false);
    if (!error) {
      setReviewComment('');
      setReviewRating(5);
      setHasReviewed(true);
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('seller_id', listing.seller_id)
        .order('created_at', { ascending: false })
        .limit(5);
      setReviews(data || []);
    }
  };

  const handleDigitalPurchase = async () => {
    if (!user) return;
    try {
      // Check if purchase already exists
      const { data: existingPurchase } = await supabase
        .from('purchases')
        .select('*')
        .eq('listing_id', listing.id)
        .eq('buyer_id', user.id)
        .single();
      
      if (existingPurchase) {
        alert('You have already requested access to this digital product.');
        return;
      }
      
      // Insert new purchase
      const { error: insertError } = await supabase
        .from('purchases')
        .insert({
          listing_id: listing.id,
          buyer_id: user.id,
          confirmed: false,
          created_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Purchase insert error:', insertError);
        alert(`Purchase failed: ${insertError.message}`);
        return;
      }
      
      // Notify the seller
      if (listing.seller_id) {
        try {
          await supabase.from('notifications').insert({
            user_id: listing.seller_id,
            type: 'order_requested',
            message: `You have a new digital order request for '${listing.title}'.`,
            link: `/seller-orders`,
            created_at: new Date().toISOString()
          });
        } catch (notificationErr) {
          console.error('Failed to create notification:', notificationErr);
        }
      }
      
      setHasPurchased(true);
      alert('Purchase request submitted successfully! The seller will be notified.');
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(`Purchase failed: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="sticky top-0 bg-black border-b border-gray-800 z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex space-x-2">
            <Button variant={isFavorite ? 'default' : 'ghost'} size="sm" onClick={handleFavorite} aria-label="Favorite">
              <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
            <Button variant="ghost" size="sm" onClick={handleShare} aria-label="Share">
              <Share className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {listing.video && (
        <div className="relative">
          <video src={listing.video} controls className="w-full aspect-video object-cover" crossOrigin="anonymous" />
        </div>
      )}

      {listing.images && listing.images.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center p-2">
          {listing.images.map((img: string, idx: number) => (
            <img key={idx} src={img} alt={`Photo ${idx + 1}`} className="h-32 w-32 object-cover rounded cursor-pointer" onClick={() => setModalImg(img)} crossOrigin="anonymous" />
          ))}
        </div>
      )}

      {modalImg && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative">
            <img src={modalImg} alt="Enlarged" className="max-h-[80vh] max-w-[90vw] rounded shadow-lg" crossOrigin="anonymous" />
            <Button variant="secondary" className="absolute top-2 right-2" onClick={() => setModalImg(null)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

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
          {listing.category === 'digital' && !hasPurchased && (
            <Button 
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={handleDigitalPurchase}
            >
              Buy & Request Access
            </Button>
          )}
        </div>
      </div>
      
      <div className="p-4 space-y-8 bg-gray-100">
        <div>
          <h3 className="text-lg font-semibold mb-2">Seller Reviews</h3>
          {reviews.length === 0 ? (
            <p className="text-sm text-gray-500">No reviews for this seller yet.</p>
          ) : (
            <div className="space-y-4">
              {reviews.map((review: any) => (
                <div key={review.id} className="border-b pb-2">
                  <div className="flex items-center mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} />
                    ))}
                  </div>
                  <p className="text-sm">{review.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">More from this Seller</h3>
          {sellerListings.length === 0 ? (
            <div className="text-gray-500">No other listings from this seller.</div>
          ) : (
            <ListingsGrid listings={sellerListings} />
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Similar Listings</h3>
          {similarListings.length === 0 ? (
            <div className="text-gray-500">No similar listings found.</div>
          ) : (
            <ListingsGrid listings={similarListings} />
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;