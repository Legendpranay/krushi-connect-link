
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Booking } from '../../types';
import { updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { sendPaymentConfirmation } from '../../utils/notifications';
import { CreditCard } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

// Razorpay types
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpayPaymentProps {
  booking: Booking;
  onPaymentComplete: () => void;
}

const RazorpayPayment: React.FC<RazorpayPaymentProps> = ({
  booking,
  onPaymentComplete
}) => {
  const { userProfile } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Only show for completed bookings with pending payment for farmers
  if (booking.status !== 'completed' || 
      booking.paymentStatus !== 'pending' || 
      userProfile?.role !== 'farmer') {
    return null;
  }

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    try {
      setIsLoading(true);
      
      // Load Razorpay script if not loaded
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        toast({
          title: 'Error',
          description: 'Failed to load payment gateway. Please try again.',
          variant: 'destructive',
        });
        return;
      }
      
      // In a real app, you would make an API call to your backend to create an order
      // For demo purposes, we'll simulate the order creation
      const orderAmount = booking.totalPrice * 100; // Amount in paisa
      const orderId = `order_${Date.now()}`;

      const options = {
        key: 'YOUR_RAZORPAY_KEY_ID', // Replace with your Razorpay Key ID
        amount: orderAmount,
        currency: 'INR',
        name: 'AgroConnect',
        description: `Payment for ${booking.serviceType} service`,
        order_id: orderId,
        handler: async (response: any) => {
          // Handle successful payment
          await processPayment(response);
        },
        prefill: {
          name: userProfile?.name || '',
          contact: userProfile?.phone || '',
        },
        notes: {
          bookingId: booking.id,
          serviceType: booking.serviceType,
        },
        theme: {
          color: '#9b87f5'
        }
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
      
    } catch (error) {
      console.error('Error initializing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to initialize payment. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const processPayment = async (paymentResponse: any) => {
    try {
      // Update booking payment status
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        paymentStatus: 'paid',
        paymentDate: new Date(),
        paymentId: paymentResponse.razorpay_payment_id
      });
      
      // Send payment confirmation notifications
      await sendPaymentConfirmation(booking, booking.farmerId, false);
      await sendPaymentConfirmation(booking, booking.driverId, true);
      
      toast({
        title: 'Success',
        description: 'Payment processed successfully!',
      });
      
      onPaymentComplete();
    } catch (error) {
      console.error('Error processing payment:', error);
      toast({
        title: 'Error',
        description: 'Failed to update payment status. Please contact support.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="bg-green-50 p-4 rounded-lg mb-4 border border-green-200">
      <div className="flex items-start">
        <CreditCard className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
        <div>
          <h4 className="font-medium">Complete Payment</h4>
          <p className="text-sm text-green-700 mt-1">
            Make payment for the completed service:
            <span className="font-bold block mt-1">
              Total: ₹{booking.totalPrice}
            </span>
          </p>
          
          <div className="mt-3">
            <Button 
              onClick={handlePayment}
              disabled={isLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              Pay Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RazorpayPayment;
