import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/contexts/AppContext';
import { supabase } from '@/lib/supabase';
import ListingsGrid from '@/components/ListingsGrid';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

const MyListings: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAppContext();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'sold' | 'trashed'>('all');
  const { toast } = useToast();

  const fetchListings = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('seller_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setListings(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load listings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter listings based on selected status
  const filteredListings = listings.filter(listing => {
    if (statusFilter === 'all') return true;
    return listing.status === statusFilter;
  });

  useEffect(() => {
    fetchListings();
  }, [user]);

  const handleMarkAsSold = async (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    const category = listing?.category;
    
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'sold', sold_at: new Date().toISOString() })
        .eq('id', listingId);
      
      if (error) throw error;
      
      const statusMessage = category === 'rental' ? 'Listing marked as rented' : 
                           category === 'job' ? 'Position marked as filled' : 
                           category === 'handyman' ? 'Job marked as completed' :
                           category === 'digital' ? 'Listing marked as sold' :
                           category === 'ad' ? 'Ad marked as completed' :
                           'Listing marked as sold';
      
      toast({
        title: "Success",
        description: statusMessage
      });
      
      fetchListings(); // Refresh the listings
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update listing status",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'trashed' })
        .eq('id', listingId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Listing moved to trash"
      });
      
      fetchListings(); // Refresh the listings
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete listing",
        variant: "destructive"
      });
    }
  };

  const handleRestore = async (listingId: string) => {
    try {
      const { error } = await supabase
        .from('listings')
        .update({ status: 'active' })
        .eq('id', listingId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Listing restored"
      });
      
      fetchListings(); // Refresh the listings
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to restore listing",
        variant: "destructive"
      });
    }
  };

  const handlePermanentDelete = async (listingId: string) => {
    // Show confirmation dialog first
    if (!confirm("Are you sure you want to permanently delete this listing? This action cannot be undone.")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', listingId);
      
      if (error) throw error;
      
      toast({
        title: "Success",
        description: "Listing permanently deleted"
      });
      
      fetchListings(); // Refresh the listings
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to permanently delete listing",
        variant: "destructive"
      });
    }
  };

  const handleListingClick = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    
    // Navigate to the appropriate detail page based on category
    switch (listing.category) {
      case 'job':
        navigate(`/jobs/${listingId}`);
        break;
      case 'rental':
        navigate(`/rentals/${listingId}`);
        break;
      case 'digital':
        navigate(`/digital/${listingId}`);
        break;
      case 'handyman':
        navigate(`/handyman/${listingId}`);
        break;
      case 'ad':
        navigate(`/ads/${listingId}`);
        break;
      default:
        navigate(`/browse/${listingId}`);
        break;
    }
  };

  const handleEdit = (listingId: string) => {
    const listing = listings.find(l => l.id === listingId);
    if (!listing) return;
    
    // Navigate to the edit page based on category
    switch (listing.category) {
      case 'job':
        navigate(`/jobs/edit/${listingId}`);
        break;
      case 'rental':
        navigate(`/rentals/edit/${listingId}`);
        break;
      case 'digital':
        navigate(`/digital/edit/${listingId}`);
        break;
      case 'handyman':
        navigate(`/handyman/edit/${listingId}`);
        break;
      case 'ad':
        navigate(`/ads/edit/${listingId}`);
        break;
      default:
        navigate(`/sell/edit/${listingId}`);
        break;
    }
  };

  if (!user) return <div className="p-8 text-center">Please log in to view your listings.</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Button variant="secondary" className="mb-4" onClick={() => navigate(-1)}>Back</Button>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">My Listings</h1>
        <Button onClick={() => navigate('/sell')} className="bg-blue-600 hover:bg-blue-700">
          Create New Listing
        </Button>
      </div>
      
      {/* Status Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button 
          variant={statusFilter === 'all' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('all')}
          size="sm"
        >
          All ({listings.length})
        </Button>
        <Button 
          variant={statusFilter === 'active' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('active')}
          size="sm"
        >
          Active ({listings.filter(l => l.status === 'active').length})
        </Button>
        <Button 
          variant={statusFilter === 'sold' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('sold')}
          size="sm"
        >
          Completed ({listings.filter(l => l.status === 'sold').length})
        </Button>
        <Button 
          variant={statusFilter === 'trashed' ? 'default' : 'outline'}
          onClick={() => setStatusFilter('trashed')}
          size="sm"
        >
          Trash ({listings.filter(l => l.status === 'trashed').length})
        </Button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : listings.length === 0 ? (
        <div className="text-center text-gray-500">No listings yet. <Button asChild><a href="/sell">Create your first listing</a></Button></div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center text-gray-500">
          No {statusFilter === 'all' ? '' : statusFilter} listings found.
        </div>
      ) : (
        <ListingsGrid 
          listings={filteredListings} 
          isOwner={true}
          onListingClick={handleListingClick}
          onMarkAsSold={handleMarkAsSold}
          onDelete={handleDelete}
          onRestore={handleRestore}
          onEdit={handleEdit}
          onPermanentDelete={handlePermanentDelete}
        />
      )}
    </div>
  );
};

export default MyListings; 