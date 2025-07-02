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
}

const ListingCard: React.FC<ListingCardProps> = ({
  id,
  title,
  price,
  image,
  video,
  location,
  isJustListed = false,
  onClick
}) => {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow border-0 shadow-sm" onClick={onClick}>
      <div className="relative">
        {video ? (
          <img
            src={getCloudinaryVideoThumbnail(video)}
            alt={title}
            className="w-full aspect-square object-cover rounded-t-lg"
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
      </div>
      <CardContent className="p-3">
        <div className="mb-1">
          <h3 className="font-bold text-lg text-gray-900">
            ${price === 0 ? 'Free' : price.toLocaleString()}
          </h3>
        </div>
        <p className="text-gray-700 text-sm mb-2 line-clamp-2 leading-tight">{title}</p>
        <div className="flex items-center text-gray-500 text-xs">
          <MapPin className="h-3 w-3 mr-1 flex-shrink-0" />
          <span className="truncate">{location}</span>
        </div>
      </CardContent>
    </Card>
  );
};

function getCloudinaryVideoThumbnail(videoUrl?: string) {
  if (!videoUrl) return '';
  // Only handle Cloudinary URLs
  if (!videoUrl.includes('res.cloudinary.com')) return '';
  // Replace /upload/ with /upload/so_1/ and .mp4/.mov/.webm with .jpg
  return videoUrl.replace('/upload/', '/upload/so_1/').replace(/\.(mp4|mov|webm)(\?.*)?$/, '.jpg$2');
}

export default ListingCard;