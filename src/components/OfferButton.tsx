import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';
import { useAppContext } from '@/contexts/AppContext';

interface OfferButtonProps {
  listingId: string;
  sellerId: string;
  currentPrice: number;
  listingTitle: string;
}

const OfferButton: React.FC<OfferButtonProps> = ({ 
  listingId, 
  sellerId, 
  currentPrice,
  listingTitle
}) => {
  const [offerAmount, setOfferAmount] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { user } = useAppContext();

  const handleSubmitOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast({
        title: "Invalid offer",
        description: "Please enter a valid amount",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const buyerId = user?.id;
      if (!buyerId) throw new Error('Not logged in');
      
      const { error } = await supabase
        .from('offers')
        .insert({
          listing_id: listingId,
          buyer_id: buyerId,
          seller_id: sellerId,
          amount: parseFloat(offerAmount),
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      toast({
        title: "Offer submitted",
        description: `Your offer of $${offerAmount} has been sent to the seller`
      });
      
      setIsOpen(false);
      setOfferAmount('');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit offer",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBuyNow = () => {
    setShowPayment(true);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant="outline" className="w-full">
            Make offer
          </Button>
        </DialogTrigger>
        <DialogContent aria-describedby="offer-dialog-desc">
          <div id="offer-dialog-desc" className="sr-only">Make an offer for this listing by entering your price.</div>
          <DialogHeader>
            <DialogTitle>Make an Offer</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="offer">Your offer</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="offer"
                  type="number"
                  placeholder="0.00"
                  value={offerAmount}
                  onChange={(e) => setOfferAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
              <p className="text-sm text-gray-500 mt-1">
                Listed price: ${currentPrice.toLocaleString()}
              </p>
            </div>
            <Button 
              onClick={handleSubmitOffer} 
              disabled={isSubmitting}
              className="w-full"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Offer'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default OfferButton;