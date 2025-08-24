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

const EventsForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [eventType, setEventType] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [organizer, setOrganizer] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [ticketUrl, setTicketUrl] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (!user) throw new Error('You must be logged in to create an event listing.');
      
      console.log('Creating event listing for user:', user.id);
      
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
        category: 'event',
        ad_type: eventType,
        event_date: date,
        event_time: time,
        price: price || 'Free',
        description,
        location,
        latitude,
        longitude,
        organizer: organizer || null,
        contact_info: contactInfo || null,
        ticket_url: ticketUrl || null,
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
      console.error('Event listing creation error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-lg overflow-y-auto max-h-[90vh]">
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Create Event</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        
        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Event Title *</label>
          <input 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="e.g., Summer Music Festival, Art Exhibition, Community Meetup"
            required 
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Event Type *</label>
          <select 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={eventType} 
            onChange={e => setEventType(e.target.value)} 
            required
          >
            <option value="">Select Event Type</option>
            <option value="Music">Music</option>
            <option value="Sports">Sports</option>
            <option value="Art">Art</option>
            <option value="Food">Food & Drink</option>
            <option value="Business">Business</option>
            <option value="Education">Education</option>
            <option value="Community">Community</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Fitness">Fitness & Wellness</option>
            <option value="Technology">Technology</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block mb-1 text-black dark:text-white">Date *</label>
            <input 
              type="date" 
              className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
              value={date} 
              onChange={e => setDate(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block mb-1 text-black dark:text-white">Time *</label>
            <input 
              type="time" 
              className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
              value={time} 
              onChange={e => setTime(e.target.value)} 
              required 
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Price</label>
          <input 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={price} 
            onChange={e => setPrice(e.target.value)} 
            placeholder="e.g., $25, Free, $50-100"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Description *</label>
          <textarea 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            rows={4}
            placeholder="Describe the event, what to expect, who should attend, etc."
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
          <label className="block mb-1 text-black dark:text-white">Organizer</label>
          <input 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={organizer} 
            onChange={e => setOrganizer(e.target.value)} 
            placeholder="Your name or organization name"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Contact Information</label>
          <input 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={contactInfo} 
            onChange={e => setContactInfo(e.target.value)} 
            placeholder="Phone, email, or website"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Ticket/Registration URL</label>
          <input 
            type="url" 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            value={ticketUrl} 
            onChange={e => setTicketUrl(e.target.value)} 
            placeholder="https://..."
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
          <p className="text-sm text-gray-500 mt-1">Upload photos related to the event</p>
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-black dark:text-white">Video (Optional)</label>
          <input 
            type="file" 
            accept="video/*" 
            className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" 
            onChange={e => setVideo(e.target.files?.[0] || null)} 
          />
          <p className="text-sm text-gray-500 mt-1">A promotional video or preview of the event</p>
        </div>

        <div className="flex space-x-2">
          <button 
            type="submit" 
            disabled={loading} 
            className="flex-1 bg-purple-500 text-white p-2 rounded hover:bg-purple-600 disabled:opacity-50"
          >
            {loading ? 'Creating...' : 'Create Event'}
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

const Events: React.FC = () => {
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
        .eq('category', 'event')
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
          <h1 className="text-3xl font-bold text-white">Events</h1>
          <button 
            onClick={() => setShowForm(true)} 
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600 transition-colors"
          >
            Create Event
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-300 text-lg">
            Discover exciting events in your area or promote your own events. 
            From concerts to workshops, find something fun to do or share your event with the community.
          </p>
        </div>

        {listings.length === 0 ? (
          <div className="text-center text-gray-400 py-12">
            <p className="text-xl mb-2">No events available yet</p>
            <p>Be the first to create an event in your area!</p>
          </div>
        ) : (
          <ListingsGrid listings={listings} />
        )}
      </div>

      {showForm && <EventsForm onClose={() => {
        setShowForm(false);
        fetchListings();
      }} />}
    </div>
  );
};

export default Events; 