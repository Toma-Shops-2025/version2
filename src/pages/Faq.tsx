import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Faq: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Button variant="secondary" className="mb-4" onClick={() => navigate(-1)}>Back</Button>
      <div className="flex items-center gap-4 mb-6">
        <img 
          src="/tomabot-avatar.png" 
          alt="TomaBot AI Assistant" 
          className="w-12 h-12 rounded-full border-2 border-blue-200 shadow-lg"
        />
        <h1 className="text-3xl font-bold">❓ Frequently Asked Questions (FAQ)</h1>
      </div>
      <p className="mb-4 text-gray-600">Need more help? Chat with TomaBot using the chat bubble in the bottom right corner! 🤖</p>
      <ul className="mb-4 space-y-4">
        <li><b>📹 Do I have to post a video to list an item?</b><br />Yes. Every product listed on TomaShops™ must include a short video to increase trust and visibility.</li>
        <li><b>🛍️ Can I sell items locally?</b><br />Absolutely! Buyers and sellers can meet locally to exchange items, just like OfferUp or Facebook Marketplace.</li>
        <li><b>🚚 Can I ship items too?</b><br />Yes. Shipping is worked out between buyers and sellers through the in-app messaging system.</li>
        <li><b>💬 How do I talk to a buyer or seller?</b><br />Use our secure chat feature within the app. No need to share personal contact info.</li>
        <li><b>💳 How do I get paid?</b><br />Buyers and sellers can agree on payment methods, including cash, Venmo, Cash App, etc.</li>
        <li><b>🧾 Does TomaShops take a fee?</b><br />Currently, TomaShops™ does not take a cut from your sales. You keep 100% of your profit.</li>
      </ul>
    </div>
  );
};

export default Faq; 