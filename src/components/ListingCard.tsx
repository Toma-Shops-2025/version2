import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ListingCardProps {
  id: string;
  title: string;
  price: number;
  image?: string;
  video?: string;
  location: string;
  isJustListed?: boolean;
  onClick?: () => void;
  status?: string; // 'active', 'sold', 'trashed'
  sold_at?: string | null;
  isOwner?: boolean;
  onMarkAsSold?: () => void;
  onDelete?: () => void;
  onRestore?: () => void;
  onPermanentDelete?: () => void;
  // Job-specific fields
  category?: string;
  company_name?: string;
  job_type?: string;
  salary?: string;
  deadline?: string;
  requirements?: string;
  description?: string;
  application_url?: string;
}

const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  price,
  image,
  video,
  location,
  isJustListed = false,
  onClick,
  status = 'active',
  sold_at = null,
  isOwner = false,
  onMarkAsSold,
  onDelete,
  onRestore,
  onPermanentDelete,
  // Job-specific fields
  category,
  company_name,
  job_type,
  salary,
  deadline,
  requirements,
  description,
  application_url
}) => {
  const isJob = category === 'job';
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm" onClick={onClick}>
      <div className="relative">
        {/* Media section for all listings, including jobs */}
        {video ? (
          <video
            src={video}
            muted
            playsInline
            className="w-full aspect-square object-cover rounded-t-lg"
            style={{ objectFit: 'cover' }}
            crossOrigin="anonymous"
            poster={image}
          />
        ) : image ? (
          <img
            src={image}
            alt={title}
            className="w-full aspect-square object-cover rounded-t-lg"
            crossOrigin="anonymous"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded-t-lg">
            <span className="text-gray-400 text-4xl">🎬</span>
          </div>
        )}
        {/* Badges for all categories */}
        {isJustListed && (
          <Badge className="absolute top-2 left-2 bg-white text-gray-800 text-xs px-2 py-1 shadow-sm">
            Just listed
          </Badge>
        )}
        {status === 'sold' && (
          <Badge className="absolute top-2 right-2 bg-red-600 text-white text-xs px-2 py-1 shadow-sm">
            SOLD
          </Badge>
        )}
        {category === 'job' && (
          <Badge className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 shadow-sm">Job</Badge>
        )}
        {category === 'rental' && (
          <Badge className="absolute top-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 shadow-sm">Rental</Badge>
        )}
        {category === 'digital' && (
          <Badge className="absolute top-2 right-2 bg-purple-600 text-white text-xs px-2 py-1 shadow-sm">Digital</Badge>
        )}
        {category === 'ad' && (
          <Badge className="absolute top-2 right-2 bg-yellow-500 text-black text-xs px-2 py-1 shadow-sm">Ad</Badge>
        )}
        <CardContent className="p-3">
          <div className="mb-1">
            <h3 className="font-bold text-lg text-gray-900">
              {/* Show salary for jobs, price for others */}
              {category === 'job'
                ? (salary && !isNaN(Number(salary))
                    ? `$${Number(salary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                    : salary || 'N/A')
                : price === 0
                  ? 'Free'
                  : `$${(price && typeof price === 'number') ? price.toLocaleString() : price || 'N/A'}`}
            </h3>
          </div>
          <p className="text-gray-700 text-sm mb-2 line-clamp-2 leading-tight font-bold">{title}</p>
          <div className="flex items-center text-gray-500 text-xs mb-2">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="text-gray-600 mt-2 line-clamp-2 text-sm">{description}</div>
        </CardContent>
      </div>
      {/* Owner controls (unchanged) */}
      {isOwner && (
        <CardContent className="p-3">
          {status === 'active' && (
            <button
              className="mt-2 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition mr-2"
              onClick={e => {
                e.stopPropagation();
                onMarkAsSold && onMarkAsSold();
              }}
            >
              Mark as Sold
            </button>
          )}
          {status !== 'trashed' && (
            <button
              className="mt-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
              onClick={e => {
                e.stopPropagation();
                onDelete && onDelete();
              }}
            >
              Delete
            </button>
          )}
          {status === 'trashed' && (
            <>
              <button
                className="mt-2 px-3 py-1 bg-yellow-500 text-black rounded hover:bg-yellow-600 transition mr-2"
                onClick={e => {
                  e.stopPropagation();
                  onRestore && onRestore();
                }}
              >
                Restore
              </button>
              <button
                className="mt-2 px-3 py-1 bg-red-800 text-white rounded hover:bg-red-900 transition"
                onClick={e => {
                  e.stopPropagation();
                  onPermanentDelete && onPermanentDelete();
                }}
              >
                Permanently Delete
              </button>
            </>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default ListingCard;