import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import Map from '@/components/Map';
import { Link, useNavigate } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import LocationPicker from '@/components/LocationPicker';
import ListingsGrid from '@/components/ListingsGrid';

async function uploadToSupabase(file: File, folder: string = ''): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${folder}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });
  if (error) throw new Error(error.message);
  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
  if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL');
  return publicUrlData.publicUrl;
}

const RentalForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [rent, setRent] = useState('');
  const [deposit, setDeposit] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
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
      const videoUrl = await uploadToSupabase(video, 'videos');
      // Upload images
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        imageUrls = await Promise.all(Array.from(images).map(file => uploadToSupabase(file, 'images')));
      }
      // Insert into Supabase
      const { error: insertError } = await supabase.from('listings').insert({
        seller_id: user.id,
        title,
        rent: rent,
        deposit: deposit ? parseFloat(deposit) : null,
        category: 'rental',
        description,
        location,
        latitude,
        longitude,
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
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Rent</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" type="text" value={rent} onChange={e => setRent(e.target.value)} required placeholder="e.g., $1200/month, Negotiable" />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Deposit</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" type="number" value={deposit} onChange={e => setDeposit(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Description</label>
          <textarea className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Location</label>
          <LocationPicker
            onChange={({ latitude, longitude, address }) => {
              setLatitude(latitude);
              setLongitude(longitude);
              setLocation(address);
            }}
          />
          {location && (
            <div className="text-xs text-gray-600 mt-1">Selected: {location}</div>
          )}
        </div>
        <div className="flex gap-2 mb-2">
          <div className="flex-1">
            <label className="block mb-1">Bedrooms</label>
            <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" type="number" value={bedrooms} onChange={e => setBedrooms(e.target.value)} />
          </div>
          <div className="flex-1">
            <label className="block mb-1">Bathrooms</label>
            <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" type="number" value={bathrooms} onChange={e => setBathrooms(e.target.value)} />
          </div>
        </div>
        <div className="mb-2">
          <label className="block mb-1">Square Feet <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" type="number" value={squareFeet} onChange={e => setSquareFeet(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Property Type</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={propertyType} onChange={e => setPropertyType(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Available From</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" type="date" value={availableFrom} onChange={e => setAvailableFrom(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Lease Length</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={leaseLength} onChange={e => setLeaseLength(e.target.value)} />
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
        <div className="flex justify-start gap-2 mt-4">
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
          <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={loading}>Cancel</button>
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
  const navigate = useNavigate();

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
    <div className="container mx-auto py-8 bg-black text-white min-h-screen">
      <div className="sticky top-0 z-40 bg-black pb-2">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold mb-4 text-white">Rental Listings</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>Create New Rental Listing</button>
      <div className="mt-8">
        {loading ? (
          <div className="text-gray-400">Loading listings...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-gray-400">No rental listings yet.</div>
        ) : (
          <ListingsGrid listings={listings} onListingClick={id => navigate(`/rentals/${id}`)} />
        )}
      </div>
      <Map listings={listings} />
      {showForm && <RentalForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Rentals; 