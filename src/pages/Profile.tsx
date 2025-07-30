import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import ListingsGrid from '@/components/ListingsGrid';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useParams } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import Reviews from '@/components/Reviews';

const Profile: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, loading: currentUserLoading } = useAppContext();
  const [profileUser, setProfileUser] = useState<any>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [listings, setListings] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [offers, setOffers] = useState<any[]>([]);
  const [offersLoading, setOffersLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [trashedListings, setTrashedListings] = useState<any[]>([]);
  const [pendingPurchases, setPendingPurchases] = useState<any[]>([]);
  const [reportReason, setReportReason] = useState('');
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileUser = async () => {
      setProfileLoading(true);
      const targetUserId = id || currentUser?.id;
      if (!targetUserId) {
        setProfileLoading(false);
        return;
      }

      const { data, error } = await supabase.from('users').select('*').eq('id', targetUserId).single();
      if (error) {
        setError('Profile not found.');
      } else {
        setProfileUser(data);
      }
      setProfileLoading(false);
    };

    if (!currentUserLoading) {
      fetchProfileUser();
    }
  }, [id, currentUser, currentUserLoading]);

  const handleBlockUser = async () => {
    if (!currentUser || !profileUser) return;

    const { error } = await supabase.from('blocks').insert({
      blocker_id: currentUser.id,
      blocked_id: profileUser.id,
    });

    if (error) {
      console.error('Error blocking user:', error);
      alert('Failed to block user. They may already be blocked.');
    } else {
      alert('User blocked successfully.');
    }
  };

  useEffect(() => {
    if (!profileUser) {
      return;
    }
    const fetchListings = async () => {
      setError(null);
      try {
        const { data, error } = await supabase.from('listings').select('*').eq('seller_id', profileUser.id).order('created_at', { ascending: false });
        if (error) throw error;
        setListings((data || []).filter((l: any) => l.status !== 'trashed'));
        setTrashedListings((data || []).filter((l: any) => l.status === 'trashed'));
      } catch (err: any) {
        setError(err.message);
      }
    };
    fetchListings();
  }, [profileUser]);

  useEffect(() => {
    if (!profileUser) return;
    const fetchOffers = async () => {
      setOffersLoading(true);
      setOffersError(null);
      try {
        const { data, error } = await supabase
          .from('offers')
          .select('*')
          .eq('seller_id', profileUser.id)
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
  }, [profileUser]);

  useEffect(() => {
    if (!profileUser) return;
    const fetchPendingPurchases = async () => {
      // Get all digital listings by this seller
      const { data: digitalListings, error: digitalError } = await supabase
        .from('listings')
        .select('id, title')
        .eq('seller_id', profileUser.id)
        .eq('category', 'digital');
      if (digitalError) return;
      const digitalIds = (digitalListings || []).map((l: any) => l.id);
      if (digitalIds.length === 0) {
        setPendingPurchases([]);
        return;
      }
      // Get all unconfirmed purchases for these listings
      const { data: purchases, error: purchasesError } = await supabase
        .from('purchases')
        .select('id, listing_id, buyer_id, confirmed, created_at')
        .in('listing_id', digitalIds)
        .eq('confirmed', false);
      if (purchasesError) return;
      // Attach listing title
      const purchasesWithTitle = (purchases || []).map((p: any) => ({
        ...p,
        title: (digitalListings || []).find((l: any) => l.id === p.listing_id)?.title || ''
      }));
      setPendingPurchases(purchasesWithTitle);
    };
    fetchPendingPurchases();
  }, [profileUser]);

  const handleReportUser = async () => {
    if (!currentUser || !profileUser || !reportReason) return;

    const { error } = await supabase.from('reports').insert({
      reported_by: currentUser.id,
      reported_user_id: profileUser.id,
      reason: reportReason,
    });

    if (error) {
      console.error('Error reporting user:', error);
      alert('Failed to submit report.');
    } else {
      alert('Report submitted successfully.');
      setIsReportDialogOpen(false);
      setReportReason('');
    }
  };

  const handleProfilePicChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUser) return;
    setUploading(true);
    const fileExt = file.name.split('.').pop();
    const filePath = `profile-pics/${currentUser.id}.${fileExt}`;
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
    if (!profileUser) return;
    const filePath = `profile-pics/${profileUser.id}.png`;
    const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
    if (data && data.publicUrl && !data.publicUrl.endsWith('/')) {
      setProfilePic(data.publicUrl);
    } else {
      setProfilePic(null);
    }
  }, [profileUser]);

  const handleMarkAsSold = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'sold', sold_at: new Date().toISOString() })
        .eq('id', listingId);
      if (error) throw error;
      const { data, error: fetchError } = await supabase.from('listings').select('*').eq('seller_id', profileUser.id).order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setListings(data || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDeleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'trashed', trashed_at: new Date().toISOString() })
        .eq('id', listingId);
      if (error) throw error;
      const { data, error: fetchError } = await supabase.from('listings').select('*').eq('seller_id', profileUser.id).order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setListings(data || []);
      setTrashedListings((data || []).filter((l: any) => l.status === 'trashed'));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRestoreListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'active', trashed_at: null })
        .eq('id', listingId);
      if (error) throw error;
      const { data, error: fetchError } = await supabase.from('listings').select('*').eq('seller_id', profileUser.id).order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setListings((data || []).filter((l: any) => l.status !== 'trashed'));
      setTrashedListings((data || []).filter((l: any) => l.status === 'trashed'));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePermanentDeleteListing = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);
      if (error) throw error;
      const { data, error: fetchError } = await supabase.from('listings').select('*').eq('seller_id', profileUser.id).order('created_at', { ascending: false });
      if (fetchError) throw fetchError;
      setListings((data || []).filter((l: any) => l.status !== 'trashed'));
      setTrashedListings((data || []).filter((l: any) => l.status === 'trashed'));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleConfirmPurchase = async (purchaseId: string) => {
    await supabase.from('purchases').update({ confirmed: true }).eq('id', purchaseId);
    setPendingPurchases(pendingPurchases.filter((p) => p.id !== purchaseId));
  };

  if (profileLoading || currentUserLoading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  if (!profileUser) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Profile not found or you must be logged in.</div>;

  const isOwnProfile = currentUser && profileUser.id === currentUser.id;

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
          {isOwnProfile && (
            <label className="absolute bottom-0 right-0 bg-yellow-400 text-black rounded-full p-2 cursor-pointer hover:bg-yellow-300 transition">
              <input type="file" accept="image/*" className="hidden" onChange={handleProfilePicChange} disabled={uploading} />
              <span className="text-xs font-bold">Edit</span>
            </label>
          )}
        </div>
        <h1 className="text-2xl font-bold mb-1">{profileUser.name || profileUser.email}</h1>
        <p className="text-gray-400 mb-2">{profileUser.email}</p>
        <p className="text-gray-500 text-sm mb-2">User ID: {profileUser.id}</p>
        <Button variant="secondary" onClick={() => navigate(-1)} className="mt-2">Back</Button>
        <div className="flex gap-2 mt-4">
          {!isOwnProfile && currentUser && (
            <>
              <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline" onClick={() => setIsReportDialogOpen(true)}>Report User</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Report User</DialogTitle>
                  </DialogHeader>
                  <Textarea
                    placeholder="Please provide a reason for your report..."
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                  />
                  <Button onClick={handleReportUser}>Submit Report</Button>
                </DialogContent>
              </Dialog>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Block User</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This action will prevent this user from contacting you. You will not see their messages or listings. This can be undone later if needed.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBlockUser}>Continue</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
      <div className="w-full max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Listings</h2>
        {error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : listings.length === 0 ? (
          <div className="text-center text-gray-400 py-8">This user has no listings yet.</div>
        ) : (
          <ListingsGrid listings={listings} isOwner={isOwnProfile} onMarkAsSold={handleMarkAsSold} onDelete={handleDeleteListing} />
        )}
      </div>
      <div className="w-full max-w-3xl mt-8">
        <Reviews sellerId={profileUser.id} />
      </div>
      {isOwnProfile && (
        <>
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
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="w-full max-w-3xl mt-8">
            <h2 className="text-xl font-semibold mb-4">Pending Digital Purchases</h2>
            {pendingPurchases.length === 0 ? (
              <div className="text-center text-gray-400 py-8">No pending purchases to confirm.</div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {pendingPurchases.map((purchase) => (
                  <li key={purchase.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold">{purchase.title}</div>
                      <div className="text-sm text-gray-400">Buyer ID: {purchase.buyer_id}</div>
                      <div className="text-xs text-gray-500">{new Date(purchase.created_at).toLocaleString()}</div>
                    </div>
                    <Button onClick={() => handleConfirmPurchase(purchase.id)}>Confirm Purchase</Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="w-full max-w-3xl mt-8">
            <h2 className="text-xl font-semibold mb-4">Trashed Listings</h2>
            {trashedListings.length === 0 ? (
              <div className="text-center text-gray-400 py-8">You have no trashed listings.</div>
            ) : (
              <ul className="divide-y divide-gray-700">
                {trashedListings.map((listing) => (
                  <li key={listing.id} className="py-4 flex flex-col md:flex-row md:items-center md:justify-between">
                    <div>
                      <div className="font-semibold">{listing.title}</div>
                      <div className="text-sm text-gray-400">Trashed on: {new Date(listing.trashed_at).toLocaleDateString()}</div>
                    </div>
                    <div className="flex gap-2 mt-2 md:mt-0">
                      <Button variant="outline" onClick={() => handleRestoreListing(listing.id)}>Restore</Button>
                      <Button variant="destructive" onClick={() => handlePermanentDeleteListing(listing.id)}>Delete Permanently</Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Profile; 