import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { CategoryVehicles, CategoryElectronics, CategoryFurniture, CategoryClothing, CategoryTools, CategorySportsOutdoors, CategoryHomeGarden, CategoryToysGames, Favorites, Notifications, Cart, Profile, Sell, HowItWorks, WhyTomaShops, Safety, Shipping, Privacy, Terms, Faq } from "@/pages/Placeholders";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider defaultTheme="light">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/categories/vehicles" element={<CategoryVehicles />} />
            <Route path="/categories/electronics" element={<CategoryElectronics />} />
            <Route path="/categories/furniture" element={<CategoryFurniture />} />
            <Route path="/categories/clothing" element={<CategoryClothing />} />
            <Route path="/categories/tools" element={<CategoryTools />} />
            <Route path="/categories/sports-outdoors" element={<CategorySportsOutdoors />} />
            <Route path="/categories/home-garden" element={<CategoryHomeGarden />} />
            <Route path="/categories/toys-games" element={<CategoryToysGames />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/sell" element={<Sell />} />
            <Route path="/how-it-works" element={<HowItWorks />} />
            <Route path="/why-tomashops" element={<WhyTomaShops />} />
            <Route path="/safety" element={<Safety />} />
            <Route path="/shipping" element={<Shipping />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);

export default App;
