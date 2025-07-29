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
import './tomabot-widget.css';

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Global error handler for Video.js and other errors
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.message.includes('videojs') || event.message.includes('Invalid target')) {
        console.warn('Video.js error suppressed:', event.message);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleGlobalError);
    
    // Inject the ElevenLabs Convai script only once
    if (!document.getElementById('elevenlabs-convai-script')) {
      const script = document.createElement('script');
      script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
      script.async = true;
      script.type = 'text/javascript';
      script.id = 'elevenlabs-convai-script';
      
      // Add error handling for script loading
      script.onerror = () => {
        console.error('❌ Failed to load ElevenLabs Convai script');
      };
      
      script.onload = () => {
        console.log('✅ ElevenLabs Convai script loaded successfully');
        // Initialize widget after script loads
        initializeWidget();
      };
      
      document.body.appendChild(script);
    } else {
      // Script already exists, initialize widget
      initializeWidget();
    }
    
    function initializeWidget() {
      // Inject the widget element if not present
      if (!document.getElementById('elevenlabs-convai-widget')) {
        const widget = document.createElement('elevenlabs-convai');
        widget.setAttribute('agent-id', 'agent_4701k1a2btwdegysfzxgjhts8wvg');
        widget.id = 'elevenlabs-convai-widget';
        widget.style.position = 'fixed';
        widget.style.bottom = '24px';
        widget.style.right = '24px';
        widget.style.zIndex = '9999';
        // Add custom styling for the chat bubble with photo
        widget.style.setProperty('--convai-widget-avatar', 'url("/tomabot-avatar.png")');
        widget.style.setProperty('--convai-widget-avatar-size', '40px');
        widget.style.setProperty('--convai-widget-position', 'bottom-right');
        widget.style.setProperty('--convai-widget-avatar-border-radius', '50%');
        widget.style.setProperty('--convai-widget-avatar-border', '2px solid #06b6d4');
        widget.style.setProperty('--convai-widget-avatar-box-shadow', '0 2px 8px rgba(6,182,212,0.3)');
        
        // Custom styling to override default text
        widget.style.setProperty('--convai-widget-title', 'TomaBot');
        widget.style.setProperty('--convai-widget-subtitle', 'AI Assistant');
        widget.style.setProperty('--convai-widget-button-text', 'TomaBot');
        widget.style.setProperty('--convai-widget-button-hover-text', 'TomaBot');
        
        // Test if the avatar image is accessible
        const testImage = new Image();
        testImage.onload = () => {
          console.log('✅ TomaBot avatar loaded successfully');
        };
        testImage.onerror = () => {
          console.error('❌ TomaBot avatar failed to load. Check if /tomabot-avatar.png exists in public folder');
        };
        testImage.src = '/tomabot-avatar.png';
        
        document.body.appendChild(widget);
        
        // Wait for widget to load and then customize text
        setTimeout(() => {
          customizeWidgetText();
          setupChatInterfaceObserver();
        }, 1000);
      }
    }
    
    function setupChatInterfaceObserver() {
      // Create a MutationObserver to watch for when the chat interface opens
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList') {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                
                // Check if this is the chat interface opening
                if (element.classList.contains('chat-interface') || 
                    element.classList.contains('conversation') ||
                    element.classList.contains('chat-container') ||
                    element.querySelector('.chat-interface') ||
                    element.querySelector('.conversation') ||
                    element.querySelector('.chat-container')) {
                  
                  // Wait a bit for the interface to fully render
                  setTimeout(() => {
                    applyAvatarToChatInterface();
                  }, 500);
                }
              }
            });
          }
          
          // Also watch for attribute changes that might indicate the interface is opening
          if (mutation.type === 'attributes') {
            const target = mutation.target as Element;
            if (target.classList.contains('open') || 
                target.classList.contains('active') ||
                target.classList.contains('visible') ||
                target.style.display === 'block' ||
                target.style.visibility === 'visible') {
              setTimeout(() => {
                applyAvatarToChatInterface();
              }, 500);
            }
          }
        });
      });
      
      // Start observing the widget container
      const widget = document.getElementById('elevenlabs-convai-widget');
      if (widget) {
        observer.observe(widget, {
          childList: true,
          subtree: true,
          attributes: true,
          attributeFilter: ['class', 'style']
        });
      }
      
      // Also set up a periodic check as a fallback
      setInterval(() => {
        const widget = document.getElementById('elevenlabs-convai-widget');
        if (widget) {
          const chatInterface = widget.querySelector('.chat-interface, .conversation, .chat-container, [class*="chat"], [class*="conversation"]');
          if (chatInterface) {
            applyAvatarToChatInterface();
          }
        }
      }, 2000);
    }
    
    function applyAvatarToChatInterface() {
      // Find the large circular area in the chat interface
      const widget = document.getElementById('elevenlabs-convai-widget');
      if (!widget) return;
      
      // Look for various possible selectors for the avatar area
      const avatarSelectors = [
        '.chat-interface .avatar',
        '.conversation .avatar', 
        '.chat-container .avatar',
        '[class*="chat"] .avatar',
        '[class*="conversation"] .avatar',
        '[class*="interface"] .avatar',
        '.large-avatar',
        '.main-avatar',
        '[class*="circle"]',
        '[class*="avatar-area"]',
        '[class*="profile-area"]'
      ];
      
      avatarSelectors.forEach(selector => {
        const avatarElements = widget.querySelectorAll(selector);
        avatarElements.forEach(avatar => {
          if (avatar instanceof HTMLElement) {
            avatar.style.cssText = `
              width: 120px !important;
              height: 120px !important;
              border-radius: 50% !important;
              background-image: url('/tomabot-avatar.png') !important;
              background-size: cover !important;
              background-position: center !important;
              background-repeat: no-repeat !important;
              border: 3px solid #06b6d4 !important;
              box-shadow: 0 4px 12px rgba(6,182,212,0.3) !important;
              display: block !important;
              margin: 0 auto !important;
              position: relative !important;
            `;
          }
        });
      });
      
      // Also check for any large circular divs that might be the avatar area
      const allDivs = widget.querySelectorAll('div');
      allDivs.forEach(div => {
        if (div instanceof HTMLElement) {
          const style = window.getComputedStyle(div);
          const width = parseInt(style.width);
          const height = parseInt(style.height);
          const borderRadius = style.borderRadius;
          
          // If it's a large circular area (likely the avatar placeholder)
          if (width >= 80 && height >= 80 && 
              (borderRadius === '50%' || borderRadius.includes('50%'))) {
            div.style.cssText = `
              width: 120px !important;
              height: 120px !important;
              border-radius: 50% !important;
              background-image: url('/tomabot-avatar.png') !important;
              background-size: cover !important;
              background-position: center !important;
              background-repeat: no-repeat !important;
              border: 3px solid #06b6d4 !important;
              box-shadow: 0 4px 12px rgba(6,182,212,0.3) !important;
              display: block !important;
              margin: 0 auto !important;
              position: relative !important;
            `;
          }
        }
      });
    }
    
    function customizeWidgetText() {
      // Find and replace any "Start a call" text with "TomaBot"
      const widget = document.getElementById('elevenlabs-convai-widget');
      if (widget) {
        // Replace text content more aggressively
        const walker = document.createTreeWalker(
          widget,
          NodeFilter.SHOW_TEXT
        );
        
        let node;
        while (node = walker.nextNode()) {
          if (node.textContent) {
            // Replace various forms of the text
            node.textContent = node.textContent
              .replace(/Start a call/g, 'TomaBot')
              .replace(/call to TomaBot/g, 'TomaBot')
              .replace(/Start a call to TomaBot/g, 'TomaBot');
          }
        }
        
        // Also try to find and replace button text
        const buttons = widget.querySelectorAll('button, [role="button"], .widget-button, .call-button');
        buttons.forEach(button => {
          if (button.textContent) {
            button.textContent = button.textContent
              .replace(/Start a call/g, 'TomaBot')
              .replace(/call to TomaBot/g, 'TomaBot')
              .replace(/Start a call to TomaBot/g, 'TomaBot');
          }
          
          // Also replace any span elements inside buttons
          const spans = button.querySelectorAll('span');
          spans.forEach(span => {
            if (span.textContent) {
              span.textContent = span.textContent
                .replace(/Start a call/g, 'TomaBot')
                .replace(/call to TomaBot/g, 'TomaBot')
                .replace(/Start a call to TomaBot/g, 'TomaBot');
            }
          });
        });
        
        // Force avatar to show in correct position
        const avatarElements = widget.querySelectorAll('img, [class*="avatar"], [class*="profile"], [class*="user-image"]');
        avatarElements.forEach(avatar => {
          if (avatar.tagName === 'IMG') {
            (avatar as HTMLImageElement).src = '/tomabot-avatar.png';
            (avatar as HTMLElement).style.display = 'block';
            (avatar as HTMLElement).style.visibility = 'visible';
          }
          (avatar as HTMLElement).style.backgroundImage = 'url("/tomabot-avatar.png")';
          (avatar as HTMLElement).style.backgroundSize = 'cover';
          (avatar as HTMLElement).style.backgroundPosition = 'center';
          (avatar as HTMLElement).style.borderRadius = '50%';
          (avatar as HTMLElement).style.width = '40px';
          (avatar as HTMLElement).style.height = '40px';
          (avatar as HTMLElement).style.position = 'relative';
        });
        
        // Ensure widget stays in correct position
        widget.style.position = 'fixed';
        widget.style.bottom = '24px';
        widget.style.right = '24px';
        widget.style.zIndex = '9999';
      }
      
      // Run again after a delay to catch any dynamically loaded content
      setTimeout(() => {
        const widget = document.getElementById('elevenlabs-convai-widget');
        if (widget) {
          const allElements = widget.querySelectorAll('*');
          allElements.forEach(element => {
            if (element.textContent) {
              element.textContent = element.textContent
                .replace(/Start a call/g, 'TomaBot')
                .replace(/call to TomaBot/g, 'TomaBot')
                .replace(/Start a call to TomaBot/g, 'TomaBot');
            }
          });
        }
      }, 2000);
    }
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
    };
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
