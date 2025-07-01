import React from 'react';
import ListingCard from './ListingCard';

interface Listing {
  id: string;
  title: string;
  price: number;
  location: string;
  images?: string[];
  video?: string;
  isJustListed?: boolean;
}

interface ListingsGridProps {
  listings: Listing[];
  onListingClick?: (id: string) => void;
}

const ListingsGrid: React.FC<ListingsGridProps> = ({ listings, onListingClick }) => {
  return (
    <div className="grid grid-cols-2 gap-2 px-2 md:gap-4 md:px-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          id={listing.id}
          title={listing.title}
          price={listing.price}
          image={listing.images && listing.images.length > 0 ? listing.images[0] : undefined}
          video={listing.video}
          location={listing.location}
          isJustListed={listing.isJustListed}
          onClick={() => onListingClick?.(listing.id)}
        />
      ))}
    </div>
  );
};

export default ListingsGrid;