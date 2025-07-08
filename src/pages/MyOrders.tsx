import React, { useEffect, useState } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';

const MyOrders: React.FC = () => {
  const { user } = useAppContext();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setLoading(true);
    supabase
      .from('purchases')
      .select('*, listing:listings(*)')
      .eq('buyer_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        setOrders(data || []);
        setLoading(false);
      });
  }, [user]);

  if (!user) return <div className="p-8 text-center">Please log in to view your orders.</div>;

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-2xl font-bold mb-6">My Orders</h1>
      {loading ? (
        <div>Loading...</div>
      ) : orders.length === 0 ? (
        <div className="text-center text-gray-500">No orders yet.</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <div key={order.id} className="border rounded p-4 flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <div className="font-semibold">{order.listing?.title || 'Listing'}</div>
                <div className="text-gray-500 text-sm">Order placed: {new Date(order.created_at).toLocaleString()}</div>
                <div className="text-gray-500 text-sm">Status: {order.status || 'Pending'}</div>
              </div>
              <Button asChild className="mt-2 md:mt-0">
                <a href={order.listing ? `/listing/${order.listing.id}` : '#'}>View Listing</a>
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOrders; 