import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
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

const FreebiesForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [condition, setCondition] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [pickupInstructions, setPickupInstructions] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    // Validate mandatory photos and video
    if (!images || images.length === 0) {
      setError('At least one photo is required');
      setLoading(false);
      return;
    }
    
    if (!video) {
      setError('A video is required for freebie listings');
      setLoading(false);
      return;
    }

    try {
      if (!user) throw new Error('You must be logged in to create a freebie listing.');
      
      console.log('Creating freebie listing for user:', user.id);
      
      // Upload images (mandatory)
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        imageUrls = await Promise.all(Array.from(images).map(file => uploadToSupabase(file, 'images')));
      }
      
      // Upload video (mandatory)
      let videoUrl = '';
      if (video) videoUrl = await uploadToSupabase(video, 'videos');
      
      const listingData = {
        seller_id: user.id,
        title,
        category: 'freebie',
        ad_type: category,
        condition,
        description,
        location,
        latitude,
        longitude,
        pickup_instructions: pickupInstructions || null,
        price: 'Free',
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
      console.error('Freebie listing creation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Give Away Item</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        
        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Title *</label>
          <input 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g., Free Couch, Free Books, Free Electronics"
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Category *</label>
          <select 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={category} 
            onChange={e => setCategory(e.target.value)} 
            required
          >
            <option value="">Select Category</option>
            <option value="Furniture">Furniture</option>
            <option value="Electronics">Electronics</option>
            <option value="Clothing">Clothing</option>
            <option value="Books">Books</option>
            <option value="Toys">Toys</option>
            <option value="Kitchen Items">Kitchen Items</option>
            <option value="Tools">Tools</option>
            <option value="Sports Equipment">Sports Equipment</option>
            <option value="Baby Items">Baby Items</option>
            <option value="Pet Supplies">Pet Supplies</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Condition *</label>
          <select 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={condition} 
            onChange={e => setCondition(e.target.value)} 
            required
          >
            <option value="">Select Condition</option>
            <option value="New">New</option>
            <option value="Like New">Like New</option>
            <option value="Good">Good</option>
            <option value="Fair">Fair</option>
            <option value="Poor">Poor</option>
            <option value="For Parts">For Parts</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Description *</label>
          <textarea 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={4}
            placeholder="Describe the item, why you're giving it away, any defects, etc."
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Location *</label>
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
          <label className="block mb-1 text-black dark:text-white">Pickup Instructions</label>
          <textarea 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={pickupInstructions} 
            onChange={e => setPickupInstructions(e.target.value)} 
            rows={3}
            placeholder="When can they pick up? Any special instructions?"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">
            Photos * (At least one required)
          </label>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            onChange={e => setImages(e.target.files)} 
            required
          />
          <p className="text-sm text-gray-500 mt-1">Upload clear photos showing the item from different angles</p>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">
            Video * (Required)
          </label>
          <input 
            type="file" 
            accept="video/*" 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            onChange={e => setVideo(e.target.files?.[0] || null)} 
            required
          />
          <p className="text-sm text-gray-500 mt-1">Maximum file size: 2GB. Supported formats: MP4, MOV, AVI, MKV. A short video showing the item in detail</p>
        </div>

        <div className="flex space-x-2">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 bg-green-500 text-white p-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Give Away Item'}
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

const Freebies: React.FC = () => {
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
        .eq('category', 'freebie')
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
          <h1 className="text-3xl font-bold text-white">Freebies</h1>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-green-500 text-white px-6 py-2 rounded-lg hover:bg-green-600 transition-colors"
          >
            Give Away Item
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 text-lg">
            Find free items in your area or give away things you no longer need. 
            Everything here is completely free - just pay it forward!
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl mb-2">No freebies available yet</p>
            <p>Be the first to give away something in your area!</p>
          </div>
        ) : (
          <ListingsGrid listings={listings} />
        )}
      </div>

      {showForm && <FreebiesForm onClose={() => {
        setShowForm(false);
        fetchListings();
      }} />}
    </div>
  );
};

export default Freebies; 