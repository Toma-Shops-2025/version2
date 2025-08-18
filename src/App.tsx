import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { preventBackspaceNavigation } from '@/lib/utils';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
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
import Profile from './pages/Profile';
import MyProfile from './pages/MyProfile';
import AuthPage from './components/AuthPage';
import { AppProvider } from './contexts/AppContext';
import Rentals from './pages/Rentals';
import Jobs from './pages/Jobs';
import Browse from './pages/Browse';
import DigitalDetail from './pages/DigitalDetail';
import DigitalProductDetail from './pages/DigitalProductDetail';
import Digital from './pages/Digital';
import Ads from './pages/Ads';
import Handyman from './pages/Handyman';
import HandymanDetail from './pages/HandymanDetail';
import ApplicationsDashboard from './pages/ApplicationsDashboard';
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
import { AudioProvider } from './hooks/use-audio-context.tsx';
import MusicPlatformIntegration from './components/MusicPlatformIntegration';

const queryClient = new QueryClient();

// Custom hook to handle back button and scroll to top
const useBackButtonHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Scroll to top on every route change
    window.scrollTo(0, 0);
    
    // Track navigation history
    let navigationHistory: string[] = [];
    
    const handleNavigation = () => {
      navigationHistory.push(location.pathname);
      // Keep only last 10 entries
      if (navigationHistory.length > 10) {
        navigationHistory.shift();
      }
    };

    const handleBackButton = () => {
      // If we're on home page, prevent exit
      if (location.pathname === '/' || location.pathname === '/index') {
        // Show a toast or alert that user is on home page
        console.log('Already on home page');
        return;
      }
      
      // Navigate to home page instead of exiting
      navigate('/', { replace: true });
    };

    // Handle browser back button
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      handleBackButton();
    };

    // Handle beforeunload to prevent app exit - DISABLED to fix backspace navigation issue
    // const handleBeforeUnload = (event: BeforeUnloadEvent) => {
    //   if (location.pathname !== '/' && location.pathname !== '/index') {
    //     event.preventDefault();
    //     event.returnValue = '';
    //     navigate('/', { replace: true });
    //     return '';
    //   }
    // };

    // Add event listeners
    window.addEventListener('popstate', handlePopState);
    // window.addEventListener('beforeunload', handleBeforeUnload); // DISABLED to fix backspace popup
    
    // Track current navigation
    handleNavigation();

    return () => {
      window.removeEventListener('popstate', handlePopState);
      // window.removeEventListener('beforeunload', handleBeforeUnload); // DISABLED
    };
  }, [navigate, location.pathname]);
};

// Component to handle back button logic
const BackButtonHandler: React.FC = () => {
  useBackButtonHandler();
  return null;
};

