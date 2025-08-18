import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import Map from '@/components/Map';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import LocationPicker from '@/components/LocationPicker';

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

const HandymanForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [serviceType, setServiceType] = useState('');
  const [rate, setRate] = useState('');
  const [experienceYears, setExperienceYears] = useState('');
  const [certified, setCertified] = useState(false);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [phone, setPhone] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('You must be logged in to create a handyman listing.');
      
      console.log('Creating handyman listing for user:', user.id);
      
      // Upload images if present
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        imageUrls = await Promise.all(Array.from(images).map(file => uploadToSupabase(file, 'images')));
      }
      
      // Upload video if present
      let videoUrl = '';
      if (video) videoUrl = await uploadToSupabase(video, 'videos');
      
      const listingData = {
        seller_id: user.id,
        title,
        service_type: serviceType,
        rate,
        experience_years: experienceYears ? parseInt(experienceYears) : null,
        certified,
        description,
        location,
        latitude,
        longitude,
        phone: phone || null,
        category: 'handyman',
        type: 'service',
        status: 'active',
        images: imageUrls,
        image_url: imageUrls.length > 0 ? imageUrls[0] : null,
        video_url: videoUrl || null
      };
      
      console.log('Listing data to insert:', listingData);
      
      const { error: insertError, data } = await supabase.from('listings').insert(listingData);
      if (insertError) {
        console.error('Insert error:', insertError);
        throw insertError;
      }
      
      console.log('Listing created successfully:', data);
      onClose();
    } catch (err: any) {
      console.error('Handyman listing creation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4">Create Handyman Service</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <div className="mb-2">
          <label className="block mb-1">Title</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Service Type</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={serviceType} onChange={e => setServiceType(e.target.value)} placeholder="Plumbing, Electrical, etc." />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Rate</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={rate} onChange={e => setRate(e.target.value)} placeholder="$ per hour or flat rate" />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Experience (years)</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" type="number" value={experienceYears} onChange={e => setExperienceYears(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={certified} onChange={e => setCertified(e.target.checked)} /> Certified
          </label>
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
          <label className="block mb-1">Images <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full" type="file" multiple onChange={e => setImages(e.target.files)} accept="image/*" />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Video <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full" type="file" accept="video/*" onChange={e => setVideo(e.target.files?.[0] || null)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Phone Number <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div className="flex justify-start gap-2 mt-4">
          <button type="submit" className="px-4 py-2 rounded bg-yellow-600 text-white" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
          <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={loading}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const Handyman = () => {
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
          .eq('category', 'handyman')
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
    <div className="container mx-auto py-8 bg-black text-white min-h-screen">
      <div className="sticky top-0 z-40 bg-black pb-2">
        <BackButton />
      </div>
      <h1 className="text-3xl font-bold mb-4 text-white">Handyman Services</h1>
      <button className="bg-yellow-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>Create New Handyman Service</button>
      <div className="mt-8">
        {loading ? (
          <div className="text-gray-400">Loading listings...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-gray-400">No handyman services yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <Link key={listing.id} to={`/handyman/${listing.id}`} className="block">
                <div className="bg-gray-950 rounded-lg shadow p-4 hover:ring-2 hover:ring-yellow-400 transition">
                  {listing.image_url ? (
                    <img src={listing.image_url} alt={listing.title} className="w-full h-40 object-cover rounded mb-2" crossOrigin="anonymous" />
                  ) : listing.video_url ? (
                    <video src={listing.video_url} controls={false} muted className="w-full h-40 object-cover rounded mb-2" crossOrigin="anonymous" />
                  ) : (
                    <div className="w-full h-40 flex items-center justify-center bg-gray-800 rounded mb-2">
                      <span className="text-gray-400 text-2xl">🔧</span>
                    </div>
                  )}
                  <h2 className="text-xl font-semibold mb-1">{listing.title}</h2>
                  <div className="text-yellow-700 font-bold mb-1">{listing.service_type}</div>
                  <div className="text-gray-700 mb-1">{listing.location}</div>
                  <div className="text-sm text-gray-500 mb-1">Rate: {listing.rate || 'N/A'}</div>
                  <div className="text-sm text-gray-500 mb-1">Experience: {listing.experience_years ? `${listing.experience_years} yrs` : 'N/A'}</div>
                  <div className="text-sm text-gray-500 mb-1">{listing.certified ? 'Certified' : 'Not Certified'}</div>
                  <div className="text-gray-600 mt-2 line-clamp-2">{listing.description}</div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Map listings={listings} />
      {showForm && <HandymanForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Handyman; 