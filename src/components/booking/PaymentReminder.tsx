
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Booking } from '../../types';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { sendPaymentReminder } from '../../utils/notifications';
import { AlertTriangle, Calendar, Check } from 'lucide-react';

interface PaymentReminderProps {
  booking: Booking;
  onReminderSent: () => void;
}

const PaymentReminder: React.FC<PaymentReminderProps> = ({
  booking,
  onReminderSent
}) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Only show for completed bookings with pending payment
  if (booking.status !== 'completed' || booking.paymentStatus !== 'pending') {
    return null;
  }

  const handleSendReminder = async () => {
    try {
      setIsLoading(true);
      
      // Create or update payment reminder record
      const reminderData = {
        bookingId: booking.id,
        farmerId: booking.farmerId,
        driverId: booking.driverId,
        amount: booking.totalPrice,
        dueDate: booking.paymentDueDate || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // Default 15 days
        status: 'sent',
        lastReminderSent: new Date(),
        reminderCount: (booking.reminderCount || 0) + 1,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // If this is the first reminder, create a new record
      if (!booking.reminderCount) {
        const remindersRef = collection(db, 'payment_reminders');
        await addDoc(remindersRef, reminderData);
      }
      
      // Update the booking record with reminder count
      const bookingRef = doc(db, 'bookings', booking.id);
      await updateDoc(bookingRef, {
        reminderCount: (booking.reminderCount || 0) + 1,
        lastReminderSent: new Date()
      });
      
      // Send notification to farmer
      await sendPaymentReminder(
        booking,
        booking.farmerId,
        (booking.reminderCount || 0) + 1
      );
      
      toast({
        description: 'Payment reminder sent successfully.',
      });
      
      // Notify parent component
      onReminderSent();
    } catch (error) {
      console.error('Error sending payment reminder:', error);
      toast({
        title: 'Error',
        description: 'Failed to send payment reminder.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-amber-50 p-4 rounded-lg mb-4 border border-amber-200">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
        <div>
          <h4 className="font-medium">Payment Reminder</h4>
          <p className="text-sm text-amber-700 mt-1">
            This booking has been completed but payment is still pending.
            {booking.paymentDueDate && (
              <span className="block mt-1">
                <Calendar className="h-4 w-4 inline mr-1" />
                Due by: {new Date(booking.paymentDueDate).toLocaleDateString()}
              </span>
            )}
          </p>
          
          <div className="mt-3">
            <Button 
              size="sm"
              onClick={handleSendReminder}
              disabled={isLoading}
            >
              Send Payment Reminder
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentReminder;