// Component to handle scroll to top on app start and refresh
const ScrollToTopHandler: React.FC = () => {
  useEffect(() => {
    // Scroll to top when component mounts (app starts/refreshes)
    window.scrollTo(0, 0);
    
    // Also scroll to top on page refresh
    const handleBeforeUnload = () => {
      window.scrollTo(0, 0);
    };
    
    // window.addEventListener('beforeunload', handleBeforeUnload); // DISABLED to fix backspace popup
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);
  
  return null;
};

const App = () => {
  useEffect(() => {
    // Scroll to top immediately when app loads
    window.scrollTo(0, 0);
    
    // Prevent backspace from navigating back when typing in forms
    const cleanupBackspaceHandler = preventBackspaceNavigation();
    
    // Global error handler for Video.js and other errors
    const handleGlobalError = (event: ErrorEvent) => {
      if (event.message.includes('videojs') || event.message.includes('Invalid target')) {
        console.warn('Video.js error suppressed:', event.message);
        event.preventDefault();
        return false;
      }
    };

    window.addEventListener('error', handleGlobalError);
    
    // Handle mobile back button to prevent app exit
    const handleBackButton = (event: KeyboardEvent) => {
      if (event.key === 'Backspace' || event.key === 'Escape') {
        event.preventDefault();
        // Navigate to home instead of exiting
        window.location.href = '/';
        return false;
      }
    };

    // Handle browser back button
    const handlePopState = (event: PopStateEvent) => {
      event.preventDefault();
      // Navigate to home instead of exiting
      window.location.href = '/';
      return false;
    };

    // Add event listeners for back button handling
    window.addEventListener('keydown', handleBackButton);
    window.addEventListener('popstate', handlePopState);
    
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
        (widget as HTMLElement).style.position = 'fixed';
        (widget as HTMLElement).style.bottom = '24px';
        (widget as HTMLElement).style.right = '24px';
        (widget as HTMLElement).style.zIndex = '9999';
        // Remove custom avatar styling to allow ElevenLabs avatar to show
        // widget.style.setProperty('--convai-widget-avatar', 'url("/tomabot-avatar.png")');
        // widget.style.setProperty('--convai-widget-avatar-size', '40px');
        widget.style.setProperty('--convai-widget-position', 'bottom-right');
        // widget.style.setProperty('--convai-widget-avatar-border-radius', '50%');
        // widget.style.setProperty('--convai-widget-avatar-border', '2px solid #06b6d4');
        // widget.style.setProperty('--convai-widget-avatar-box-shadow', '0 2px 8px rgba(6,182,212,0.3)');
        
        // Custom styling to override default text
        widget.style.setProperty('--convai-widget-title', 'TomaBot');
        widget.style.setProperty('--convai-widget-subtitle', 'AI Assistant');
        widget.style.setProperty('--convai-widget-button-text', 'TomaBot');
        widget.style.setProperty('--convai-widget-button-hover-text', 'TomaBot');
        
        // Test avatar loading
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
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2306b6d4'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='white' font-size='24' font-family='Arial'%3ETB%3C/text%3E%3C/svg%3E") !important;
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
            (div as HTMLElement).style.cssText = `
              width: 120px !important;
              height: 120px !important;
              border-radius: 50% !important;
              background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='45' fill='%2306b6d4'/%3E%3Ctext x='50' y='55' text-anchor='middle' fill='white' font-size='24' font-family='Arial'%3ETB%3C/text%3E%3C/svg%3E") !important;
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
        
        // AGGRESSIVE FIX FOR WHITE AREAS WITH UNREADABLE TEXT
        const allElements = widget.querySelectorAll('*');
        allElements.forEach(element => {
          if (element instanceof HTMLElement) {
            const style = window.getComputedStyle(element);
            const backgroundColor = style.backgroundColor;
            const color = style.color;
            
            // If element has white/light background with light text, fix it
            if ((backgroundColor.includes('rgb(255, 255, 255)') || 
                 backgroundColor.includes('rgba(255, 255, 255') ||
                 backgroundColor.includes('white') ||
                 backgroundColor.includes('rgb(248, 250, 252)') ||
                 backgroundColor.includes('rgb(249, 250, 251)')) &&
                (color.includes('rgb(255, 255, 255)') || 
                 color.includes('rgba(255, 255, 255') ||
                 color.includes('white') ||
                 color.includes('rgb(248, 250, 252)') ||
                 color.includes('rgb(249, 250, 251)') ||
                 color.includes('rgb(156, 163, 175)') ||
                 color.includes('rgb(107, 114, 128)'))) {
              
              // Apply readable styling
              element.style.color = '#1f2937';
              element.style.backgroundColor = '#f9fafb';
              element.style.border = '1px solid #e5e7eb';
              element.style.borderRadius = '8px';
              element.style.padding = '8px';
              element.style.margin = '4px';
              element.style.fontWeight = '500';
              element.style.lineHeight = '1.5';
              element.style.fontSize = '14px';
              element.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
            }
            
            // Special handling for specific text content
            if (element.textContent) {
              const text = element.textContent.toLowerCase();
              
              // Safety warnings
              if (text.includes('stay safe') || 
                  text.includes('never send money') || 
                  text.includes('personal information') || 
                  text.includes('strangers') ||
                  text.includes('get started today') ||
                  text.includes('decluttering') ||
                  text.includes('launching') ||
                  text.includes('great deal') ||
                  text.includes('go-to platform')) {
                element.style.color = '#dc2626';
                element.style.backgroundColor = '#fef2f2';
                element.style.border = '1px solid #fecaca';
                element.style.fontWeight = '600';
                element.style.fontSize = '16px';
              }
              
              // Contact information
              if (text.includes('support@tomashops.com') || 
                  text.includes('954-tomashops')) {
                element.style.color = '#2563eb';
                element.style.backgroundColor = '#eff6ff';
                element.style.textDecoration = 'underline';
                element.style.fontWeight = '600';
                element.style.border = '1px solid #bfdbfe';
              }
              
              // ElevenLabs attribution
              if (text.includes('powered by elevenlabs') || 
                  text.includes('conversational ai')) {
                element.style.color = '#6b7280';
                element.style.backgroundColor = '#f3f4f6';
                element.style.fontSize = '12px';
                element.style.fontWeight = '400';
                element.style.border = '1px solid #d1d5db';
              }
            }
          }
        });
        
        // Remove avatar overrides to allow ElevenLabs avatar to show
        // const avatarElements = widget.querySelectorAll('img, [class*="avatar"], [class*="profile"], [class*="user-image"]');
        // avatarElements.forEach(avatar => {
        //   if (avatar.tagName === 'IMG') {
        //     (avatar as HTMLImageElement).src = '/tomabot-avatar.png';
        //     (avatar as HTMLElement).style.display = 'block';
        //     (avatar as HTMLElement).style.visibility = 'visible';
        //   }
        //   (avatar as HTMLElement).style.backgroundImage = 'url("/tomabot-avatar.png")';
        //   (avatar as HTMLElement).style.backgroundSize = 'cover';
        //   (avatar as HTMLElement).style.backgroundPosition = 'center';
        //   (avatar as HTMLElement).style.borderRadius = '50%';
        //   (avatar as HTMLElement).style.width = '40px';
        //   (avatar as HTMLElement).style.height = '40px';
        //   (avatar as HTMLElement).style.position = 'relative';
        // });
        
        // Ensure widget stays in correct position
        (widget as HTMLElement).style.position = 'fixed';
        (widget as HTMLElement).style.bottom = '24px';
        (widget as HTMLElement).style.right = '24px';
        (widget as HTMLElement).style.zIndex = '9999';
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
            
            // Apply the same aggressive styling fix
            if (element instanceof HTMLElement) {
              const style = window.getComputedStyle(element);
              const backgroundColor = style.backgroundColor;
              const color = style.color;
              
              if ((backgroundColor.includes('rgb(255, 255, 255)') || 
                   backgroundColor.includes('rgba(255, 255, 255') ||
                   backgroundColor.includes('white') ||
                   backgroundColor.includes('rgb(248, 250, 252)') ||
                   backgroundColor.includes('rgb(249, 250, 251)')) &&
                  (color.includes('rgb(255, 255, 255)') || 
                   color.includes('rgba(255, 255, 255') ||
                   color.includes('white') ||
                   color.includes('rgb(248, 250, 252)') ||
                   color.includes('rgb(249, 250, 251)') ||
                   color.includes('rgb(156, 163, 175)') ||
                   color.includes('rgb(107, 114, 128)'))) {
                
                element.style.color = '#1f2937';
                element.style.backgroundColor = '#f9fafb';
                element.style.border = '1px solid #e5e7eb';
                element.style.borderRadius = '8px';
                element.style.padding = '8px';
                element.style.margin = '4px';
                element.style.fontWeight = '500';
                element.style.lineHeight = '1.5';
                element.style.fontSize = '14px';
                element.style.boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
              }
            }
          });
        }
      }, 2000);
    }
    
    return () => {
      window.removeEventListener('error', handleGlobalError);
      cleanupBackspaceHandler();
    };
  }, []);

  return (
    <AppProvider>
      <AudioProvider>
        <ThemeProvider defaultTheme="dark">
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ScrollToTopHandler />
                <BackButtonHandler />
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
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/login" element={<AuthPage />} />
                  <Route path="/rentals" element={<Rentals />} />
                  <Route path="/jobs" element={<Jobs />} />
                  <Route path="/jobs/:id" element={<JobDetail />} />
                  <Route path="/browse" element={<Browse />} />
                  <Route path="/digital/:id" element={<DigitalProductDetail />} />
                  <Route path="/digital" element={<Digital />} />
                  <Route path="/ads" element={<Ads />} />
                  <Route path="/handyman" element={<Handyman />} />
                  <Route path="/my-listings" element={<MyListings />} />
                  <Route path="/my-orders" element={<MyOrders />} />
                  <Route path="/seller-orders" element={<SellerOrders />} />
                  <Route path="/applications" element={<ApplicationsDashboard />} />
                  <Route path="/rentals/:id" element={<RentalDetail />} />
                  <Route path="/ads/:id" element={<AdDetail />} />
                  <Route path="/handyman/:id" element={<HandymanDetail />} />
                  <Route path="/delete-account" element={<DeleteAccountPage onBack={() => window.history.back()} />} />
                  <Route path="/suggestion-box" element={<SuggestionBox />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <MusicPlatformIntegration />
              </BrowserRouter>
            </TooltipProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </AudioProvider>
    </AppProvider>
  );
};

export default App;
