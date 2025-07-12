import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

const MyOrders = () => {
  const { user } = useAppContext();
  const [orders, setOrders] = useState([]);
  const [downloading, setDownloading] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      const { data } = await supabase
        .from('orders')
        .select('*, listings(*)')
        .eq('buyer_id', user.id);
      setOrders(data || []);
    };
    fetchOrders();
  }, [user]);

  const getDownloadUrl = async (filePath) => {
    setDownloading(filePath);
    // filePath should be the storage path, e.g. 'digital-products/userid/filename.pdf'
    const { data, error } = await supabase
      .storage
      .from('digital-products')
      .createSignedUrl(filePath, 60 * 60); // 1 hour
    setDownloading(null);
    if (error) {
      alert('Error generating download link');
      return;
    }
    window.open(data.signedUrl, '_blank');
  };

  return (
    <div>
      <h2>My Digital Orders</h2>
      {orders.length === 0 && <div>No orders yet.</div>}
      {orders.map(order => (
        <div key={order.id}>
          <span>{order.listings?.title || 'Product'}</span>
          {order.status === 'paid' && order.listings?.digital_file_url && (
            <button
              onClick={() => {
                let filePath = order.listings.digital_file_url;
                if (filePath.startsWith('http')) {
                  const idx = filePath.indexOf('/digital-products/');
                  if (idx !== -1) filePath = filePath.slice(idx + 1);
                }
                getDownloadUrl(filePath);
              }}
              disabled={downloading === order.listings?.digital_file_url}
            >
              {downloading === order.listings?.digital_file_url ? 'Generating...' : 'Download'}
            </button>
          )}
          {order.status === 'pending' && <span>Waiting for seller to release</span>}
        </div>
      ))}
    </div>
  );
};

export default MyOrders; 