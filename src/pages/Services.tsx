import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import Map from '@/components/Map';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import LocationPicker from '@/components/LocationPicker';
import ListingsGrid from '@/components/ListingsGrid';

async function uploadToSupabase(file: File, folder: string = ''): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const filePath = `${folder}/${Date.now()}_${file.name}`;
  const { data, error } = await supabase.storage
    .from('uploads')
    .upload(filePath, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    });
  if (error) throw new Error(error.message);
  const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
  if (!publicUrlData?.publicUrl) throw new Error('Failed to get public URL');
  return publicUrlData.publicUrl;
}

const ServicesForm = ({ onClose }: { onClose: () => void }) => {
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
      if (!user) throw new Error('You must be logged in to create a service listing.');
      
      console.log('Creating service listing for user:', user.id);
      
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
        category: 'service',
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
      console.error('Service listing creation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Create Service</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        
        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Title</label>
          <input 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Service Type</label>
          <select 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={serviceType} 
            onChange={e => setServiceType(e.target.value)} 
            required
          >
            <option value="">Select Service Type</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Electrical">Electrical</option>
            <option value="HVAC">HVAC</option>
            <option value="Carpentry">Carpentry</option>
            <option value="Painting">Painting</option>
            <option value="Landscaping">Landscaping</option>
            <option value="Cleaning">Cleaning</option>
            <option value="Moving">Moving</option>
            <option value="Tutoring">Tutoring</option>
            <option value="Pet Care">Pet Care</option>
            <option value="Child Care">Child Care</option>
            <option value="Personal Training">Personal Training</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Rate (per hour, per job, etc.)</label>
          <input 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={rate} 
            onChange={e => setRate(e.target.value)} 
            placeholder="e.g., $50/hour, $200/job"
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Years of Experience</label>
          <input 
            type="number" 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={experienceYears} 
            onChange={e => setExperienceYears(e.target.value)} 
            min="0"
            max="50"
          />
        </div>

        <div className="mb-4">
          <label className="flex items-center text-black dark:text-white">
            <input 
              type="checkbox" 
              className="mr-2" 
              checked={certified} 
              onChange={e => setCertified(e.target.checked)} 
            />
            Certified/Licensed
          </label>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Description</label>
          <textarea 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={4}
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Location</label>
          <LocationPicker 
            onLocationSelect={(loc, lat, lng) => {
              setLocation(loc);
              setLatitude(lat);
              setLongitude(lng);
            }}
            initialLocation={location}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Phone Number</label>
          <input 
            type="tel" 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={phone} 
            onChange={e => setPhone(e.target.value)} 
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Photos (Optional)</label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            onChange={e => setImages(e.target.files)} 
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Video (Optional)</label>
          <input 
            type="file" 
            accept="video/*" 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            onChange={e => setVideo(e.target.files?.[0] || null)} 
          />
          <p className="text-sm text-gray-500 mt-1">Maximum file size: 2GB. Supported formats: MP4, MOV, AVI, MKV</p>
        </div>

        <div className="flex space-x-2">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 bg-cyan-500 text-white p-2 rounded hover:bg-cyan-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Service'}
          </button>
          <button 
            type="button" 
            onClick={onClose} 
            className="flex-1 bg-gray-500 text-white p-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const Services: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', 'service')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setListings(data || []);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="min-h-screen bg-black text-white p-6">Loading...</div>;
  if (error) return <div className="min-h-screen bg-black text-white p-6">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <BackButton />
          <h1 className="text-3xl font-bold text-white">Services</h1>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-cyan-500 text-white px-6 py-2 rounded-lg hover:bg-cyan-600 transition-colors"
          >
            Create Service
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 text-lg">
            Find professional services or offer your expertise. From home repairs to personal services, 
            connect with skilled professionals in your area.
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl mb-2">No services available yet</p>
            <p>Be the first to offer a service in your area!</p>
          </div>
        ) : (
          <ListingsGrid listings={listings} />
        )}
      </div>

      {showForm && <ServicesForm onClose={() => {
        setShowForm(false);
        fetchListings();
      }} />}
    </div>
  );
};

export default Services; 