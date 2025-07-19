import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"


interface DeleteAccountPageProps {
  onBack: () => void;
}

const DeleteAccountPage: React.FC<DeleteAccountPageProps> = ({ onBack }) => {
  const { user, showToast } = useAppContext();
  const [loading, setLoading] = useState(false);

  const handleRequestDeletion = async () => {
    if (!user) {
      showToast('You must be logged in to delete your account.', 'error');
      return;
    }

    setLoading(true);
    try {
      // Here you would typically call a Supabase Edge Function to handle the deletion logic.
      // For this implementation, we will add a row to a 'deletion_requests' table.
      // You will need to create this table in your Supabase project.
      const { error } = await supabase
        .from('deletion_requests')
        .insert({ user_id: user.id, requested_at: new Date().toISOString() });

      if (error) throw error;

      showToast('Your account deletion request has been submitted. It will be processed within 7-14 days.', 'success');
      // Optionally, you could log the user out here.
      onBack();
    } catch (err: any) {
      showToast(`Error submitting request: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="sticky top-0 bg-white border-b z-10">
        <div className="flex items-center justify-between p-4 max-w-2xl mx-auto">
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </Button>
          <h1 className="text-lg font-semibold">Delete Account</h1>
          <div className="w-16" />
        </div>
      </div>
      <div className="p-4 max-w-2xl mx-auto">
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
            <h2 className="text-xl font-bold text-red-600">Are you sure you want to delete your account?</h2>
            <p className="text-gray-600">This action is permanent and cannot be undone. When you delete your account:</p>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
                <li>Your profile and all personal information will be permanently removed.</li>
                <li>All of your active and past listings will be deleted.</li>
                <li>All of your conversations and messages will be deleted.</li>
                <li>You will lose access to any items you may have purchased for download.</li>
            </ul>
            <p className="text-gray-600">
                If you are sure you want to proceed, please click the button below. Your account and data will be permanently deleted within 14 days.
            </p>
            
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="w-full" disabled={loading}>
                        {loading ? 'Submitting...' : 'I understand, please delete my account'}
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                    <AlertDialogTitle>Final Confirmation</AlertDialogTitle>
                    <AlertDialogDescription>
                        This is your last chance. Are you absolutely sure you want to request account deletion? This action cannot be reversed.
                    </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRequestDeletion}>Yes, Delete My Account</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccountPage; 