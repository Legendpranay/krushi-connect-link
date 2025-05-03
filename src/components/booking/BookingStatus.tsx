
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Booking, DriverProfile, FarmerProfile, UserProfile } from '../../types';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { sendBookingStatusNotification } from '../../utils/notifications';
import { Check, X, Clock, Calendar, CheckCircle, AlertTriangle } from 'lucide-react';

interface BookingStatusProps {
  booking: Booking;
  onBookingUpdated: () => void;
}

const BookingStatus: React.FC<BookingStatusProps> = ({ 
  booking,
  onBookingUpdated
}) => {
  const { currentUser, userProfile } = useAuth();
  const [otherUser, setOtherUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  
  const isDriver = userProfile?.role === 'driver';
  const isFarmer = userProfile?.role === 'farmer';
  
  useEffect(() => {
    const fetchOtherUser = async () => {
      if (!currentUser || !booking) return;
      
      try {
        setIsLoading(true);
        const otherUserId = isDriver ? booking.farmerId : booking.driverId;
        const userDoc = await getDoc(doc(db, 'users', otherUserId));
        
        if (userDoc.exists()) {
          setOtherUser(userDoc.data() as UserProfile);
        }
      } catch (error) {
        console.error('Error fetching other user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOtherUser();
  }, [currentUser, booking, isDriver]);

  const updateBookingStatus = async (newStatus: string) => {
    if (!currentUser || !booking) return;
    
    try {
      setActionLoading(true);
      const bookingRef = doc(db, 'bookings', booking.id);
      
      // Update status and timestamps based on the new status
      const updateData: Partial<Booking> = { status: newStatus };
      
      if (newStatus === 'completed') {
        updateData.completedTime = new Date();
        
        // If payment method is not immediate, set payment status to pending
        if (booking.paymentMethod === 'later') {
          updateData.paymentStatus = 'pending';
        }
      }
      
      await updateDoc(bookingRef, updateData);
      
      // Send notification to the other user
      const recipientId = isDriver ? booking.farmerId : booking.driverId;
      const recipientRole = isDriver ? 'farmer' : 'driver';
      
      await sendBookingStatusNotification(
        { ...booking, status: newStatus as any },
        recipientId,
        recipientRole
      );
      
      toast({
        description: `Booking status updated to ${newStatus}.`
      });
      
      onBookingUpdated();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update booking status. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusDisplay = () => {
    const statusColors = {
      requested: 'bg-yellow-100 text-yellow-800',
      accepted: 'bg-blue-100 text-blue-800',
      rejected: 'bg-red-100 text-red-800',
      in_progress: 'bg-purple-100 text-purple-800',
      completed: 'bg-green-100 text-green-800',
      canceled: 'bg-gray-100 text-gray-800',
      awaiting_payment: 'bg-amber-100 text-amber-800'
    };
    
    const statusLabels = {
      requested: 'Requested',
      accepted: 'Accepted',
      rejected: 'Rejected',
      in_progress: 'In Progress',
      completed: 'Completed',
      canceled: 'Canceled',
      awaiting_payment: 'Awaiting Payment'
    };
    
    const colorClass = statusColors[booking.status] || 'bg-gray-100 text-gray-800';
    const label = statusLabels[booking.status] || booking.status;
    
    return (
      <div className={`px-3 py-1 inline-flex items-center rounded-full text-sm ${colorClass}`}>
        {label}
      </div>
    );
  };

  const renderStatusActions = () => {
    // If the user is the driver and booking is in requested state
    if (isDriver && booking.status === 'requested') {
      return (
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => updateBookingStatus('accepted')}
            disabled={actionLoading}
            className="flex-1"
          >
            <Check className="h-4 w-4 mr-1" />
            Accept
          </Button>
          <Button 
            onClick={() => updateBookingStatus('rejected')}
            disabled={actionLoading}
            variant="outline"
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1" />
            Reject
          </Button>
        </div>
      );
    }
    
    // If the user is the driver and booking is accepted
    if (isDriver && booking.status === 'accepted') {
      return (
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => updateBookingStatus('in_progress')}
            disabled={actionLoading}
            className="flex-1"
          >
            <Clock className="h-4 w-4 mr-1" />
            Start Service
          </Button>
          <Button 
            onClick={() => updateBookingStatus('canceled')}
            disabled={actionLoading}
            variant="outline"
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
        </div>
      );
    }
    
    // If the user is the driver and booking is in progress
    if (isDriver && booking.status === 'in_progress') {
      return (
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => updateBookingStatus('completed')}
            disabled={actionLoading}
            className="flex-1"
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Complete Service
          </Button>
        </div>
      );
    }
    
    // If the user is the farmer and booking is requested
    if (isFarmer && booking.status === 'requested') {
      return (
        <div className="flex gap-2 mt-4">
          <Button 
            onClick={() => updateBookingStatus('canceled')}
            disabled={actionLoading}
            variant="outline"
            className="flex-1"
          >
            <X className="h-4 w-4 mr-1" />
            Cancel Request
          </Button>
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm">
      <div className="flex flex-col">
        <h3 className="text-lg font-semibold mb-2">Booking Status</h3>
        
        <div className="flex items-center mb-4">
          <div className="mr-2">Current Status:</div>
          {getStatusDisplay()}
        </div>
        
        {booking.scheduledTime && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <Calendar className="h-4 w-4 mr-1" />
            Scheduled for: {new Date(booking.scheduledTime).toLocaleString()}
          </div>
        )}
        
        {booking.completedTime && (
          <div className="flex items-center text-sm text-gray-600 mb-4">
            <CheckCircle className="h-4 w-4 mr-1" />
            Completed on: {new Date(booking.completedTime).toLocaleString()}
          </div>
        )}
        
        {/* Display payment status if the booking is completed */}
        {booking.status === 'completed' && (
          <div className="mt-2 mb-4">
            <div className="text-sm mb-1">Payment Status:</div>
            <div className={`px-3 py-1 inline-flex items-center rounded-full text-sm ${
              booking.paymentStatus === 'paid' 
                ? 'bg-green-100 text-green-800' 
                : booking.paymentStatus === 'failed'
                ? 'bg-red-100 text-red-800'
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {booking.paymentStatus}
            </div>
            
            {booking.paymentStatus === 'pending' && booking.paymentMethod === 'later' && (
              <div className="flex items-center mt-2 text-sm text-amber-600">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Payment due after harvesting
              </div>
            )}
          </div>
        )}
        
        {/* Show status action buttons */}
        {renderStatusActions()}
      </div>
    </div>
  );
};

export default BookingStatus;
