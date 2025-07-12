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
        {isJob ? (
          <div className="w-full aspect-square flex flex-col justify-center bg-gray-50 rounded-t-lg p-3">
            <div className="mb-1">
              <h3 className="font-bold text-lg text-gray-900">
                {salary ? `Salary: ${salary}` : 'Salary: N/A'}
              </h3>
            </div>
            <p className="text-gray-700 text-sm mb-2 line-clamp-2 leading-tight font-bold">{title}</p>
            <div className="flex items-center text-gray-500 text-xs mb-2">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            {company_name && <div className="text-green-700 font-bold text-xs mb-1">{company_name}</div>}
            {job_type && <div className="text-sm text-gray-500 mb-1">{job_type}</div>}
            <div className="text-sm text-gray-500 mb-1">Deadline: {deadline || 'N/A'}</div>
            {requirements && <div className="text-sm text-gray-500 mb-1">{requirements}</div>}
            <div className="text-gray-600 mt-2 line-clamp-2 text-sm">{description}</div>
            {application_url && (
              <a href={application_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm mt-2 block">Apply Here</a>
            )}
          </div>
        ) : video ? (
          <video
            src={video}
            muted
            playsInline
            className="w-full aspect-square object-cover rounded-t-lg"
            style={{ objectFit: 'cover' }}
          />
        ) : image ? (
          <img
            src={image}
            alt={title}
            className="w-full aspect-square object-cover rounded-t-lg"
          />
        ) : (
          <div className="w-full aspect-square flex items-center justify-center bg-gray-100 rounded-t-lg">
            <span className="text-gray-400 text-4xl">🎬</span>
          </div>
        )}
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
        {isJob && (
          <Badge className="absolute top-2 right-2 bg-green-600 text-white text-xs px-2 py-1 shadow-sm">
            Job
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