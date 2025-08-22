import React from 'react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Smartphone, Download, Share2, Plus, Info } from 'lucide-react';

const PWAInstallGuide: React.FC = () => {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  const isAndroid = /Android/.test(navigator.userAgent);

  const getInstallSteps = () => {
    if (isIOS) {
      return [
        {
          step: 1,
          icon: <Share2 className="h-6 w-6" />,
          title: "Tap the Share Button",
          description: "Look for the share button (square with arrow pointing up) in your Safari browser"
        },
        {
          step: 2,
          icon: <Plus className="h-6 w-6" />,
          title: "Select 'Add to Home Screen'",
          description: "Scroll down and tap 'Add to Home Screen' from the share menu"
        },
        {
          step: 3,
          icon: <Download className="h-6 w-6" />,
          title: "Tap 'Add'",
          description: "Confirm the installation by tapping 'Add' in the top right corner"
        }
      ];
    } else if (isAndroid) {
      return [
        {
          step: 1,
          icon: <Share2 className="h-6 w-6" />,
          title: "Tap the Menu Button",
          description: "Tap the three dots menu button in your Chrome browser"
        },
        {
          step: 2,
          icon: <Plus className="h-6 w-6" />,
          title: "Select 'Add to Home Screen'",
          description: "Tap 'Add to Home Screen' from the menu options"
        },
        {
          step: 3,
          icon: <Download className="h-6 w-6" />,
          title: "Tap 'Add'",
          description: "Confirm the installation by tapping 'Add'"
        }
      ];
    } else {
      return [
        {
          step: 1,
          icon: <Share2 className="h-6 w-6" />,
          title: "Look for Install Button",
          description: "Look for an install button in your browser's address bar or menu"
        },
        {
          step: 2,
          icon: <Plus className="h-6 w-6" />,
          title: "Click Install",
          description: "Click the install button when it appears"
        },
        {
          step: 3,
          icon: <Download className="h-6 w-6" />,
          title: "Confirm Installation",
          description: "Confirm the installation in the popup dialog"
        }
      ];
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-cyan-400 border-cyan-400 hover:bg-cyan-400 hover:text-white">
          <Info className="h-4 w-4 mr-2" />
          How to Install
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Smartphone className="h-6 w-6 text-cyan-500" />
            <span>Install TomaShops App</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Follow these steps to install TomaShops on your device for a better experience:
          </p>
          
          <div className="space-y-3">
            {getInstallSteps().map((step) => (
              <div key={step.step} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-100 rounded-full flex items-center justify-center text-cyan-600 font-bold text-sm">
                  {step.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {step.icon}
                    <h4 className="font-semibold text-gray-900">{step.title}</h4>
                  </div>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-cyan-50 border border-cyan-200 rounded-lg p-3">
            <p className="text-sm text-cyan-800">
              <strong>Tip:</strong> After installation, you'll find TomaShops on your home screen and it will work like a native app!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PWAInstallGuide; 