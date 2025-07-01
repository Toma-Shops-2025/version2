import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Camera, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import Map from './Map';
import mapboxgl from 'mapbox-gl';

interface SellPageProps {
  onBack: () => void;
}

const categories = [
  'All Categories',
  'Vehicles',
  'Electronics',
  'Furniture',
  'Clothing',
  'Tools',
  'Sports & Outdoors',
  'Home & Garden',
  'Toys & Games'
];

// Cloudinary upload function
const CLOUDINARY_CLOUD_NAME = 'dumnzljgn';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_preset';

async function uploadToCloudinary(file: File) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/auto/upload`;
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  const res = await fetch(url, {
    method: 'POST',
    body: formData,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error?.message || 'Cloudinary upload failed');
  return data.secure_url;
}

const SellPage: React.FC<SellPageProps> = ({ onBack }) => {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Louisville, Kentucky');
  const [images, setImages] = useState<string[]>([]);
  const { user, showToast } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [latitude, setLatitude] = useState<number | null>(38.2527); // Default Louisville
  const [longitude, setLongitude] = useState<number | null>(-85.7585);
  const [locationName, setLocationName] = useState<string>('Louisville, Kentucky');
  const [addressQuery, setAddressQuery] = useState('');
  const [addressSuggestions, setAddressSuggestions] = useState<any[]>([]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const newFiles = [...photoFiles, ...files].slice(0, 10);
    setPhotoFiles(newFiles);
    setPhotoPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const removePhoto = (idx: number) => {
    const newFiles = photoFiles.filter((_, i) => i !== idx);
    setPhotoFiles(newFiles);
    setPhotoPreviews(newFiles.map(f => URL.createObjectURL(f)));
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`);
    const data = await resp.json();
    return data.features?.[0]?.place_name || '';
  };

  const handleAddressInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddressQuery(e.target.value);
    if (e.target.value.length < 3) {
      setAddressSuggestions([]);
      return;
    }
    const resp = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(e.target.value)}.json?access_token=${mapboxgl.accessToken}&autocomplete=true&limit=5`);
    const data = await resp.json();
    setAddressSuggestions(data.features || []);
  };

  const handleSuggestionSelect = (feature: any) => {
    setLatitude(feature.center[1]);
    setLongitude(feature.center[0]);
    setLocationName(feature.place_name);
    setAddressQuery(feature.place_name);
    setAddressSuggestions([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('You must be logged in to create a listing.');
      if (!videoFile) throw new Error('A video is required for every listing.');
      // Insert listing
      const { error: insertError } = await supabase.from('listings').insert({
        seller_id: user.id,
        title,
        price: parseFloat(price),
        category,
        description,
        location: locationName,
        latitude,
        longitude,
        location_name: locationName,
        video: videoFile.name,
        images: []
      });
      if (insertError) throw insertError;
      showToast('Listing created!', 'success');
      onBack();
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">Create listing</h1>
          <div className="w-16" /> {/* Spacer */}
        </div>
      </div>

      {/* Form */}
      <div className="p-4 max-w-2xl mx-auto">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Video */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Video (required)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                {videoPreview ? (
                  <video src={videoPreview} controls className="mx-auto mb-4 max-h-48 object-contain" />
                ) : (
                  <Camera className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                )}
                <p className="text-gray-600 mb-2">Upload a video for your listing (required)</p>
                <input type="file" accept="video/*" onChange={handleVideoChange} className="mb-2" required />
              </div>
            </CardContent>
          </Card>

          {/* Photos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Photos (up to 10)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <div className="flex flex-wrap gap-2 justify-center mb-2">
                  {photoPreviews.map((src, idx) => (
                    <div key={idx} className="relative inline-block">
                      <img src={src} alt={`Photo ${idx + 1}`} className="h-20 w-20 object-cover rounded" />
                      <button type="button" onClick={() => removePhoto(idx)} className="absolute top-0 right-0 bg-red-500 text-white rounded-full px-1 text-xs">✕</button>
                    </div>
                  ))}
                </div>
                <input type="file" accept="image/*" multiple onChange={handlePhotoChange} className="mb-2" disabled={photoFiles.length >= 10} />
                <p className="text-gray-600">You can upload up to 10 photos.</p>
              </div>
            </CardContent>
          </Card>

          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="What are you selling?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Price *</label>
                <Input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Category *</label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(cat => cat !== 'All Categories').map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your item..."
                  rows={4}
                />
              </div>

              {/* Address Autocomplete */}
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Search Address</label>
                <Input
                  value={addressQuery}
                  onChange={handleAddressInput}
                  placeholder="Type an address or place..."
                  autoComplete="off"
                />
                {addressSuggestions.length > 0 && (
                  <ul className="bg-white border rounded shadow mt-1 max-h-40 overflow-auto z-50 relative">
                    {addressSuggestions.map((feature, idx) => (
                      <li
                        key={feature.id}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleSuggestionSelect(feature)}
                      >
                        {feature.place_name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Location Map */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2"><MapPin className="h-5 w-5" /> Location</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-2 text-gray-600">Drag the marker or click the map to set your item location.</div>
              <div style={{ height: 300, borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                <Map
                  listings={latitude && longitude ? [{ id: 'selected', title: 'Selected Location', latitude, longitude }] : []}
                  lng={longitude || -85.7585}
                  lat={latitude || 38.2527}
                  zoom={12}
                  // @ts-ignore
                  onMapClick={async (lng: number, lat: number) => {
                    setLatitude(lat);
                    setLongitude(lng);
                    const name = await reverseGeocode(lat, lng);
                    setLocationName(name);
                  }}
                />
              </div>
              <div className="text-sm text-gray-700">{locationName}</div>
            </CardContent>
          </Card>

          {/* Submit */}
          <div className="pt-4">
            <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700" disabled={loading}>
              {loading ? 'Posting...' : 'Post listing'}
            </Button>
            {error && <div className="text-red-500 text-center mt-2">{error}</div>}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellPage;