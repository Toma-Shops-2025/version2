import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { MapPin, Filter } from 'lucide-react';

interface FilterBarProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  location: string;
  onLocationChange: (location: string) => void;
  priceRange: string;
  onPriceRangeChange: (range: string) => void;
  radius: string;
  onRadiusChange: (radius: string) => void;
}

const categories = [
  'All Categories',
  'Vehicles',
  'Electronics',
  'Furniture',
  'Jewelry',
  'Collectibles & Art',
  'Pet Supplies',
  'Health & Beauty',
  'Everything Else',
  'Sports & Outdoors',
  'Home & Garden',
  'Toys & Games',
  'Free Stuff',
  'Musical Instruments',
  'Office Supplies',
  'Hobbies',
  'Tools',
  'Tickets',
  'Business Equipment',
  'Sports Memorabilia',
  'Motorcycles/Mopeds',
  'Baby Items/Accessories',
  'Shoes',
  '3D Printers/Accessories',
  'Drones/Planes/Helicopters',
  'Cell Phones/Accessories',
  'Real Estate',
  'Auto Parts',
  'Menswear',
  'Womenswear',
  'Kidswear'
];

const radiusOptions = [
  { label: '5 miles', value: '5' },
  { label: '10 miles', value: '10' },
  { label: '25 miles', value: '25' },
  { label: '50 miles', value: '50' },
  { label: '100 miles', value: '100' },
];

const FilterBar: React.FC<FilterBarProps> = ({
  selectedCategory,
  onCategoryChange,
  location,
  onLocationChange,
  priceRange,
  onPriceRangeChange,
  radius,
  onRadiusChange
}) => {
  return (
    <div className="bg-black border-b border-gray-800 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center gap-4">
          {/* Location */}
          <div className="flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-gray-500" />
            <Input
              type="text"
              placeholder="Enter location"
              value={location}
              onChange={(e) => onLocationChange(e.target.value)}
              className="w-48"
            />
          </div>

          {/* Category Filter */}
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Price Range */}
          <Select value={priceRange} onValueChange={onPriceRangeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Price range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Prices</SelectItem>
              <SelectItem value="0-100">Under $100</SelectItem>
              <SelectItem value="100-500">$100 - $500</SelectItem>
              <SelectItem value="500-1000">$500 - $1,000</SelectItem>
              <SelectItem value="1000+">$1,000+</SelectItem>
            </SelectContent>
          </Select>

          {/* Radius Filter */}
          <Select value={radius} onValueChange={onRadiusChange}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Radius" />
            </SelectTrigger>
            <SelectContent>
              {radiusOptions.map(opt => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* More Filters Button */}
          <Button variant="outline" className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span>More Filters</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FilterBar;