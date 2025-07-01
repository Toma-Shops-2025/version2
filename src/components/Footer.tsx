import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mail, Phone } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-xl font-bold mb-4">
              TomaShops™ <span className="text-teal-400">Video 1st Marketplace</span>
            </h3>
            <p className="text-gray-300 mb-6">
              The first video-required marketplace for safe, local buying and selling.
            </p>
            
            {/* Newsletter Signup */}
            <div className="mb-6">
              <h4 className="font-semibold mb-2">Stay Updated</h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 border-gray-700 text-white"
                />
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Subscribe
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto">How It Works</Button></li>
              <li><Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto">Why Choose TomaShops</Button></li>
              <li><Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto">Safety Measures</Button></li>
              <li><Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto">Shipping & Handling</Button></li>
            </ul>
          </div>

          {/* Legal & Support */}
          <div>
            <h4 className="font-semibold mb-4">Support & Legal</h4>
            <ul className="space-y-2 mb-6">
              <li><Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto">Privacy Policy</Button></li>
              <li><Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto">Terms of Service</Button></li>
              <li><Button variant="link" className="text-gray-300 hover:text-white p-0 h-auto">FAQ</Button></li>
            </ul>
            
            {/* Contact Info */}
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-300">
                <Mail className="h-4 w-4 mr-2" />
                <span>support@tomashops.com</span>
              </div>
              <div className="flex items-center text-sm text-gray-300">
                <Phone className="h-4 w-4 mr-2" />
                <span>1-800-TOMASHOPS</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 TomaShops™ Video 1st Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;