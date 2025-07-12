import React, { useState, useEffect } from 'react';
import Header from './Header';
import ListingsGrid from './ListingsGrid';
import ProductDetail from './ProductDetail';
import SellPage from './SellPage';
import MessagesPage from './MessagesPage';
import Footer from './Footer';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { MapPin, MessageCircle } from 'lucide-react';
import Map from './Map';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useAppContext } from '@/contexts/AppContext';
import { useSearchParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import UserNavBar from './UserNavBar';
import BottomNavBar from './BottomNavBar';

const HomePage: React.FC = () => {
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showSellPage, setShowSellPage] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'local'>('all');
  const { user, showToast } = useAppContext();
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get('search')?.toLowerCase() || '';
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
        console.log('Fetched listings:', data, error);
        if (error) throw error;
        setListings(data || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [showSellPage]); // refetch after selling

  useEffect(() => {
    const checkUnreadMessagesAndOffers = async () => {
      if (!user?.id) return setHasUnreadMessages(false);
      // Check unread messages
      const { data: conversations } = await supabase
        .from('conversations')
        .select('id')
        .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`);
      let hasUnread = false;
      if (conversations && conversations.length > 0) {
        const convIds = conversations.map((c: any) => c.id);
        const { data: messages } = await supabase
          .from('messages')
          .select('id')
          .in('conversation_id', convIds)
          .eq('receiver_id', user.id)
          .is('read_at', null);
        hasUnread = !!messages && messages.length > 0;
      }
      // Check new offers (for user as seller, only pending)
      const { data: offers } = await supabase
        .from('offers')
        .select('id, status')
        .eq('seller_id', user.id)
        .or('status.is.null,status.eq.pending');
      const hasNewOffers = !!offers && offers.some((o: any) => !o.status || o.status === 'pending');
      setHasUnreadMessages(hasUnread || hasNewOffers);
    };
    checkUnreadMessagesAndOffers();
  }, [user]);

  const handleListingClick = (id: string) => {
    setSelectedListing(id);
  };

  const handleBackToGrid = () => {
    setSelectedListing(null);
  };

  const handleSellClick = () => {
    setShowSellPage(true);
  };

  const handleBackFromSell = () => {
    setShowSellPage(false);
  };

  const handleMessagesClick = () => {
    setShowMessages(true);
  };

  const handleBackFromMessages = () => {
    setShowMessages(false);
  };

  const currentListing = selectedListing ? listings.find(l => l.id === selectedListing) : null;

  const filteredListings = filter === 'local'
    ? listings.filter(l => l.location?.toLowerCase().includes('louisville'))
    : listings;

  const searchFilteredListings = searchQuery
    ? filteredListings.filter(l =>
        l.title?.toLowerCase().includes(searchQuery) ||
        l.description?.toLowerCase().includes(searchQuery) ||
        l.location?.toLowerCase().includes(searchQuery)
      )
    : filteredListings;

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerWidth < 768 &&
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        visibleCount < searchFilteredListings.length
      ) {
        setVisibleCount((prev) => Math.min(prev + 20, searchFilteredListings.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [visibleCount, searchFilteredListings.length]);

  const handleResend = async () => {
    setResending(true);
    setResent(false);
    const { error } = await supabase.auth.resend({ type: 'signup', email: user?.email });
    setResending(false);
    if (error) {
      showToast('Failed to resend confirmation email. Please try again.', 'error');
    } else {
      setResent(true);
      showToast('Confirmation email resent! Please check your inbox.', 'success');
    }
  };

  if (showMessages) {
    return <MessagesPage onBack={handleBackFromMessages} />;
  }

  if (showSellPage) {
    return <SellPage onBack={handleBackFromSell} />;
  }

  if (currentListing) {
    return <ProductDetail listing={currentListing} onBack={handleBackToGrid} />;
  }

  const handleViewMore = () => {
    setVisibleCount((prev) => Math.min(prev + 20, searchFilteredListings.length));
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Sticky Header Area */}
      <div className="sticky top-0 z-50">
        <Header />
        
        {/* Dark Banner Area - Also Sticky */}
        <div className="bg-gray-900 text-white px-4 py-3 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-teal-400">Marketplace</h1>
            <div className="flex items-center space-x-4">
              <Link to="/offers" className="text-white hover:underline">Offers</Link>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-white hover:bg-gray-700"
                onClick={handleMessagesClick}
              >
                <div className="relative">
                  <MessageCircle className="h-8 w-8" />
                  {hasUnreadMessages && (
                    <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-red-500 border-2 border-white" />
                  )}
                </div>
              </Button>
            </div>
          </div>
          <UserNavBar />
          <div className="flex items-center space-x-4 mb-4">
            <Button onClick={handleSellClick} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold">Sell</Button>
            <div className="flex items-center space-x-4">
              <Link to="/rentals" className="text-white hover:underline">Rentals</Link>
              <Link to="/jobs" className="text-white hover:underline">Jobs</Link>
              <Link to="/digital" className="text-white hover:underline">Digital</Link>
              <Link to="/ads" className="text-white hover:underline">Ads</Link>
            </div>
          </div>
        </div>
      </div>
      
      {/* Scrollable Main Content */}
      <main className="pb-8 flex-1">
        <div className="px-4 py-4">
          {filter !== 'all' && (
            <Button variant="secondary" className="mb-4" onClick={() => setFilter('all')}>Back</Button>
          )}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Today's picks</h3>
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="h-4 w-4 mr-1" />
              <span>Louisville, Kentucky</span>
            </div>
          </div>
          {loading ? (
            <div className="text-center text-gray-500 py-8">Loading listings...</div>
          ) : error ? (
            <div className="text-center text-red-500 py-8">{error}</div>
          ) : (
            <>
              <ListingsGrid 
                listings={searchFilteredListings.slice(0, visibleCount)} 
                onListingClick={handleListingClick}
              />
              {/* View More button for desktop */}
              {window.innerWidth >= 768 && visibleCount < searchFilteredListings.length && (
                <div className="flex justify-center my-8">
                  <Button
                    onClick={handleViewMore}
                    className="bg-teal-500 text-white font-bold px-8 py-3 rounded-full text-lg shadow hover:bg-teal-600"
                  >
                    View More
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </main>
      {/* Always show Footer on desktop, outside main content */}
      <Footer />
      <BottomNavBar />
    </div>
  );
};

export default HomePage;