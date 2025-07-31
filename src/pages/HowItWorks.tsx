import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const HowItWorks: React.FC = () => {
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
        <h1 className="text-3xl font-bold">🛍️ How TomaShops™ Works — Buy & Sell with Video Listings</h1>
      </div>
      <p className="mb-6 text-lg">TomaShops™ is the #1 video-first online marketplace for local and nationwide buying and selling. Our platform lets you post short product videos, connect with buyers or sellers instantly, and complete secure local or shipping-based transactions — all in one place.</p>
      
      {/* First Video Embed - Introduction */}
      <div className="mb-8">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            src="https://www.youtube.com/embed/72xUXyYISUQ?si=1CUlfurcdPTd0pM8"
            title="TomaShops Introduction Video"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">Watch how TomaShops™ revolutionizes online marketplace with video listings</p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-2">📦 Selling on TomaShops™</h2>
      <ol className="list-decimal ml-6 mb-4 space-y-2">
        <li><b>Create a Free Seller Account:</b> Sign up in seconds and start posting listings right away.</li>
        <li><b>Record a Short Product Video (Required):</b> Every item listed must include a video. This helps build buyer trust, reduces scams, and increases your chances of selling faster.</li>
        <li><b>Add Photos, Description & Price:</b> Upload product images, set your price, and write a compelling product description using SEO-friendly keywords.</li>
        <li><b>Set Pickup or Shipping Options:</b> You can sell locally or ship your item. Choose what works best for you.</li>
        <li><b>Communicate Safely with Buyers:</b> Use our secure built-in messaging system to chat directly with interested buyers.</li>
        <li><b>Close the Sale:</b> Once the transaction is complete, mark your item as "Sold" and start listing your next product!</li>
      </ol>
      <div className="mb-6"><b>✅ Pro Tip:</b> Listings with clear videos and accurate descriptions rank higher and sell faster.</div>

      {/* Second Video Embed - After Selling Section */}
      <div className="mb-8">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            src="https://www.youtube.com/embed/0XYtJzPZjUo?si=siJxDUzRAdk1LsDG"
            title="TomaShops Platform Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">See the TomaShops™ platform in action</p>
      </div>

      <h2 className="text-2xl font-semibold mt-8 mb-2">🛒 Buying on TomaShops™</h2>
      <ol className="list-decimal ml-6 mb-4 space-y-2">
        <li><b>Browse Video Listings Like a Social Feed:</b> Our TikTok-style video scroll makes it fun and fast to find what you want.</li>
        <li><b>Use Search to Find Specific Items:</b> Search for anything — electronics, cars, clothes, collectibles, furniture — and filter by location, price, or category.</li>
        <li><b>Watch, Favorite, Share, or Message:</b> Engage with listings directly. Save your favorites, share with friends, or message the seller before purchasing.</li>
        <li><b>Buy Locally or Request Shipping:</b> Choose in-person pickup or buy online with integrated payment options.</li>
        <li><b>Safe Transactions with Verified Sellers:</b> All users are encouraged to post video listings to verify item condition and authenticity.</li>
      </ol>
      <h2 className="text-xl font-semibold mt-8 mb-2">🔒 Safe & Secure Marketplace</h2>
      <ul className="list-disc ml-6 mb-4 space-y-1">
        <li><b>Video Listings Required</b> — Reduces scams, increases buyer confidence</li>
        <li><b>Secure Messaging</b> — Talk without giving out personal contact info</li>
        <li><b>Flexible Delivery Options</b> — Local meetups or tracked shipping</li>
        <li><b>Privacy First</b> — Your data is protected and never sold</li>
        <li><b>Trusted Support</b> — Email us at <a href="mailto:support@tomashops.com" className="text-blue-600 underline">support@tomashops.com</a> or call 954-TOMASHOPS</li>
      </ul>
      <h2 className="text-xl font-semibold mt-8 mb-2">🚀 Why Choose TomaShops™?</h2>
      <ul className="list-disc ml-6 mb-4 space-y-1">
        <li>First video-only marketplace for buying & selling products</li>
        <li>Works like Facebook Marketplace + OfferUp, but better</li>
        <li>Shop and list using short-form product videos</li>
        <li>Designed for mobile-first users, available on all devices</li>
        <li>SEO-optimized listings help you get found faster in search engines</li>
      </ul>

      {/* Third Video Embed - Near Bottom */}
      <div className="mb-8">
        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            className="absolute top-0 left-0 w-full h-full rounded-lg shadow-lg"
            src="https://www.youtube.com/embed/uS_JhdsZpcg?si=ytiuWXlm_xTIGPP9"
            title="TomaShops Additional Demo"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
        <p className="text-sm text-gray-600 mt-2 text-center">Learn more about TomaShops™ features and benefits</p>
      </div>

      <div className="mt-8 p-4 bg-teal-50 border-l-4 border-teal-400 rounded">
        <b>🛍️ Get Started Today</b><br />
        Whether you're decluttering, launching a side hustle, or just looking for a great deal — TomaShops™ is your go-to platform.
      </div>
    </div>
  );
};

export default HowItWorks; 