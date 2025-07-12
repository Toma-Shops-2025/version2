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
        .from('purchases')
        .select('*, listings(*)')
        .eq('buyer_id', user.id)
        .eq('confirmed', true);
      setOrders(data || []);
    };
    fetchOrders();
  }, [user]);

  const getDownloadUrl = async (filePath) => {
    console.log('Attempting to generate signed URL for:', filePath);
    setDownloading(filePath);
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
          {Array.isArray(order.listings?.digital_file_urls) && order.listings.digital_file_urls.length > 0 && (
            <div>
              {order.listings.digital_file_urls.map((fileUrl, idx) => {
                let filePath = fileUrl;
                if (filePath.startsWith('http')) {
                  const i = filePath.indexOf('digital-products/');
                  if (i !== -1) filePath = filePath.slice(i + 'digital-products/'.length);
                }
                return (
                  <button
                    key={idx}
                    onClick={() => getDownloadUrl(filePath)}
                    disabled={downloading === filePath}
                  >
                    {downloading === filePath ? 'Generating...' : `Download File ${idx + 1}`}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default MyOrders; 