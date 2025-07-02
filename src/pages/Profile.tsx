import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import ListingsGrid from '@/components/ListingsGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user } = useAppContext();
  console.log('Profile user:', user); // Debug log
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [userLoading, setUserLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      setUserLoading(false);
      return;
    }
    setUserLoading(false);
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from('listings').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;
        setListings(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [user]);

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `profile-pics/${user.id}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, { upsert: true });
    if (uploadError) {
      setError('Failed to upload profile picture');
      setUploading(false);
      return;
    }
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    setProfilePic(data.publicUrl);
    setUploading(false);
  };

  useEffect(() => {
    // Load profile pic if exists
    if (!user) return;
    const filePath = `profile-pics/${user.id}.png`;
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    if (data && data.publicUrl && !data.publicUrl.endsWith('/')) {
      setProfilePic(data.publicUrl);
    } else {
      setProfilePic(null);
    }
  }, [user]);

  if (userLoading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-black text-white">You must be logged in to view your profile.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center py-8 bg-black text-white">
      <div className="bg-gray-900 rounded-lg shadow p-6 w-full max-w-xl flex flex-col items-center mb-8">
        <div className="relative mb-4">
          <img
            src={profilePic || '/placeholder.svg'}
            alt="Profile"
            className="w-28 h-28 rounded-full object-cover border-4 border-yellow-400 bg-gray-800"
            onError={e => (e.currentTarget.src = '/placeholder.svg')}
          />
          <label className="absolute bottom-0 right-0 bg-yellow-400 text-black rounded-full p-2 cursor-pointer hover:bg-yellow-300 transition">
            <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} disabled={uploading} />
            <span className="text-xs font-bold">Edit</span>
          </label>
        </div>
        <h1 className="text-2xl font-bold mb-1">{user.name || user.email}</h1>
        <p className="text-gray-400 mb-2">{user.email}</p>
        <p className="text-gray-500 text-sm mb-2">User ID: {user.id}</p>
        <div className="onesignal-customlink-container" />
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-2">Back</Button>
      </div>
      <div className="w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Your Listings</h2>
        {loading ? (
          <div className="text-center text-gray-400 py-8">Loading your listings...</div>
        ) : error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-400 py-8">You have no listings yet.</div>
        ) : (
          <ListingsGrid listings={listings} />
        )}
      </div>
    </div>
  );
};

export default Profile; 