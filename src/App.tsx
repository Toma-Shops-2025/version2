import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import HowItWorks from './pages/HowItWorks';
import WhyTomaShops from './pages/WhyTomaShops';
import Safety from './pages/Safety';
import Shipping from './pages/Shipping';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Faq from './pages/Faq';
import Contact from './pages/Contact';
import Categories from './pages/Categories';
import Favorites from './pages/Favorites';
import Notifications from './pages/Notifications';
import Cart from './pages/Cart';
import OffersPage from './pages/OffersPage';
import SellPage from './components/SellPage';
import Account from './pages/Account';
import AuthPage from './components/AuthPage';
import { AppProvider } from './contexts/AppContext';
import Rentals from './pages/Rentals';
import Jobs from './pages/Jobs';
import Browse from './pages/Browse';
import DigitalDetail from './pages/DigitalDetail';
import Digital from './pages/Digital';
import Ads from './pages/Ads';
import MyListings from './pages/MyListings';
import MyOrders from './pages/MyOrders';
import MessagesPage from './components/MessagesPage';
import SellerOrders from './pages/SellerOrders';
import JobDetail from './pages/JobsDetail';
import RentalDetail from './pages/RentalDetail';
import AdDetail from './pages/AdDetail';
import DeleteAccountPage from './pages/DeleteAccount';
import SuggestionBox from './pages/SuggestionBox';
import React, { useEffect } from 'react';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Inject the ElevenLabs Convai script only once
    if (!document.getElementById('elevenlabs-convai-script')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      script.id = 'elevenlabs-convai-script';
      document.body.appendChild(script);
    }
    // Inject the widget element if not present
    if (!document.getElementById('elevenlabs-convai-widget')) {
      const widget = document.createElement('elevenlabs-convai');
      widget.setAttribute('agent-id', 'agent_8601k16170epe0tr29btacdc5428');
      widget.id = 'elevenlabs-convai-widget';
      widget.style.position = 'fixed';
      widget.style.bottom = '24px';
      widget.style.right = '24px';
      widget.style.zIndex = '9999';
      // Add custom styling for the chat bubble with photo
      widget.style.setProperty('--convai-widget-avatar', 'url("/tomabot-avatar.png")');
      widget.style.setProperty('--convai-widget-avatar-size', '40px');
      widget.style.setProperty('--convai-widget-position', 'bottom-right');
      document.body.appendChild(widget);
    }
  }, []);

  return (
    <AppProvider>
      <ThemeProvider defaultTheme="light">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/why-tomashops" element={<WhyTomaShops />} />
                <Route path="/safety" element={<Safety />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/categories" element={<Categories />} />
                <Route path="/favorites" element={<Favorites />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/offers" element={<OffersPage />} />
                <Route path="/sell" element={<SellPage onBack={() => window.history.back()} />} />
                <Route path="/messages" element={<MessagesPage onBack={() => window.history.back()} />} />
                <Route path="/account" element={<Account />} />
                <Route path="/login" element={<AuthPage />} />
                <Route path="/rentals" element={<Rentals />} />
                <Route path="/jobs" element={<Jobs />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/browse" element={<Browse />} />
                <Route path="/digital/:id" element={<DigitalDetail />} />
                <Route path="/digital" element={<Digital />} />
                <Route path="/ads" element={<Ads />} />
                <Route path="/my-listings" element={<MyListings />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/seller-orders" element={<SellerOrders />} />
                <Route path="/rentals/:id" element={<RentalDetail />} />
                <Route path="/ads/:id" element={<AdDetail />} />
                <Route path="/delete-account" element={<DeleteAccountPage onBack={() => window.history.back()} />} />
                <Route path="/suggestion-box" element={<SuggestionBox />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </AppProvider>
  );
};

export default App;
