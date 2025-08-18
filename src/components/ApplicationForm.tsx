import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { X, Upload, FileText } from 'lucide-react';

interface ApplicationFormProps {
  jobListing: any;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

interface CustomQuestion {
  id: string;
  question_text: string;
  question_type: string;
  required: boolean;
  options?: any;
}

const ApplicationForm: React.FC<ApplicationFormProps> = ({ jobListing, onClose, onSubmitSuccess }) => {
  const { user } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customQuestions, setCustomQuestions] = useState<CustomQuestion[]>([]);
  
  // Application form data
  const [applicantName, setApplicantName] = useState(user?.name || '');
  const [applicantEmail, setApplicantEmail] = useState(user?.email || '');
  const [applicantPhone, setApplicantPhone] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [customAnswers, setCustomAnswers] = useState<Record<string, string>>({});

  // Check if user has already applied
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    const checkExistingApplication = async () => {
      if (!user || !jobListing) return;
      
      const { data } = await supabase
        .from('applications')
        .select('id')
        .eq('job_listing_id', jobListing.id)
        .eq('applicant_id', user.id)
        .single();
        
      if (data) {
        setHasApplied(true);
      }
    };

    const fetchCustomQuestions = async () => {
      if (!jobListing?.id) return;
      
      const { data, error } = await supabase
        .from('application_questions')
        .select('*')
        .eq('job_listing_id', jobListing.id)
        .order('order_index');
        
      if (!error && data) {
        setCustomQuestions(data);
        // Initialize answers object
        const initialAnswers: Record<string, string> = {};
        data.forEach(q => {
          initialAnswers[q.id] = '';
        });
        setCustomAnswers(initialAnswers);
      }
    };

    checkExistingApplication();
    fetchCustomQuestions();
  }, [user, jobListing]);

  const uploadResume = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop();
    const filePath = `resumes/${user?.id}/${Date.now()}_${file.name}`;
    
    const { data, error } = await supabase.storage
      .from('uploads')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });
      
    if (error) throw error;
    
    const { data: publicUrlData } = supabase.storage.from('uploads').getPublicUrl(filePath);
    if (!publicUrlData?.publicUrl) throw new Error('Failed to get resume URL');
    
    return publicUrlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to apply for jobs.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Upload resume if provided
      let resumeUrl = '';
      if (resumeFile) {
        resumeUrl = await uploadResume(resumeFile);
      }

      // Create application
      const { data: applicationData, error: applicationError } = await supabase
        .from('applications')
        .insert({
          job_listing_id: jobListing.id,
          applicant_id: user.id,
          employer_id: jobListing.seller_id,
          applicant_name,
          applicant_email,
          applicant_phone,
          resume_url: resumeUrl,
          cover_letter: coverLetter,
          status: 'pending'
        })
        .select()
        .single();

      if (applicationError) throw applicationError;

      // Save custom question answers
      if (customQuestions.length > 0 && applicationData) {
        const answerInserts = customQuestions
          .filter(q => customAnswers[q.id]?.trim())
          .map(q => ({
            application_id: applicationData.id,
            question_id: q.id,
            answer_text: customAnswers[q.id]
          }));

        if (answerInserts.length > 0) {
          const { error: answersError } = await supabase
            .from('application_answers')
            .insert(answerInserts);
          
          if (answersError) throw answersError;
        }
      }

      // Send notification to employer
      await supabase.from('notifications').insert({
        user_id: jobListing.seller_id,
        title: 'New Job Application',
        message: `${applicantName} has applied for your job: ${jobListing.title}`,
        type: 'application',
        related_id: applicationData.id
      });

      // Send auto-reply if configured
      if (jobListing.auto_reply_message) {
        await supabase.from('notifications').insert({
          user_id: user.id,
          title: 'Application Received',
          message: jobListing.auto_reply_message,
          type: 'application',
          related_id: applicationData.id
        });
      }

      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (hasApplied) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-900 p-6 rounded-lg shadow-lg w-full max-w-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Application Status</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="text-center py-6">
            <div className="text-green-600 text-4xl mb-4">✓</div>
            <p className="text-lg font-semibold mb-2">Already Applied</p>
            <p className="text-gray-600">You have already submitted an application for this job.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Apply for: {jobListing.title}</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {jobListing.company_name} • {jobListing.location}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input
                type="text"
                value={applicantName}
                onChange={(e) => setApplicantName(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                type="email"
                value={applicantEmail}
                onChange={(e) => setApplicantEmail(e.target.value)}
                className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input
              type="tel"
              value={applicantPhone}
              onChange={(e) => setApplicantPhone(e.target.value)}
              className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
              placeholder="(555) 123-4567"
            />
          </div>

          {jobListing.allow_resume_upload && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Resume {jobListing.allow_resume_upload ? '*' : '(Optional)'}
              </label>
              <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
                  className="hidden"
                  id="resume-upload"
                />
                <label
                  htmlFor="resume-upload"
                  className="flex flex-col items-center cursor-pointer"
                >
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {resumeFile ? resumeFile.name : 'Click to upload resume (PDF, DOC, DOCX)'}
                  </span>
                </label>
              </div>
            </div>
          )}

          {(jobListing.require_cover_letter || customQuestions.some(q => q.question_text.toLowerCase().includes('cover'))) && (
            <div>
              <label className="block text-sm font-medium mb-1">
                Cover Letter {jobListing.require_cover_letter ? '*' : '(Optional)'}
              </label>
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={4}
                className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                placeholder="Tell us why you're interested in this position..."
                required={jobListing.require_cover_letter}
              />
            </div>
          )}

          {/* Custom Questions */}
          {customQuestions.map((question) => (
            <div key={question.id}>
              <label className="block text-sm font-medium mb-1">
                {question.question_text} {question.required && '*'}
              </label>
              {question.question_type === 'textarea' ? (
                <textarea
                  value={customAnswers[question.id] || ''}
                  onChange={(e) => setCustomAnswers(prev => ({
                    ...prev,
                    [question.id]: e.target.value
                  }))}
                  rows={3}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                  required={question.required}
                />
              ) : question.question_type === 'yes_no' ? (
                <select
                  value={customAnswers[question.id] || ''}
                  onChange={(e) => setCustomAnswers(prev => ({
                    ...prev,
                    [question.id]: e.target.value
                  }))}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                  required={question.required}
                >
                  <option value="">Select...</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              ) : (
                <input
                  type="text"
                  value={customAnswers[question.id] || ''}
                  onChange={(e) => setCustomAnswers(prev => ({
                    ...prev,
                    [question.id]: e.target.value
                  }))}
                  className="w-full p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                  required={question.required}
                />
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-green-600 hover:bg-green-700">
              {loading ? 'Submitting...' : 'Submit Application'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ApplicationForm; 