import React from 'react';
const Terms: React.FC = () => (
  <div className="max-w-2xl mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-4">📜 Terms of Service</h1>
    <p className="mb-4 text-lg">Welcome to TomaShops™. By using our platform, you agree to these terms.</p>
    <h2 className="text-2xl font-semibold mt-8 mb-2">✅ Users Must:</h2>
    <ul className="list-disc ml-6 mb-4 space-y-1">
      <li>Be 18 years or older</li>
      <li>Provide accurate info in listings</li>
      <li>Use video for every listing</li>
      <li>Communicate respectfully</li>
    </ul>
    <h2 className="text-2xl font-semibold mt-8 mb-2">🚫 Prohibited:</h2>
    <ul className="list-disc ml-6 mb-4 space-y-1">
      <li>Posting illegal or prohibited items</li>
      <li>Spamming or harassing other users</li>
      <li>Misleading video or product info</li>
    </ul>
    <h2 className="text-2xl font-semibold mt-8 mb-2">🛠️ TomaShops May:</h2>
    <ul className="list-disc ml-6 mb-4 space-y-1">
      <li>Remove listings that break our rules</li>
      <li>Suspend or ban accounts for abuse</li>
      <li>Update these terms at any time</li>
    </ul>
    <p className="mt-8">Use the app responsibly, and enjoy the power of video-first selling!</p>
  </div>
);
export default Terms; 