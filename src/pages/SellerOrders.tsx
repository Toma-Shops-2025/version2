import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

const SellerOrders = () => {
  const { user } = useAppContext();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('purchases')
        .select('*, listings(*)')
        .eq('confirmed', false)
        .eq('listings.seller_id', user.id);
      setOrders(data || []);
    };
    fetchOrders();
  }, [user]);

  const markAsPaid = async (orderId, buyerId, listingTitle) => {
    await supabase.from('purchases').update({ confirmed: true }).eq('id', orderId);
    // Notify the buyer
    await supabase.from('notifications').insert({
      user_id: buyerId,
      type: 'order_paid',
      message: `Your digital order for '${listingTitle}' is now available for download!`,
      link: '/my-orders'
    });
    setOrders(orders => orders.filter(order => order.id !== orderId));
  };

  return (
    <div>
      <h2>Pending Digital Orders</h2>
      {orders.length === 0 && <div>No pending orders.</div>}
      {orders.map(order => (
        <div key={order.id}>
          <span>{order.listings?.title || 'Product'}</span>
          <button onClick={() => markAsPaid(order.id, order.buyer_id, order.listings?.title || 'Product')}>Mark as Paid</button>
        </div>
      ))}
    </div>
  );
};

export default SellerOrders; 