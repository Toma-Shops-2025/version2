import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { useState } from 'react';

const DigitalProductDetail = ({ listing }) => {
  const { user } = useAppContext();
  const [requesting, setRequesting] = useState(false);
  const [message, setMessage] = useState('');

  const handleRequest = async () => {
    setRequesting(true);
    setMessage('');
    const { error } = await supabase.from('orders').insert({
      listing_id: listing.id,
      seller_id: listing.seller_id,
      buyer_id: user.id,
      status: 'pending'
    });
    if (!error) {
      // Notify the seller
      await supabase.from('notifications').insert({
        user_id: listing.seller_id,
        type: 'order_requested',
        message: `You have a new digital order request for '${listing.title}'.`,
        link: '/seller-orders'
      });
      setMessage('Request sent! Waiting for seller to release the download.');
    } else {
      setMessage('Error requesting product.');
    }
    setRequesting(false);
  };

  return (
    <div>
      {/* ...product details... */}
      <button onClick={handleRequest} disabled={requesting}>
        {requesting ? 'Requesting...' : 'Request Digital Product'}
      </button>
      {message && <div>{message}</div>}
    </div>
  );
};

export default DigitalProductDetail; 