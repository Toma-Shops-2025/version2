import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import Map from '@/components/Map';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import LocationPicker from '@/components/LocationPicker';

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

const SideGigForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [gigType, setGigType] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('You must be logged in to create a side gig listing.');
      if (!video) throw new Error('A video is required for every side gig listing.');
      const videoUrl = await uploadToCloudinary(video);
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        imageUrls = await Promise.all(Array.from(images).map(uploadToCloudinary));
      }
      const { error: insertError } = await supabase.from('listings').insert({
        seller_id: user.id,
        title,
        price: parseFloat(price),
        category: 'sidegig',
        description,
        location,
        latitude,
        longitude,
        gig_type: gigType,
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
        <h2 className="text-2xl font-bold mb-4">Create Side Gig</h2>
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
        <div className="mb-2">
          <label className="block mb-1">Gig Type</label>
          <input className="w-full p-2 border rounded" value={gigType} onChange={e => setGigType(e.target.value)} placeholder="Delivery, Design, Tutoring, etc." />
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
          <button type="submit" className="px-4 py-2 rounded bg-yellow-600 text-white" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
        </div>
      </form>
    </div>
  );
};

const SideGigs = () => {
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
          .eq('category', 'sidegig')
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
  }, [showForm]);

  return (
    <div className="container mx-auto py-8">
      <div className="sticky top-0 z-40 bg-white dark:bg-gray-900 pb-2">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold mb-4">Side Gigs</h1>
      <button className="bg-yellow-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>Create New Side Gig</button>
      <div className="mt-8">
        {loading ? (
          <div className="text-gray-500">Loading listings...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-gray-500">No side gigs yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <Link key={listing.id} to={`/sidegigs/${listing.id}`} className="block">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 hover:ring-2 hover:ring-yellow-400 transition">
                  {listing.images && listing.images.length > 0 && (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-40 object-cover rounded mb-2" />
                  )}
                  <h2 className="text-xl font-semibold mb-1">{listing.title}</h2>
                  <div className="text-yellow-700 font-bold mb-1">{listing.gig_type}</div>
                  <div className="text-blue-700 font-bold mb-1">${listing.price}</div>
                  <div className="text-gray-700 mb-1">{listing.location}</div>
                  <div className="text-gray-600 mt-2 line-clamp-2">{listing.description}</div>
                  {listing.video && (
                    <video src={listing.video} controls className="w-full mt-2 rounded" style={{ maxHeight: 120 }} />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Map listings={listings} />
      {showForm && <SideGigForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default SideGigs; 