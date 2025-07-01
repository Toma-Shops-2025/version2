import React from 'react';
const Safety: React.FC = () => (
  <div className="max-w-2xl mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-4">🔐 Safety Measures</h1>
    <p className="mb-4 text-lg">Your safety comes first. TomaShops™ was built with community trust in mind.</p>
    <h2 className="text-2xl font-semibold mt-8 mb-2">🔒 Key Safety Features:</h2>
    <ul className="list-disc ml-6 mb-4 space-y-1">
      <li><b>Video Listings Only:</b> Reduces fake listings and scams</li>
      <li><b>Secure Messaging:</b> No need to exchange personal info</li>
      <li><b>Optional ID Verification:</b> For extra seller or buyer confidence</li>
      <li><b>User Reporting System:</b> Spot something off? Report directly from the app</li>
      <li><b>Ratings & Reviews:</b> Check other users' reputations before engaging</li>
    </ul>
    <h2 className="text-2xl font-semibold mt-8 mb-2">💡 Meet Locally? Be Smart:</h2>
    <ul className="list-disc ml-6 mb-4 space-y-1">
      <li>Meet in public, well-lit places</li>
      <li>Bring a friend if possible</li>
      <li>Consider using a local "Safe Exchange Zone"</li>
    </ul>
    <p className="mt-8 text-lg">TomaShops™ is where trust meets technology.</p>
  </div>
);
export default Safety; 