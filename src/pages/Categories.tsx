import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const categories = [
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

const Categories: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Button key={cat} className="w-full" variant="outline" onClick={() => {}}>
            {cat}
          </Button>
        ))}
      </div>
      <Button className="mt-8" variant="secondary" onClick={() => navigate(-1)}>Back</Button>
    </div>
  );
};

export default Categories; 