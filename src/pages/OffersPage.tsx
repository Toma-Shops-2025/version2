import React, { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { useNavigate, Link } from 'react-router-dom';

const OffersPage: React.FC = () => {
  const { user, loading } = useAppContext();
  const [offers, setOffers] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [offersError, setOffersError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    const fetchOffers = async () => {
      setDataLoading(true);
      setOffersError(null);
      if (!user) {
        setOffers([]);
        setDataLoading(false);
        return;
      }
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
        setDataLoading(false);
      }
    };
    fetchOffers();
  }, [user, loading]);

  const handleAction = async (offerId: string, action: 'accept' | 'reject') => {
    setActionLoading(offerId + action);
    // You can update the offer status in your DB here
    const { error } = await supabase
      .from('offers')
      .update({ status: action })
      .eq('id', offerId);
    if (!error) {
      setOffers(offers => offers.map(o => o.id === offerId ? { ...o, status: action } : o));
    }
    setActionLoading(null);
  };

  if (loading || dataLoading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading...</div>;
  if (!user) return <div className="min-h-screen flex items-center justify-center bg-black text-white">You must be logged in to view offers.</div>;

  return (
    <div className="min-h-screen flex flex-col items-center py-8 bg-black text-white">
      <div className="w-full max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">Offers Received</h2>
        {dataLoading ? (
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
                  <div className="text-sm text-gray-400">From Buyer: <Link to={`/profile/${offer.buyer_id}`} className="underline">{offer.buyer_id}</Link></div>
                  <div className="text-sm text-gray-400">Listing: <Link to={`/listing/${offer.listing_id}`} className="underline">{offer.listing_id}</Link></div>
                  <div className="text-xs text-gray-500">{new Date(offer.created_at).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Status: {offer.status || 'pending'}</div>
                </div>
                <div className="flex space-x-2 mt-2 md:mt-0">
                  <Button
                    variant="secondary"
                    disabled={actionLoading === offer.id + 'accept' || offer.status === 'accept'}
                    onClick={() => handleAction(offer.id, 'accept')}
                  >
                    {actionLoading === offer.id + 'accept' ? 'Accepting...' : 'Accept'}
                  </Button>
                  <Button
                    variant="destructive"
                    disabled={actionLoading === offer.id + 'reject' || offer.status === 'reject'}
                    onClick={() => handleAction(offer.id, 'reject')}
                  >
                    {actionLoading === offer.id + 'reject' ? 'Rejecting...' : 'Reject'}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default OffersPage; 