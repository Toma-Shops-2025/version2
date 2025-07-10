import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Link } from 'react-router-dom';
import Map from '@/components/Map';

const DigitalForm = ({ onClose }: { onClose: () => void }) => {
  const { user } = useAppContext();
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (!user) throw new Error('You must be logged in to create a digital product listing.');
      if (!file) throw new Error('A digital file is required.');
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const filePath = `digital-products/${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage.from('digital-products').upload(filePath, file, { upsert: true });
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('digital-products').getPublicUrl(filePath);
      const fileUrl = data?.publicUrl;
      if (!fileUrl) throw new Error('Failed to get file URL after upload.');
      const { error: insertError } = await supabase.from('listings').insert({
        seller_id: user.id,
        title,
        price: parseFloat(price),
        category: 'digital',
        description,
        location,
        digital_file_url: fileUrl
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
        <div className="mb-2">
          <label className="block mb-1">Digital File</label>
          <input className="w-full" type="file" onChange={e => setFile(e.target.files?.[0] || null)} required />
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button type="button" className="px-4 py-2 rounded bg-gray-200" onClick={onClose} disabled={loading}>Cancel</button>
          <button type="submit" className="px-4 py-2 rounded bg-blue-600 text-white" disabled={loading}>{loading ? 'Submitting...' : 'Submit'}</button>
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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Digital Products</h1>
      <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={() => setShowForm(true)}>Create New Digital Product</button>
      <div className="mt-8">
        {loading ? (
          <div className="text-gray-500">Loading listings...</div>
        ) : error ? (
          <div className="text-red-600">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-gray-500">No digital products yet.</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {listings.map(listing => (
              <Link key={listing.id} to={`/digital/${listing.id}`} className="block">
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow p-4 hover:ring-2 hover:ring-blue-400 transition">
                  <h2 className="text-xl font-semibold mb-1">{listing.title}</h2>
                  <div className="text-blue-700 font-bold mb-1">${listing.price}</div>
                  <div className="text-gray-700 mb-1">{listing.location}</div>
                  <div className="text-gray-600 mt-2 line-clamp-2">{listing.description}</div>
                  {listing.digital_file_url && (
                    <div className="mt-2 text-sm text-green-700">Digital file uploaded</div>
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