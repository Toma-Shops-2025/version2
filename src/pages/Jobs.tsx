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

const JobForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAppContext();
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobType, setJobType] = useState('');
  const [salary, setSalary] = useState('');
  const [description, setDescription] = useState('');
  const [requirements, setRequirements] = useState('');
  const [location, setLocation] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [applicationUrl, setApplicationUrl] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('You must be logged in to create a job listing.');
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
        title: jobTitle,
        company_name: companyName,
        job_type: jobType,
        salary,
        description,
        requirements,
        location,
        latitude,
        longitude,
        application_url: applicationUrl || null,
        contact_info: contactInfo || null,
        category: 'job',
        images: imageUrls,
        video: videoUrl || null
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
        <h2 className="text-2xl font-bold mb-4">Create Job Listing</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <div className="mb-2">
          <label className="block mb-1">Job Title</label>
          <input className="w-full p-2 border rounded" value={jobTitle} onChange={e => setJobTitle(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Company Name</label>
          <input className="w-full p-2 border rounded" value={companyName} onChange={e => setCompanyName(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Job Type</label>
          <input className="w-full p-2 border rounded" value={jobType} onChange={e => setJobType(e.target.value)} placeholder="Full-time, Part-time, Contract, etc." />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Salary</label>
          <input className="w-full p-2 border rounded" value={salary} onChange={e => setSalary(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Description</label>
          <textarea className="w-full p-2 border rounded" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Requirements</label>
          <textarea className="w-full p-2 border rounded" value={requirements} onChange={e => setRequirements(e.target.value)} />
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
          <label className="block mb-1">Application URL <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full p-2 border rounded" value={applicationUrl} onChange={e => setApplicationUrl(e.target.value)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Contact Info <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full p-2 border rounded" value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="Phone, email, or other" />
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
          <button type="submit" className="px-4 py-2 rounded bg-green-600 text-white" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
        </div>
      </form>
    </div>
  );
};

const Jobs = () => {
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
          .eq('category', 'job')
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
      <h1 className="text-3xl font-bold mb-4 text-white">Job Listings</h1>
      <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>Create New Job Listing</button>
      <div className="mt-8">
        {loading ? (
          <div className="text-gray-400">Loading listings...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-gray-400">No job listings yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <Link key={listing.id} to={`/jobs/${listing.id}`} className="block">
                <div className="bg-gray-950 rounded-lg shadow p-4 hover:ring-2 hover:ring-green-400 transition">
                  {listing.images && listing.images.length > 0 && (
                    <img src={listing.images[0]} alt={listing.title} className="w-full h-40 object-cover rounded mb-2" crossOrigin="anonymous" />
                  )}
                  <h2 className="text-xl font-semibold mb-1 text-white">{listing.title}</h2>
                  <div className="text-green-400 font-bold mb-1">{listing.company_name}</div>
                  <div className="text-gray-300 mb-1">{listing.location}</div>
                  <div className="text-sm text-gray-400 mb-1">{listing.job_type}</div>
                  <div className="text-sm text-gray-400 mb-1">Salary: {listing.salary || 'N/A'}</div>
                  <div className="text-sm text-gray-400 mb-1">{listing.requirements}</div>
                  <div className="text-gray-300 mt-2 line-clamp-2">{listing.description}</div>
                  {listing.application_url && (
                    <a href={listing.application_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 underline text-sm mt-2 block">Apply Here</a>
                  )}
                  {listing.contact_info && (
                    <div className="text-xs text-gray-400 mt-1">Contact: {listing.contact_info}</div>
                  )}
                  {listing.video && (
                    <video src={listing.video} controls className="w-full mt-2 rounded" style={{ maxHeight: 120 }} crossOrigin="anonymous" />
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Map listings={listings} />
      {showForm && <JobForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Jobs; 