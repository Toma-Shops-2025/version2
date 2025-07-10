import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center mb-6 text-teal-600 hover:underline font-semibold"
    >
      <ArrowLeft className="h-5 w-5 mr-1" /> Back
    </button>
  );
};

export default BackButton; 