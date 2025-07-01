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

const HomePage: React.FC = () => {
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showSellPage, setShowSellPage] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await supabase.from('listings').select('*').order('created_at', { ascending: false });
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
              <MessageCircle className="h-5 w-5" />
            </Button>
          </div>
          
          <div className="flex space-x-6">
            <Button variant="ghost" className="text-white hover:bg-gray-700" onClick={handleSellClick}>Sell</Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6">For you</Button>
            <Button variant="ghost" className="text-white hover:bg-gray-700">Local</Button>
          </div>
        </div>

        <div className="px-4 py-4">
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
                listings={listings} 
                onListingClick={handleListingClick}
              />
              {!loading && !error && (
                <Map listings={listings} />
              )}
            </>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default HomePage;