import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Heart, Share, X, Star } from 'lucide-react';
// import { Listing } from '@/data/mockListings';
import MessageButton from './MessageButton';
import OfferButton from './OfferButton';
import Map from './Map';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import ListingsGrid from './ListingsGrid';

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
  const [reviews, setReviews] = useState<any[]>([]); // Adjust type if you have a reviews table
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

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
    // Fetch similar listings
    const fetchSimilar = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('category', listing.category)
        .neq('id', listing.id)
        .limit(6);
      setSimilarListings(data || []);
    };
    // Fetch other listings from this seller
    const fetchSellerListings = async () => {
      const { data } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', listing.seller_id)
        .neq('id', listing.id)
        .limit(6);
      setSellerListings(data || []);
    };
    // Fetch seller reviews (if reviews table exists)
    const fetchReviews = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('seller_id', listing.seller_id)
        .order('created_at', { ascending: false })
        .limit(5);
      setReviews(data || []);
    };
    fetchSimilar();
    fetchSellerListings();
    fetchReviews();
  }, [listing]);

  useEffect(() => {
    // Check if user has already reviewed this seller
    if (!user || !listing.seller_id) return;
    const checkReviewed = async () => {
      const { data } = await supabase
        .from('reviews')
        .select('id')
        .eq('seller_id', listing.seller_id)
        .eq('reviewer_id', user.id)
        .single();
      setHasReviewed(!!data);
    };
    checkReviewed();
  }, [user, listing.seller_id]);

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
    if (!user || !listing.seller_id) return;
    setSubmittingReview(true);
    const { error } = await supabase.from('reviews').insert({
      seller_id: listing.seller_id,
      reviewer_id: user.id,
      reviewer_name: user.name || user.email,
      comment: reviewComment,
      rating: reviewRating,
    });
    setSubmittingReview(false);
    if (!error) {
      setReviewComment('');
      setReviewRating(5);
      setHasReviewed(true);
      // Refresh reviews
      const { data } = await supabase
        .from('reviews')
        .select('*')
        .eq('seller_id', listing.seller_id)
        .order('created_at', { ascending: false })
        .limit(5);
      setReviews(data || []);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b z-10">
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

      {/* Video */}
      {listing.video && (
      <div className="relative">
          <video
            src={listing.video}
            controls
            className="w-full aspect-video object-cover"
          />
        </div>
      )}

      {/* Photo Gallery */}
      {listing.images && listing.images.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center p-2">
          {listing.images.map((img: string, idx: number) => (
            <img
              key={idx}
              src={img}
              alt={`Photo ${idx + 1}`}
              className="h-32 w-32 object-cover rounded cursor-pointer"
              onClick={() => setModalImg(img)}
            />
          ))}
        </div>
      )}

      {/* Modal for enlarged photo */}
      {modalImg && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative">
            <img src={modalImg} alt="Enlarged" className="max-h-[80vh] max-w-[90vw] rounded shadow-lg" />
            <Button variant="secondary" className="absolute top-2 right-2" onClick={() => setModalImg(null)}>
              <X className="h-5 w-5" />
            </Button>
          </div>
      </div>
      )}

      <div className="p-4">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ${listing.price === 0 ? 'Free' : listing.price.toLocaleString()}
          </h1>
          <h2 className="text-lg text-gray-700 mb-3">{listing.title}</h2>
          <div className="flex items-center text-gray-500 text-sm mb-4">
            <MapPin className="h-4 w-4 mr-1" />
            <span>{listing.location}</span>
          </div>
          {listing.latitude && listing.longitude && (
            <div className="mb-6">
              <Map
                listings={[{ id: listing.id, title: listing.title, latitude: listing.latitude, longitude: listing.longitude }]}
                lat={listing.latitude}
                lng={listing.longitude}
                zoom={13}
              />
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
          <p className="text-gray-700">{listing.description}</p>
        </div>

        <div className="space-y-3">
          <MessageButton 
            listingId={listing.id}
            sellerId={listing.seller_id}
            listingTitle={listing.title}
          />
          {listing.price > 0 && (
            <OfferButton 
              listingId={listing.id}
              sellerId={listing.seller_id}
              currentPrice={listing.price}
              listingTitle={listing.title}
            />
          )}
        </div>
      </div>
      {/* New sections */}
      <div className="p-4 space-y-8">
        {/* Similar Listings */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Similar Listings</h3>
          {similarListings.length === 0 ? (
            <div className="text-gray-500">No similar listings found.</div>
          ) : (
            <ListingsGrid listings={similarListings} />
          )}
        </div>
        {/* Other Listings from This Seller */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Other Listings from This Seller</h3>
          {sellerListings.length === 0 ? (
            <div className="text-gray-500">No other listings from this seller.</div>
          ) : (
            <ListingsGrid listings={sellerListings} />
          )}
        </div>
        {/* Seller Reviews */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Seller Reviews</h3>
          {/* Review submission form */}
          {user && user.id !== listing.seller_id && !hasReviewed && (
            <form onSubmit={handleReviewSubmit} className="mb-6 bg-gray-50 rounded p-4">
              <div className="mb-2 flex items-center gap-2">
                <span className="font-semibold">Your Rating:</span>
                {[1,2,3,4,5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setReviewRating(star)}
                    className={star <= reviewRating ? 'text-yellow-500' : 'text-gray-300'}
                  >
                    <Star className="inline h-5 w-5" fill={star <= reviewRating ? '#facc15' : 'none'} />
                  </button>
                ))}
              </div>
              <textarea
                className="w-full border rounded p-2 mb-2"
                rows={3}
                placeholder="Write your review..."
                value={reviewComment}
                onChange={e => setReviewComment(e.target.value)}
                required
              />
              <Button type="submit" disabled={submittingReview || !reviewComment.trim()}>
                {submittingReview ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          )}
          {reviews.length === 0 ? (
            <div className="text-gray-500">No reviews for this seller yet.</div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review, idx) => (
                <div key={idx} className="bg-gray-100 rounded p-3 text-gray-800">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{review.reviewer_name || 'User'}</span>
                    <span className="flex gap-1">
                      {[1,2,3,4,5].map((star) => (
                        <Star key={star} className="h-4 w-4" fill={star <= review.rating ? '#facc15' : 'none'} stroke="#facc15" />
                      ))}
                    </span>
                  </div>
                  <div className="text-sm">{review.comment}</div>
                  <div className="text-xs text-gray-500">{new Date(review.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;