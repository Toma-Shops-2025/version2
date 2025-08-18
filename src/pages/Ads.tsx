import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Link, useNavigate } from 'react-router-dom';
import LocationPicker from '@/components/LocationPicker';
import BackButton from '@/components/BackButton';
import ListingsGrid from '@/components/ListingsGrid';
import Map from '@/components/Map';

const AD_CATEGORIES = [
  'Dog Walking',
  'Babysitting',
  'Lawn Care',
  'Tutoring',
  'Odd Jobs',
  'House Cleaning',
  'Moving Help',
  'Personal Training',
  'Other',
];

const AdForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [contactInfo, setContactInfo] = useState('');
  const [price, setPrice] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('You must be logged in to create an ad.');
      // Upload video if present
      let videoUrl = '';
      if (video) videoUrl = await uploadToSupabase(video, 'videos');
      // Upload images if present
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        imageUrls = await Promise.all(Array.from(images).map(file => uploadToSupabase(file, 'images')));
      }
      const { error: insertError } = await supabase.from('listings').insert({
        seller_id: user.id,
        title,
        category: 'ad',
        ad_type: category,
        description,
        location,
        latitude,
        longitude,
        contact_info: contactInfo || null,
        price: price || null,
        video: videoUrl || null,
        images: imageUrls,
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
        <h2 className="text-2xl font-bold mb-4">Create Ad</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <div className="mb-2">
          <label className="block mb-1">Title</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Category</label>
          <select className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={category} onChange={e => setCategory(e.target.value)} required>
            <option value="">Select a category</option>
            {AD_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
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
        <div className="mb-2">
          <label className="block mb-1">Contact Info <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={contactInfo} onChange={e => setContactInfo(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Price/Rate <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" type="text" value={price} onChange={e => setPrice(e.target.value)} placeholder="e.g., $15/hour, $50, Free, Negotiable" />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Images <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full" type="file" multiple onChange={e => setImages(e.target.files)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Video <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full" type="file" accept="video/*" onChange={e => setVideo(e.target.files?.[0] || null)} />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
        </div>
      </form>
    </div>
  );
};

const Ads = () => {
  const [showForm, setShowForm] = useState(false);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAds = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('category', 'ad')
          .order('created_at', { ascending: false });
        if (error) throw error;
        setAds(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAds();
  }, [showForm]);

  return (
    <div className="container mx-auto py-8 bg-black text-white min-h-screen">
      <div className="sticky top-0 z-40 bg-black pb-2">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold mb-4 text-white">Ad Listings</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>Create New Ad</button>
      <div className="mt-8">
        {loading ? (
          <div className="text-gray-400">Loading listings...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : ads.length === 0 ? (
          <div className="text-gray-400">No ad listings yet.</div>
        ) : (
          <ListingsGrid listings={ads} onListingClick={id => navigate(`/ads/${id}`)} />
        )}
      </div>
      <Map listings={ads} />
      {showForm && <AdForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Ads; 