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
  status?: string;
  sold_at?: string | null;
  // Add job-specific fields
  category?: string;
  company_name?: string;
  job_type?: string;
  salary?: string;
  deadline?: string;
  requirements?: string;
  description?: string;
  application_url?: string;
}

interface ListingsGridProps {
  listings: Listing[];
  onListingClick?: (id: string) => void;
  isOwner?: boolean;
  onMarkAsSold?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
}

const ListingsGrid: React.FC<ListingsGridProps> = ({ listings, onListingClick, isOwner = false, onMarkAsSold, onDelete, onRestore }) => {
  // Filter out job listings
  const filteredListings = listings.filter(l => l.category !== 'job');
  return (
    <div className="grid grid-cols-2 gap-2 px-2 md:gap-4 md:px-4">
      {filteredListings.map((listing) => (
        <ListingCard
          key={listing.id}
          id={listing.id}
          title={listing.title}
          price={listing.price}
          image={listing.images && listing.images.length > 0 ? listing.images[0] : undefined}
          video={listing.video}
          location={listing.location}
          isJustListed={listing.isJustListed}
          status={listing.status}
          sold_at={listing.sold_at}
          isOwner={isOwner}
          onMarkAsSold={onMarkAsSold ? () => onMarkAsSold(listing.id) : undefined}
          onDelete={onDelete ? () => onDelete(listing.id) : undefined}
          onRestore={onRestore ? () => onRestore(listing.id) : undefined}
          onClick={() => onListingClick?.(listing.id)}
          // Pass all job-specific fields
          category={listing.category}
          company_name={listing.company_name}
          job_type={listing.job_type}
          salary={listing.salary}
          deadline={listing.deadline}
          requirements={listing.requirements}
          description={listing.description}
          application_url={listing.application_url}
        />
      ))}
    </div>
  );
};

export default ListingsGrid;