import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const WhyTomaShops: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Button variant="secondary" className="mb-4" onClick={() => navigate(-1)}>Back</Button>
      <h1 className="text-3xl font-bold mb-4">✅ Why Choose TomaShops™</h1>
      <p className="mb-4 text-lg">Discover a better way to buy and sell with TomaShops™ — the video-first marketplace built for trust, speed, and simplicity.</p>
      <h2 className="text-2xl font-semibold mt-8 mb-2">🚀 What Makes Us Different?</h2>
      <ul className="list-disc ml-6 mb-4 space-y-1">
        <li><b>Video-Only Listings:</b> Every item must have a video, giving buyers a full preview and boosting seller credibility.</li>
        <li><b>Mobile-Optimized Experience:</b> Just like TikTok, swipe through listings with ease.</li>
        <li><b>Local or Nationwide Options:</b> Buy and sell in your community or ship across the U.S.</li>
        <li><b>Safe Messaging:</b> Chat securely right inside the app without sharing personal contact info.</li>
        <li><b>Simple Payments:</b> Work out local deals or handle payment through trusted methods.</li>
      </ul>
      <h2 className="text-2xl font-semibold mt-8 mb-2">🌟 Perfect for:</h2>
      <ul className="list-disc ml-6 mb-4 space-y-1">
        <li>First-time sellers</li>
        <li>Small businesses</li>
        <li>Resellers</li>
        <li>Anyone tired of sketchy listings on other platforms</li>
      </ul>
      <p className="mt-8 text-lg">TomaShops™ isn't just another marketplace — it's the future of how we buy and sell.</p>
    </div>
  );
};

export default WhyTomaShops; 