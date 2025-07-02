import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const Terms: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <Button variant="secondary" className="mb-4" onClick={() => navigate(-1)}>Back</Button>
      <h1 className="text-3xl font-bold mb-4">📜 Terms of Service</h1>
      <p className="mb-4 text-lg">Welcome to TomaShops™. By using our platform, you agree to these terms.</p>
      <ol className="list-decimal ml-6 mb-4 space-y-2">
        <li><b>Account Responsibility:</b> You are responsible for your account and all activity under it.</li>
        <li><b>Video Listings Required:</b> All items must include a video for listing approval.</li>
        <li><b>No Prohibited Items:</b> You may not list illegal, dangerous, or restricted items.</li>
        <li><b>Respect Others:</b> No harassment, hate speech, or abusive behavior.</li>
        <li><b>Payment & Fees:</b> Fees may apply for certain transactions or features. See our FAQ for details.</li>
        <li><b>Termination:</b> We reserve the right to suspend or terminate accounts for violations.</li>
      </ol>
      <div className="mt-8 p-4 bg-gray-50 border-l-4 border-gray-400 rounded">
        <b>Questions?</b> Contact us at <a href="mailto:support@tomashops.com" className="text-blue-600 underline">support@tomashops.com</a>.
      </div>
    </div>
  );
};

export default Terms; 