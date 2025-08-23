import React from 'react';
import ListingCard from './ListingCard';
import { useNavigate } from 'react-router-dom';

interface Listing {
  id: string;
  title: string;
  price?: number | string | null; // Updated to accept string for text prices
  rent?: string;
  location: string;
  images?: string[];
  image_url?: string;
  video?: string;
  video_url?: string;
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
  rate?: string; // For handyman services
}

interface ListingsGridProps {
  listings: Listing[];
  onListingClick?: (id: string) => void;
  isOwner?: boolean;
  onMarkAsSold?: (id: string) => void;
  onDelete?: (id: string) => void;
  onRestore?: (id: string) => void;
  onEdit?: (id: string) => void;
  onPermanentDelete?: (id: string) => void;
}

const ListingsGrid: React.FC<ListingsGridProps> = ({ listings, onListingClick, isOwner = false, onMarkAsSold, onDelete, onRestore, onEdit, onPermanentDelete }) => {
  const navigate = useNavigate();

  const defaultNavigate = (listing: Listing) => {
    if (onListingClick) {
      onListingClick(listing.id);
      return;
    }
    // Fallback routing by category
    if (listing.category === 'job') navigate(`/jobs/${listing.id}`);
    else if (listing.category === 'rental') navigate(`/rentals/${listing.id}`);
    else if (listing.category === 'digital') navigate(`/digital/${listing.id}`);
    else if (listing.category === 'service') navigate(`/services/${listing.id}`);
    else if (listing.category === 'handyman') navigate(`/handyman/${listing.id}`);
    else navigate(`/browse`); // or open modal in callers as needed
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2 md:gap-4 px-2 md:px-4">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          id={listing.id}
          title={listing.title}
          price={listing.price}
          rent={(listing as any).rent}
          image={listing.image_url || (listing.images && listing.images.length > 0 ? listing.images[0] : undefined)}
          video={listing.video_url || listing.video}
          location={listing.location}
          isJustListed={listing.isJustListed}
          status={listing.status}
          sold_at={listing.sold_at}
          isOwner={isOwner}
          onMarkAsSold={onMarkAsSold ? () => onMarkAsSold(listing.id) : undefined}
          onDelete={onDelete ? () => onDelete(listing.id) : undefined}
          onRestore={onRestore ? () => onRestore(listing.id) : undefined}
          onEdit={onEdit ? () => onEdit(listing.id) : undefined}
          onPermanentDelete={onPermanentDelete ? () => onPermanentDelete(listing.id) : undefined}
          onClick={() => defaultNavigate(listing)}
          // Pass all job-specific fields
          category={listing.category}
          company_name={listing.company_name}
          job_type={listing.job_type}
          salary={listing.salary}
          deadline={listing.deadline}
          requirements={listing.requirements}
          description={listing.description}
          application_url={listing.application_url}
          rate={listing.rate}
        />
      ))}
    </div>
  );
};

export default ListingsGrid;