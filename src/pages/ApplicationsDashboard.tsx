import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import BackButton from '@/components/BackButton';
import { 
  Briefcase, 
  Users, 
  Eye, 
  Check, 
  X, 
  MessageCircle, 
  FileText,
  Download,
  Star,
  Calendar,
  Mail,
  Phone
} from 'lucide-react';

interface Application {
  id: string;
  created_at: string;
  applicant_name: string;
  applicant_email: string;
  applicant_phone?: string;
  resume_url?: string;
  cover_letter?: string;
  status: string;
  employer_notes?: string;
  job_listing: {
    id: string;
    title: string;
    company_name: string;
  };
  custom_answers?: Array<{
    question_text: string;
    answer_text: string;
  }>;
}

const ApplicationsDashboard: React.FC = () => {
  const { user } = useAppContext();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    fetchApplications();
  }, [user, statusFilter]);

  const fetchApplications = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('applications')
        .select(`
          *,
          job_listing:listings(id, title, company_name)
        `)
        .eq('employer_id', user.id)
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Fetch custom answers for each application
      const applicationsWithAnswers = await Promise.all(
        (data || []).map(async (app) => {
          const { data: answers } = await supabase
            .from('application_answers')
            .select(`
              answer_text,
              question:application_questions(question_text)
            `)
            .eq('application_id', app.id);

          return {
            ...app,
            custom_answers: answers?.map(a => ({
              question_text: a.question.question_text,
              answer_text: a.answer_text
            })) || []
          };
        })
      );

      setApplications(applicationsWithAnswers);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('applications')
        .update({ 
          status: newStatus,
          reviewed_at: new Date().toISOString(),
          employer_notes: notes
        })
        .eq('id', applicationId);

      if (error) throw error;

      // Send notification to applicant
      const application = applications.find(app => app.id === applicationId);
      if (application) {
        const statusMessages = {
          reviewed: 'Your application has been reviewed',
          shortlisted: 'Congratulations! You have been shortlisted',
          rejected: 'Thank you for your application',
          hired: 'Congratulations! You have been selected for the position'
        };

        await supabase.from('notifications').insert({
          user_id: application.applicant_id,
          title: 'Application Update',
          message: `${statusMessages[newStatus]} for ${application.job_listing.title}`,
          type: 'application',
          related_id: applicationId
        });
      }

      await fetchApplications();
      setSelectedApplication(null);
      setNotes('');
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startConversation = async (application: Application) => {
    // Create or find existing conversation
    const { data: existingConv } = await supabase
      .from('conversations')
      .select('id')
      .or(`and(user1_id.eq.${user.id},user2_id.eq.${application.applicant_id}),and(user1_id.eq.${application.applicant_id},user2_id.eq.${user.id})`)
      .single();

    if (existingConv) {
      // Navigate to existing conversation
      window.location.href = `/messages?conversation=${existingConv.id}`;
    } else {
      // Create new conversation
      const { data: newConv } = await supabase
        .from('conversations')
        .insert({
          user1_id: user.id,
          user2_id: application.applicant_id,
          listing_id: application.job_listing.id
        })
        .select()
        .single();

      if (newConv) {
        // Send initial message
        await supabase.from('messages').insert({
          conversation_id: newConv.id,
          sender_id: user.id,
          content: `Hi ${application.applicant_name}, thank you for applying to ${application.job_listing.title}. I'd like to discuss your application with you.`
        });

        window.location.href = `/messages?conversation=${newConv.id}`;
      }
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
      reviewed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
      shortlisted: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
      rejected: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
      hired: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400'
    };
    return colors[status] || colors.pending;
  };

  const getStatusCounts = () => {
    return {
      all: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      reviewed: applications.filter(app => app.status === 'reviewed').length,
      shortlisted: applications.filter(app => app.status === 'shortlisted').length,
      rejected: applications.filter(app => app.status === 'rejected').length,
      hired: applications.filter(app => app.status === 'hired').length,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl">Loading applications...</div>
      </div>
    );
  }

  const statusCounts = getStatusCounts();

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-6">
        <div className="sticky top-0 z-40 bg-black pb-2">
          <BackButton />
        </div>
        
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Job Applications</h1>
            <p className="text-gray-400">Manage applications for your job postings</p>
          </div>
          <div className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-blue-400" />
            <span className="text-xl font-semibold">{statusCounts.all} Total</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-400">{error}</p>
          </div>
        )}

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'All', count: statusCounts.all },
            { key: 'pending', label: 'Pending', count: statusCounts.pending },
            { key: 'reviewed', label: 'Reviewed', count: statusCounts.reviewed },
            { key: 'shortlisted', label: 'Shortlisted', count: statusCounts.shortlisted },
            { key: 'hired', label: 'Hired', count: statusCounts.hired },
            { key: 'rejected', label: 'Rejected', count: statusCounts.rejected },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setStatusFilter(filter.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                statusFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>

        {/* Applications List */}
        <div className="grid gap-4">
          {applications.length === 0 ? (
            <Card className="bg-gray-900 border-gray-700 p-8 text-center">
              <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-white mb-2">No Applications Yet</h3>
              <p className="text-gray-400">
                Applications for your job postings will appear here.
              </p>
            </Card>
          ) : (
            applications.map((application) => (
              <Card key={application.id} className="bg-gray-900 border-gray-700 p-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-white">
                          {application.applicant_name}
                        </h3>
                        <p className="text-blue-400 font-medium">
                          {application.job_listing.title}
                        </p>
                        <p className="text-sm text-gray-400">
                          Applied {new Date(application.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        {application.applicant_email}
                      </div>
                      {application.applicant_phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4" />
                          {application.applicant_phone}
                        </div>
                      )}
                      {application.resume_url && (
                        <div className="flex items-center gap-1">
                          <FileText className="h-4 w-4" />
                          Resume attached
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedApplication(application)}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => startConversation(application)}
                    >
                      <MessageCircle className="h-4 w-4 mr-1" />
                      Message
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Application Detail Modal */}
        {selectedApplication && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white dark:bg-gray-900 p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold">
                    Application: {selectedApplication.applicant_name}
                  </h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedApplication(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {selectedApplication.job_listing.title}
                </p>
              </div>

              <div className="p-6 space-y-6">
                {/* Applicant Info */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Name</label>
                      <p className="text-base">{selectedApplication.applicant_name}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                      <p className="text-base">{selectedApplication.applicant_email}</p>
                    </div>
                    {selectedApplication.applicant_phone && (
                      <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                        <p className="text-base">{selectedApplication.applicant_phone}</p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Applied</label>
                      <p className="text-base">{new Date(selectedApplication.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Resume */}
                {selectedApplication.resume_url && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Resume</h3>
                    <Button
                      variant="outline"
                      onClick={() => window.open(selectedApplication.resume_url, '_blank')}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Resume
                    </Button>
                  </div>
                )}

                {/* Cover Letter */}
                {selectedApplication.cover_letter && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Cover Letter</h3>
                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                      <p className="whitespace-pre-wrap">{selectedApplication.cover_letter}</p>
                    </div>
                  </div>
                )}

                {/* Custom Questions */}
                {selectedApplication.custom_answers && selectedApplication.custom_answers.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold mb-3">Additional Questions</h3>
                    <div className="space-y-4">
                      {selectedApplication.custom_answers.map((answer, index) => (
                        <div key={index} className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                          <p className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-2">
                            {answer.question_text}
                          </p>
                          <p>{answer.answer_text}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div>
                  <h3 className="text-lg font-semibold mb-3">Employer Notes</h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this application..."
                    rows={3}
                    className="w-full p-3 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
                  />
                </div>

                {/* Actions */}
                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <Button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'reviewed')}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Mark as Reviewed
                  </Button>
                  <Button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'shortlisted')}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Star className="h-4 w-4 mr-2" />
                    Shortlist
                  </Button>
                  <Button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'hired')}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    <Check className="h-4 w-4 mr-2" />
                    Hire
                  </Button>
                  <Button
                    onClick={() => updateApplicationStatus(selectedApplication.id, 'rejected')}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4 mr-2" />
                    Reject
                  </Button>
                  <Button
                    onClick={() => startConversation(selectedApplication)}
                    variant="outline"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Start Conversation
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ApplicationsDashboard; 