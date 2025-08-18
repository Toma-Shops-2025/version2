import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Briefcase, ExternalLink } from 'lucide-react';
import ApplicationForm from './ApplicationForm';

interface ApplyButtonProps {
  jobListing: any;
  className?: string;
}

const ApplyButton: React.FC<ApplyButtonProps> = ({ jobListing, className = '' }) => {
  const [showApplicationForm, setShowApplicationForm] = useState(false);

  const handleApply = () => {
    if (jobListing.use_builtin_application) {
      setShowApplicationForm(true);
    } else if (jobListing.application_url) {
      window.open(jobListing.application_url, '_blank');
    }
  };

  const handleApplicationSuccess = () => {
    // Could show a success message or redirect
    console.log('Application submitted successfully!');
  };

  // Don't show apply button if no application method is available
  if (!jobListing.use_builtin_application && !jobListing.application_url) {
    return null;
  }

  return (
    <>
      <Button
        onClick={handleApply}
        className={`bg-green-600 hover:bg-green-700 text-white ${className}`}
      >
        <Briefcase className="h-4 w-4 mr-2" />
        Apply for Job
        {!jobListing.use_builtin_application && (
          <ExternalLink className="h-4 w-4 ml-2" />
        )}
      </Button>

      {showApplicationForm && jobListing.use_builtin_application && (
        <ApplicationForm
          jobListing={jobListing}
          onClose={() => setShowApplicationForm(false)}
          onSubmitSuccess={handleApplicationSuccess}
        />
      )}
    </>
  );
};

export default ApplyButton; 