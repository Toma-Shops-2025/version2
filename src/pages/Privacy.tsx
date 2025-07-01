import React from 'react';
const Privacy: React.FC = () => (
  <div className="max-w-2xl mx-auto py-8 px-4">
    <h1 className="text-3xl font-bold mb-4">🛡️ Privacy Policy</h1>
    <p className="mb-4 text-lg">Effective Date: [Insert Date]</p>
    <p className="mb-4">TomaShops™ respects your privacy. This policy outlines how we collect, use, and protect your information.</p>
    <h2 className="text-2xl font-semibold mt-8 mb-2">What We Collect:</h2>
    <ul className="list-disc ml-6 mb-4 space-y-1">
      <li>Name, email, and optional phone number</li>
      <li>Location (for local buying/selling)</li>
      <li>Listings, messages, and reviews</li>
    </ul>
    <h2 className="text-2xl font-semibold mt-8 mb-2">How We Use It:</h2>
    <ul className="list-disc ml-6 mb-4 space-y-1">
      <li>To connect buyers and sellers</li>
      <li>To personalize your experience</li>
      <li>To prevent fraud or abuse</li>
    </ul>
    <h2 className="text-2xl font-semibold mt-8 mb-2">We Never:</h2>
    <ul className="list-disc ml-6 mb-4 space-y-1">
      <li>Sell your personal info</li>
      <li>Use your data without consent</li>
    </ul>
    <p className="mt-8">For questions, email <a href="mailto:support@tomashops.com" className="text-blue-600 underline">support@tomashops.com</a></p>
  </div>
);
export default Privacy; 