import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Shield } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  listingTitle: string;
}

const PaymentDialog: React.FC<PaymentDialogProps> = ({ 
  isOpen, 
  onClose, 
  amount, 
  listingTitle 
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePayment = async () => {
    setIsProcessing(true);
    // Simulate payment processing
    setTimeout(() => {
      toast({
        title: "Payment Successful",
        description: `Payment of $${amount} processed securely`
      });
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby="payment-dialog-desc">
        <div id="payment-dialog-desc" className="sr-only">Secure payment dialog. Enter your payment details to complete the purchase.</div>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-green-600" />
            Secure Payment
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-medium">{listingTitle}</p>
            <p className="text-2xl font-bold text-green-600">${amount}</p>
          </div>
          
          <div className="space-y-3">
            <div>
              <Label>Card Number</Label>
              <Input placeholder="1234 5678 9012 3456" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Expiry</Label>
                <Input placeholder="MM/YY" />
              </div>
              <div>
                <Label>CVV</Label>
                <Input placeholder="123" />
              </div>
            </div>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            <CreditCard className="h-4 w-4 mr-2" />
            Your payment is protected by secure encryption
          </div>

          <Button 
            onClick={handlePayment} 
            disabled={isProcessing}
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isProcessing ? 'Processing...' : `Pay $${amount}`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDialog;