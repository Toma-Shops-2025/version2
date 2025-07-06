import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import ListingsGrid from '@/components/ListingsGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';

const Profile: React.FC = () => {
  const { user, loading } = useAppContext();
  console.log('Profile user:', user); // Debug log
  const [listings, setListings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      return;
    }
    const fetchListings = async () => {
      setError(null);
      try {
        const { data, error } = await supabase.from('listings').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
        if (error) throw error;
        setListings(data || []);
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchListings();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchOffers = async () => {
      setOffersLoading(true);
      setOffersError(null);
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('seller_id', user.id)
          .order('created_at', { ascending: false });
        if (error) throw error;
        setOffers(data || []);
      } catch (err: any) {
        setOffersError(err.message);
      } finally {
        setOffersLoading(false);
      }
    };
    fetchOffers();
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

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
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
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-2">Back</Button>
      </div>
      <div className="w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Your Listings</h2>
        {error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-400 py-8">You have no listings yet.</div>
        ) : (
          <ListingsGrid listings={listings} />
        )}
      </div>
      <div className="w-full max-w-3xl mt-8">
        <h2 className="text-xl font-semibold mb-4">Offers Received</h2>
        {offersLoading ? (
          <div className="text-center text-gray-400 py-8">Loading offers...</div>
        ) : offersError ? (
          <div className="text-center text-red-500 py-8">{offersError}</div>
        ) : offers.length === 0 ? (
          <div className="text-center text-gray-400 py-8">You have no offers yet.</div>
        ) : (
          <ul className="divide-y divide-gray-700">
            {offers.map((offer) => (
              <li key={offer.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-semibold">Offer Amount: <span className="text-yellow-400">${offer.amount}</span></div>
                  <div className="text-sm text-gray-400">From User ID: {offer.buyer_id}</div>
                  <div className="text-sm text-gray-400">Listing ID: {offer.listing_id}</div>
                  <div className="text-xs text-gray-500">{new Date(offer.created_at).toLocaleString()}</div>
                </div>
                {/* You can add Accept/Reject buttons here if needed */}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Profile; 