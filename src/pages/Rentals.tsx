import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

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

const RentalForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [squareFeet, setSquareFeet] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [availableFrom, setAvailableFrom] = useState('');
  const [leaseLength, setLeaseLength] = useState('');
  const [petsAllowed, setPetsAllowed] = useState(false);
  const [furnished, setFurnished] = useState(false);
  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('You must be logged in to create a rental listing.');
      if (!video) throw new Error('A video is required for every rental listing.');
      // Upload video
      const videoUrl = await uploadToCloudinary(video);
      // Upload images
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        imageUrls = await Promise.all(Array.from(images).map(uploadToCloudinary));
      }
      // Insert into Supabase
      const { error: insertError } = await supabase.from('listings').insert({
        seller_id: user.id,
        title,
        price: parseFloat(price),
        category: 'rental',
        description,
        location,
        bedrooms: bedrooms ? parseInt(bedrooms) : null,
        bathrooms: bathrooms ? parseInt(bathrooms) : null,
        square_feet: squareFeet ? parseInt(squareFeet) : null,
        property_type: propertyType,
        available_from: availableFrom || null,
        lease_length: leaseLength,
        pets_allowed: petsAllowed,
        furnished,
        video: videoUrl,
        images: imageUrls
      });
      if (insertError) throw insertError;
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4">Create Rental Listing</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <div className="mb-2">
          <label className="block mb-1">Title</label>
          <input className="w-full p-2 border rounded" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Price</label>
          <input className="w-full p-2 border rounded" type="number" value={price} onChange={e => setPrice(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Description</label>
          <textarea className="w-full p-2 border rounded" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Location</label>
          <input className="w-full p-2 border rounded" value={location} onChange={e => setLocation(e.target.value)} required />
        </div>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="block mb-1">Bedrooms</label>
            <input className="w-full p-2 border rounded" type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block mb-1">Bathrooms</label>
            <input className="w-full p-2 border rounded" type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)} />
          </div>
        </div>
        <div className="mb-2">
          <label className="block mb-1">Square Feet</label>
          <input className="w-full p-2 border rounded" type="number" value={squareFeet} onChange={e => setSquareFeet(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Property Type</label>
          <input className="w-full p-2 border rounded" value={propertyType} onChange={e => setPropertyType(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Available From</label>
          <input className="w-full p-2 border rounded" type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Lease Length</label>
          <input className="w-full p-2 border rounded" value={leaseLength} onChange={e => setLeaseLength(e.target.value)} />
        </div>
        <div className="flex gap-2 mb-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={petsAllowed} onChange={e => setPetsAllowed(e.target.checked)} /> Pets Allowed
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={furnished} onChange={e => setFurnished(e.target.checked)} /> Furnished
          </label>
        </div>
        <div className="mb-2">
          <label className="block mb-1">Images</label>
          <input className="w-full" type="file" multiple onChange={e => setImages(e.target.files)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Video</label>
          <input className="w-full" type="file" accept="video/*" onChange={e => setVideo(e.target.files?.[0] || null)} required />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
        </div>
      </form>
    </div>
  );
};

const Rentals = () => {
  const [showForm, setShowForm] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('category', 'rental')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setListings(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [showForm]); // refetch after closing form

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Rental Listings</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>Create New Rental Listing</button>
      <div className="mt-8">
        {loading ? (
          <div className="text-gray-500">Loading listings...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-gray-500">No rental listings yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <div key={listing.id} className="bg-white dark:bg-gray-900 rounded-lg shadow p-4">
                {listing.images && listing.images.length > 0 && (
                  <img src={listing.images[0]} alt={listing.title} className="w-full h-40 object-cover rounded mb-2" />
                )}
                <h2 className="text-xl font-semibold mb-1">{listing.title}</h2>
                <div className="text-blue-700 font-bold mb-1">${listing.price}</div>
                <div className="text-gray-700 mb-1">{listing.location}</div>
                <div className="text-sm text-gray-500 mb-1">
                  {listing.bedrooms ? `${listing.bedrooms} bd` : ''}
                  {listing.bathrooms ? ` • ${listing.bathrooms} ba` : ''}
                  {listing.square_feet ? ` • ${listing.square_feet} sqft` : ''}
                </div>
                <div className="text-sm text-gray-500 mb-1">{listing.property_type}</div>
                <div className="text-sm text-gray-500 mb-1">Available: {listing.available_from || 'N/A'}</div>
                <div className="text-sm text-gray-500 mb-1">Lease: {listing.lease_length || 'N/A'}</div>
                <div className="text-sm text-gray-500 mb-1">{listing.pets_allowed ? 'Pets Allowed' : 'No Pets'}{listing.furnished ? ' • Furnished' : ''}</div>
                <div className="text-gray-600 mt-2 line-clamp-2">{listing.description}</div>
                {listing.video && (
                  <video src={listing.video} controls className="w-full mt-2 rounded" style={{ maxHeight: 120 }} />
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      {showForm && <RentalForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Rentals; 