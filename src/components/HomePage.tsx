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

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="onesignal-customlink-container" />
      
      <main className="pb-8">
        <div className="bg-gray-900 text-white px-4 py-3">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold">Marketplace</h1>
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
          
          <div className="flex space-x-6">
            <Button variant="ghost" className="text-white hover:bg-gray-700" onClick={handleSellClick}>Sell</Button>
            <Button className={`px-6 ${filter === 'all' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-white hover:bg-gray-700'}`} onClick={() => setFilter('all')}>For you</Button>
            <Button className={filter === 'local' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'text-white hover:bg-gray-700'} onClick={() => setFilter('local')}>Local</Button>
          </div>
        </div>

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
                listings={searchFilteredListings} 
                onListingClick={handleListingClick}
              />
              <div className="my-8">
                <iframe
                  width="100%"
                  height="315"
                  src="https://www.youtube.com/embed/uS_JhdsZpcg?si=OrIIXCO2IYI2CJ2K"
                  title="TomaShops How-To Demo"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className="rounded-lg shadow"
                ></iframe>
              </div>
              <Map listings={listings} />
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;