import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MapPin, Star, Heart, Share2, Wrench, DollarSign, Clock, Shield } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Link } from 'react-router-dom';
import Map from '@/components/Map';
import MessageButton from '@/components/MessageButton';
import OfferButton from '@/components/OfferButton';
import ListingsGrid from '@/components/ListingsGrid';

interface HandymanListing {
  id: string;
  title: string;
  price?: number;
  location: string;
  description: string;
  image_url?: string;
  video_url?: string;
  seller_id?: string;
  latitude?: number;
  longitude?: number;
  category?: string;
  service_type?: string;
  rate?: string;
  experience_years?: number;
  certified?: boolean;
  phone?: string;
}

const HandymanDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState<HandymanListing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
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
      if (!id) return;
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('category', 'handyman')
          .single();
        if (error) throw error;
        setListing(data);
        
        // Fetch seller name
        if (data.seller_id) {
          const { data: userData } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', data.seller_id)
            .single();
          setSellerName(userData?.name || userData?.email || 'Unknown');
        }
        
        fetchSimilarListings();
        fetchSellerListings();
        fetchReviews();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchSimilarListings = async () => {
      try {
        const { data } = await supabase
          .from('listings')
          .select('*')
          .eq('category', 'handyman')
          .neq('id', id)
          .limit(6);
        setSimilarListings(data || []);
      } catch (error) {
        console.error('Error fetching similar listings:', error);
      }
    };

    const fetchSellerListings = async () => {
      if (!listing?.seller_id) return;
      try {
        const { data } = await supabase
          .from('listings')
          .select('*')
          .eq('seller_id', listing.seller_id)
          .neq('id', id)
          .limit(6);
        setSellerListings(data || []);
      } catch (error) {
        console.error('Error fetching seller listings:', error);
      }
    };

    const fetchReviews = async () => {
      try {
        const { data } = await supabase
          .from('reviews')
          .select('*, reviewer:users!reviews_reviewer_id_fkey(name, email)')
          .eq('listing_id', id)
          .order('created_at', { ascending: false });
        setReviews(data || []);
      } catch (error) {
        console.error('Error fetching reviews:', error);
      }
    };

    fetchListing();
  }, [id, listing?.seller_id]);

  const submitReview = async () => {
    if (!reviewRating || !reviewComment.trim()) return;
    setSubmittingReview(true);
    try {
      const { error } = await supabase.from('reviews').insert({
        listing_id: id,
        seller_id: listing?.seller_id,
        rating: reviewRating,
        comment: reviewComment
      });
      if (error) throw error;
      setReviewRating(0);
      setReviewComment('');
      setHasReviewed(true);
      // Refresh reviews
      const { data } = await supabase
        .from('reviews')
        .select('*, reviewer:users!reviews_reviewer_id_fkey(name, email)')
        .eq('listing_id', id)
        .order('created_at', { ascending: false });
      setReviews(data || []);
    } catch (error) {
      console.error('Error submitting review:', error);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading handyman service...</div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl text-red-400 mb-4">Service not found</div>
          <Button onClick={() => navigate('/handyman')} className="bg-orange-600 hover:bg-orange-700">
            Back to Handyman Services
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/handyman')}
              className="text-white hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Services
            </Button>
            <div className="flex items-center space-x-2">
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="text-white hover:bg-gray-800">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Media Section */}
          <div className="space-y-4">
            {listing.image_url ? (
              <img
                src={listing.image_url}
                alt={listing.title}
                className="w-full aspect-video object-cover rounded-lg"
                crossOrigin="anonymous"
              />
            ) : listing.video_url ? (
              <video
                src={listing.video_url}
                controls
                className="w-full aspect-video object-cover rounded-lg"
                crossOrigin="anonymous"
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center bg-gray-800 rounded-lg">
                <Wrench className="h-16 w-16 text-gray-400" />
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">{listing.title}</h1>
              <div className="flex items-center text-orange-400 text-xl font-semibold mb-4">
                {listing.rate && <span>{listing.rate}</span>}
              </div>
              
              <div className="flex items-center text-gray-300 mb-4">
                <MapPin className="h-4 w-4 mr-2" />
                <span>{listing.location}</span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {listing.service_type && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Service Type</div>
                    <div className="text-white font-semibold">{listing.service_type}</div>
                  </div>
                )}
                {listing.experience_years && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Experience</div>
                    <div className="text-white font-semibold">{listing.experience_years} years</div>
                  </div>
                )}
                {listing.certified !== undefined && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Certification</div>
                    <div className="text-white font-semibold flex items-center">
                      {listing.certified ? (
                        <>
                          <Shield className="h-4 w-4 mr-1 text-green-400" />
                          Certified
                        </>
                      ) : (
                        'Not Certified'
                      )}
                    </div>
                  </div>
                )}
                {listing.phone && (
                  <div className="bg-gray-800 p-3 rounded-lg">
                    <div className="text-sm text-gray-400">Phone</div>
                    <div className="text-white font-semibold">{listing.phone}</div>
                  </div>
                )}
              </div>

              <div className="flex space-x-3">
                <MessageButton 
                  recipientId={listing.seller_id || ''} 
                  listingId={listing.id}
                  className="flex-1"
                />
                <OfferButton 
                  listingId={listing.id}
                  sellerId={listing.seller_id || ''}
                  className="flex-1"
                />
              </div>
            </div>

            {/* Seller Info */}
            <Card className="bg-gray-900 border-gray-700 p-4">
              <h3 className="text-lg font-semibold text-white mb-2">Service Provider</h3>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-orange-600 rounded-full flex items-center justify-center">
                  <Wrench className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-white font-medium">{sellerName}</div>
                  <Link 
                    to={`/profile/${listing.seller_id}`}
                    className="text-orange-400 text-sm hover:underline"
                  >
                    View profile
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Description */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Service Description</h2>
          <Card className="bg-gray-900 border-gray-700 p-6">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {listing.description}
            </p>
          </Card>
        </div>

        {/* Reviews Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-semibold text-white mb-4">Reviews</h2>
          
          {!hasReviewed && (
            <Card className="bg-gray-900 border-gray-700 p-6 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Write a Review</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                  <div className="flex space-x-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className={`text-2xl ${
                          star <= reviewRating ? 'text-yellow-400' : 'text-gray-600'
                        }`}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Comment</label>
                  <textarea
                    className="w-full border border-gray-700 bg-gray-900 text-white rounded p-2"
                    rows={3}
                    placeholder="Share your experience..."
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                  />
                </div>
                <Button
                  onClick={submitReview}
                  disabled={!reviewRating || !reviewComment.trim() || submittingReview}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </Card>
          )}

          <div className="space-y-4">
            {reviews.length === 0 ? (
              <Card className="bg-gray-900 border-gray-700 p-6">
                <p className="text-gray-400 text-center">No reviews yet. Be the first to review!</p>
              </Card>
            ) : (
              reviews.map((review) => (
                <Card key={review.id} className="bg-gray-900 border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-orange-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {(review.reviewer?.name || review.reviewer?.email || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {review.reviewer?.name || review.reviewer?.email || 'Anonymous'}
                        </div>
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span
                              key={star}
                              className={`text-sm ${
                                star <= review.rating ? 'text-yellow-400' : 'text-gray-600'
                              }`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <p className="text-gray-300">{review.comment}</p>
                </Card>
              ))
            )}
          </div>
        </div>

        {/* Map */}
        {listing.latitude && listing.longitude && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Service Area</h2>
            <div className="h-64 rounded-lg overflow-hidden">
              <Map 
                listings={[{
                  id: listing.id,
                  title: listing.title,
                  latitude: listing.latitude,
                  longitude: listing.longitude
                }]}
                lat={listing.latitude}
                lng={listing.longitude}
                zoom={13}
              />
            </div>
          </div>
        )}

        {/* Similar Services */}
        {similarListings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Similar Services</h2>
            <ListingsGrid listings={similarListings} />
          </div>
        )}

        {/* Other Services from this Provider */}
        {sellerListings.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-white mb-4">Other Services from {sellerName}</h2>
            <ListingsGrid listings={sellerListings} />
          </div>
        )}
      </div>
    </div>
  );
};

export default HandymanDetail; 