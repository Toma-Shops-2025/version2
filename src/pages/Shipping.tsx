import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Shipping: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Button variant="secondary" className="mb-4" onClick={() => navigate(-1)}>Back</Button>
      <h1 className="text-3xl font-bold mb-4">📦 Shipping and Handling</h1>
      <p className="mb-4 text-lg">Shipping or local pickup — the choice is yours.</p>
      <p className="mb-4">TomaShops™ gives buyers and sellers the freedom to:</p>
      <ul className="list-disc ml-6 mb-4 space-y-1">
        <li>Buy and sell locally just like OfferUp or Facebook Marketplace</li>
        <li>Or, work out shipping details together through secure messaging</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-8 mb-2">💬 Here's how it works:</h2>
      <ol className="list-decimal ml-6 mb-4 space-y-2">
        <li>Buyer finds a listing and contacts the seller through the built-in messenger</li>
        <li>They work out local pickup or agree on a shipping method</li>
        <li>Payment is handled outside of TomaShops for now (escrow or in-person)</li>
      </ol>
      <p className="mb-4">Note: Always use a trusted method to send and receive money. For added safety, document shipping with tracking info.</p>
    </div>
  );
};

export default Shipping; 