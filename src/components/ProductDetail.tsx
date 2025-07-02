import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Heart, Share, X } from 'lucide-react';
// import { Listing } from '@/data/mockListings';
import MessageButton from './MessageButton';
import OfferButton from './OfferButton';
import Map from './Map';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

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
}

const ProductDetail: React.FC<ProductDetailProps> = ({ listing, onBack }) => {
  const { user } = useAppContext();
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [modalImg, setModalImg] = useState<string | null>(null);

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
    </div>
  );
};

export default ProductDetail;