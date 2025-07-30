import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';

const JobDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        console.log('Fetching job with ID:', id);
        const { data, error: listingError } = await supabase
          .from('listings')
          .select('*')
          .eq('id', id)
          .eq('category', 'job')
          .single();
        if (listingError) {
          console.error('Job fetch error:', listingError);
          throw listingError;
        }
        console.log('Job data:', data);
        setListing(data);
      } catch (err: any) {
        console.error('Job detail error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading job details...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-600">Error: {error}</div>;
  if (!listing) return <div className="min-h-screen flex items-center justify-center">Job listing not found.</div>;

  return (
    <div className="container mx-auto py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center mb-6 text-green-600 hover:underline font-semibold"
      >
        <ArrowLeft className="h-5 w-5 mr-1" /> Back
      </button>
      <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
      <div className="mb-2 text-green-700 font-bold">{listing.company_name}</div>
      <div className="mb-2 text-gray-700">{listing.location}</div>
      <div className="mb-2 text-sm text-gray-500">{listing.job_type}</div>
      <div className="mb-2 text-sm text-gray-500">Salary: {listing.salary || 'N/A'}</div>
      <div className="mb-2 text-sm text-gray-500">{listing.requirements}</div>
      <div className="mb-4 text-gray-600">{listing.description}</div>
      {listing.contact_info && (
        <div className="mb-2 text-xs text-gray-500">Contact: {listing.contact_info}</div>
      )}
      {listing.images && listing.images.length > 0 && (
        <div className="mt-4 flex gap-2 flex-wrap">
          {listing.images.map((img: string, idx: number) => (
            <img key={idx} src={img} alt="Job" className="w-32 h-32 object-cover rounded" crossOrigin="anonymous" />
          ))}
        </div>
      )}
      {listing.video && (
        <div className="mt-4">
          <video src={listing.video} controls className="w-full max-h-60 rounded" crossOrigin="anonymous" />
        </div>
      )}
    </div>
  );
};

export default JobDetail; 