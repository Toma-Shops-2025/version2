import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

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
        {(isJob || category === 'rental' || category === 'digital' || category === 'ad') && (
          <>
            <Badge className={`absolute top-2 right-2 text-xs px-2 py-1 shadow-sm ${
              isJob ? 'bg-green-600 text-white' :
              category === 'rental' ? 'bg-blue-600 text-white' :
              category === 'digital' ? 'bg-purple-600 text-white' :
              category === 'ad' ? 'bg-yellow-500 text-black' : ''
            }`}>
              {isJob ? 'Job' :
                category === 'rental' ? 'Rental' :
                category === 'digital' ? 'Digital' :
                category === 'ad' ? 'Ad' : ''}
            </Badge>
          </>
        )}
        <div className="w-full aspect-square flex flex-col justify-center bg-gray-50 rounded-t-lg p-3">
          <div className="mb-1">
            <h3 className="font-bold text-lg text-gray-900">
              {isJob
                ? (salary && !isNaN(Number(salary)) ? `$${Number(salary).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : salary || 'N/A')
                : price === 0 ? 'Free' : `$${price?.toLocaleString?.() ?? price}`}
            </h3>
          </div>
          <p className="text-gray-700 text-sm mb-2 line-clamp-2 leading-tight font-bold">{title}</p>
          <div className="flex items-center text-gray-500 text-xs mb-2">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          <div className="text-gray-600 mt-2 line-clamp-2 text-sm">{description}</div>
        </div>
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
      </div>
      {!isJob && (
        <CardContent className="p-3">
          <div className="mb-1">
            <h3 className="font-bold text-lg text-gray-900">
              ${price === 0 ? 'Free' : price.toLocaleString()}
            </h3>
          </div>
          <p className="text-gray-700 text-sm mb-2 line-clamp-2 leading-tight">{title}</p>
          <div className="flex items-center text-gray-500 text-xs mb-2">
            <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
            <span className="truncate">{location}</span>
          </div>
          {isOwner && status === 'active' && (
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
          {isOwner && status !== 'trashed' && (
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
          {isOwner && status === 'trashed' && (
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