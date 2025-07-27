import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Send, Lightbulb } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const SuggestionBox: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [suggestion, setSuggestion] = useState('');
  const [category, setCategory] = useState('general');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !suggestion.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      // Insert suggestion into database
      const { error: dbError } = await supabase
        .from('suggestions')
        .insert({
          name: name.trim(),
          email: email.trim(),
          suggestion: suggestion.trim(),
          category,
          created_at: new Date().toISOString()
        });

      if (dbError) {
        console.error('Database error:', dbError);
        toast.error('Failed to submit suggestion. Please try again.');
        return;
      }

      // Send email notification via edge function
      try {
        const { data: { supabaseUrl } } = await supabase.auth.getSession();
        const edgeFunctionUrl = `${supabaseUrl}/functions/v1/send-suggestion-email`;
        
        const emailResponse = await fetch(edgeFunctionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${supabase.supabaseKey}`,
          },
          body: JSON.stringify({
            suggestion: {
              name: name.trim(),
              email: email.trim(),
              suggestion: suggestion.trim(),
              category,
              created_at: new Date().toISOString(),
              status: 'pending'
            }
          })
        });

        if (!emailResponse.ok) {
          console.error('Email notification failed:', await emailResponse.text());
          // Don't show error to user since suggestion was saved successfully
        }
      } catch (emailError) {
        console.error('Email notification error:', emailError);
        // Don't show error to user since suggestion was saved successfully
      }

      toast.success('Thank you for your suggestion! We\'ll review it and get back to you.');
      
      // Reset form
      setName('');
      setEmail('');
      setSuggestion('');
      setCategory('general');

    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/" className="inline-flex items-center text-teal-600 hover:text-teal-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-teal-100 rounded-full">
              <Lightbulb className="h-6 w-6 text-teal-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Suggestion Box</h1>
              <p className="text-gray-600">Help us improve TomaShops with your ideas!</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Share Your Ideas</CardTitle>
            <CardDescription>
              We value your feedback! Whether it's a new feature, improvement, or just a thought, 
              we'd love to hear from you. Your suggestions help make TomaShops better for everyone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Name *
                </label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  required
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                  required
                />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                  Suggestion Category
                </label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="general">General Feedback</option>
                  <option value="feature">New Feature Request</option>
                  <option value="improvement">Improvement Suggestion</option>
                  <option value="bug">Bug Report</option>
                  <option value="ui">User Interface</option>
                  <option value="performance">Performance</option>
                  <option value="other">Other</option>
                </select>
              </div>

              {/* Suggestion */}
              <div>
                <label htmlFor="suggestion" className="block text-sm font-medium text-gray-700 mb-2">
                  Your Suggestion *
                </label>
                <Textarea
                  id="suggestion"
                  value={suggestion}
                  onChange={(e) => setSuggestion(e.target.value)}
                  placeholder="Tell us your idea, feedback, or suggestion..."
                  rows={6}
                  required
                  className="resize-none"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Be as detailed as possible. We read every suggestion!
                </p>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white py-3"
              >
                {isSubmitting ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Submitting...
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Send className="h-4 w-4 mr-2" />
                    Submit Suggestion
                  </div>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <div className="mt-8 text-center text-gray-600">
          <p className="text-sm">
            We typically respond to suggestions within 2-3 business days. 
            Thank you for helping make TomaShops better! 💡
          </p>
        </div>
      </div>
    </div>
  );
};

export default SuggestionBox; 