import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import BackButton from '@/components/BackButton';
import Map from '@/components/Map';

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

const DigitalForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [images, setImages] = useState<FileList | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const MAX_FILE_SIZE_MB = 50;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    const tooLarge = selectedFiles.find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (tooLarge) {
      setError(`Each file must be 50MB or less. File "${tooLarge.name}" is too large.`);
      setFiles([]);
    } else {
      setError(null);
      setFiles(selectedFiles);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Check file sizes again before upload
    const tooLarge = files.find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024);
    if (tooLarge) {
      setError(`Each file must be 50MB or less. File "${tooLarge.name}" is too large.`);
      setLoading(false);
      return;
    }
    try {
      if (!user) throw new Error('You must be logged in to create a digital product listing.');
      if (!files.length) throw new Error('At least one digital file is required.');
      // Upload digital files to Supabase Storage
      const uploadedUrls: string[] = [];
      for (const file of files) {
        const filePath = `digital-products/${user.id}/${Date.now()}-${file.name}`;
        const { error: uploadError } = await supabase.storage.from('digital-products').upload(filePath, file, { upsert: true });
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('digital-products').getPublicUrl(filePath);
        const fileUrl = data?.publicUrl;
        if (!fileUrl) throw new Error('Failed to get file URL after upload.');
        uploadedUrls.push(fileUrl);
      }
      // Upload images if present
      let imageUrls: string[] = [];
      if (images && images.length > 0) {
        imageUrls = await Promise.all(Array.from(images).map(file => uploadToSupabase(file, 'images')));
      }
      // Upload video if present
      let videoUrl = '';
      if (video) videoUrl = await uploadToSupabase(video, 'videos');
      const { error: insertError } = await supabase.from('listings').insert({
        seller_id: user.id,
        title,
        price: price,
        category: 'digital',
        description,
        digital_file_urls: uploadedUrls, // store as array
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
        <h2 className="text-2xl font-bold mb-4">Create Digital Product</h2>
        {error && <div className="mb-2 text-red-600">{error}</div>}
        <div className="mb-2">
          <label className="block mb-1">Title</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={title} onChange={e => setTitle(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Price</label>
          <input className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" type="text" value={price} onChange={e => setPrice(e.target.value)} required placeholder="e.g., $10, Free, $5.99" />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Description</label>
          <textarea className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white" value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Digital File(s)</label>
          <input className="w-full" type="file" multiple onChange={handleFileChange} required />
          {files.length > 0 && (
            <ul className="mt-2 text-xs text-gray-600 list-disc list-inside">
              {files.map((file, idx) => (
                <li key={idx}>{file.name}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="mb-2">
          <label className="block mb-1">Images <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full" type="file" multiple onChange={e => setImages(e.target.files)} />
        </div>
        <div className="mb-2">
          <label className="block mb-1">Video <span className='text-xs text-gray-400'>(optional)</span></label>
          <input className="w-full" type="file" accept="video/*" onChange={e => setVideo(e.target.files?.[0] || null)} />
        </div>
        <div className="flex justify-start gap-2 mt-4">
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
          <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={loading}>Cancel</button>
        </div>
      </form>
    </div>
  );
};

const Digital = () => {
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
          .eq('category', 'digital')
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
      <h1 className="text-3xl font-bold mb-4 text-white">Digital Products</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>Create New Digital Product</button>
      <div className="mt-8">
        {loading ? (
          <div className="text-gray-400">Loading listings...</div>
        ) : error ? (
          <div className="text-red-400">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-gray-400">No digital products yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <Link key={listing.id} to={`/digital/${listing.id}`} className="block">
                <div className="bg-gray-950 rounded-lg shadow p-4 hover:ring-2 hover:ring-blue-400 transition">
                  <h2 className="text-xl font-semibold mb-1 text-white">{listing.title}</h2>
                  <div className="text-blue-400 font-bold mb-1">${listing.price}</div>
                  <div className="text-gray-300 mt-2 line-clamp-2">{listing.description}</div>
                  {listing.digital_file_urls && listing.digital_file_urls.length > 0 && (
                    <div className="mt-2 text-sm text-green-400">{listing.digital_file_urls.length} file(s) uploaded</div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Map listings={listings} />
      {showForm && <DigitalForm onClose={() => setShowForm(false)} />}
    </div>
  );
};

export default Digital; 