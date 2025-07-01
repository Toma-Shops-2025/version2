import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, MapPin, Heart, Share } from 'lucide-react';
// import { Listing } from '@/data/mockListings';
import MessageButton from './MessageButton';
import OfferButton from './OfferButton';

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
}

const ProductDetail: React.FC<ProductDetailProps> = ({ listing, onBack }) => {
  return (
    <div className="min-h-screen bg-white">
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex space-x-2">
            <Button variant="ghost" size="sm">
              <Heart className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="sm">
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
              className="h-32 w-32 object-cover rounded"
            />
          ))}
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