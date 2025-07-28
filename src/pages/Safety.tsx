import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Safety: React.FC = () => {
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
        <h1 className="text-3xl font-bold">🔐 Safety Measures</h1>
      </div>
      <p className="mb-4 text-lg">Your safety comes first. TomaShops™ was built with community trust in mind.</p>
      <ul className="list-disc ml-6 mb-4 space-y-2">
        <li><b>Video Listings Required:</b> Every item must have a video, reducing scams and increasing transparency.</li>
        <li><b>Verified Users:</b> We encourage all users to verify their identity for added trust.</li>
        <li><b>Secure Messaging:</b> Communicate safely within the app without sharing personal contact info.</li>
        <li><b>Meet in Safe Locations:</b> Always meet in public, well-lit places for local transactions.</li>
        <li><b>Report Suspicious Activity:</b> Use the report feature or contact support@tomashops.com if you encounter anything suspicious.</li>
      </ul>
      <div className="mt-8 p-4 bg-yellow-50 border-l-4 border-yellow-400 rounded">
        <b>Stay Safe!</b> Never send money outside the app or share sensitive information with strangers.
      </div>
    </div>
  );
};

export default Safety; 