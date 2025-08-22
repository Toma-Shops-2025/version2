import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Smartphone, Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const PWAFirstOpenInstall: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Already installed? Do nothing
    const installed = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone === true;
    if (installed) return;

    // Only show once per device unless user dismisses explicitly later
    const alreadyShown = localStorage.getItem('pwa-first-open-shown');
    if (alreadyShown === 'true') return;

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setOpen(true);
      localStorage.setItem('pwa-first-open-shown', 'true');
    };

    const handleAppInstalled = () => {
      setOpen(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Fallback: if browser won't fire beforeinstallprompt (e.g. iOS Safari), still show instructions modal
    const fallbackTimer = setTimeout(() => {
      if (!deferredPrompt && !installed && !alreadyShown) {
        setOpen(true);
        localStorage.setItem('pwa-first-open-shown', 'true');
      }
    }, 2000);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
      clearTimeout(fallbackTimer);
    };
  }, [deferredPrompt]);

  const onInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        setOpen(false);
      }
    } else {
      // Fallback instructions for platforms without beforeinstallprompt
      alert('To install TomaShops:\n\n1) Tap the Share button in your browser\n2) Choose "Add to Home Screen"\n3) Tap Add');
    }
  };

  if (!open) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Smartphone className="h-5 w-5 text-teal-600" />
            <span>Install TomaShops</span>
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            Add TomaShops to your home screen for faster access, app-like experience, and offline support.
          </p>
          <div className="flex gap-2">
            <Button onClick={onInstall} className="bg-teal-600 hover:bg-teal-700 text-white">
              <Download className="w-4 h-4 mr-2" />
              Install
            </Button>
            <Button variant="outline" onClick={() => setOpen(false)}>Not now</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PWAFirstOpenInstall; 