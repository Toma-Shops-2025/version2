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
import Sell from './pages/Sell';
import Account from './pages/Account';
import { AppProvider } from './contexts/AppContext';

const queryClient = new QueryClient();

const App = () => (
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
              <Route path="/sell" element={<Sell />} />
              <Route path="/account" element={<Account />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </AppProvider>
);

export default App;
