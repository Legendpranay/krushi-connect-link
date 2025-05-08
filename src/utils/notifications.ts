
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Notification, Booking, UserProfile, NotificationType } from '../types';

// Send a notification to a user
export const sendNotification = async (
  userId: string,
  title: string,
  body: string,
  type: NotificationType,
  relatedId?: string
): Promise<string> => {
  try {
    const notificationsRef = collection(db, 'notifications');
    const notification: Notification = {
      id: '', // Firestore will generate an ID
      userId,
      title,
      body,
      type,
      relatedId,
      isRead: false,
      createdAt: new Date()
    };
    
    const docRef = await addDoc(notificationsRef, notification);
    return docRef.id;
  } catch (error) {
    console.error('Error sending notification:', error);
    throw error;
  }
};

// Send booking status update notification
export const sendBookingStatusNotification = async (
  booking: Booking,
  recipientId: string,
  recipientRole: 'farmer' | 'driver'
): Promise<string> => {
  let title = '';
  let body = '';
  
  switch (booking.status) {
    case 'accepted':
      title = recipientRole === 'farmer' 
        ? 'Booking Accepted' 
        : 'New Booking';
      body = recipientRole === 'farmer'
        ? 'Your booking request has been accepted by the driver.'
        : 'You have accepted a new booking request.';
      break;
    case 'rejected':
      title = recipientRole === 'farmer' 
        ? 'Booking Rejected' 
        : 'Booking Declined';
      body = recipientRole === 'farmer'
        ? 'Your booking request has been rejected by the driver.'
        : 'You have declined a booking request.';
      break;
    case 'in_progress':
      title = 'Service Started';
      body = recipientRole === 'farmer'
        ? 'Your booked service has started.'
        : 'You have started the service.';
      break;
    case 'completed':
      title = 'Service Completed';
      body = recipientRole === 'farmer'
        ? 'Your service has been marked as completed. Please provide payment.'
        : 'You have completed the service. Payment is pending.';
      break;
    case 'canceled':
    case 'cancelled':
      title = 'Booking Canceled';
      body = recipientRole === 'farmer'
        ? 'You have canceled your booking.'
        : 'The farmer has canceled a booking with you.';
      break;
    default:
      title = 'Booking Update';
      body = `Your booking status has been updated to: ${booking.status}`;
  }
  
  return sendNotification(
    recipientId,
    title,
    body,
    'booking_update',
    booking.id
  );
};

// Send payment reminder
export const sendPaymentReminder = async (
  booking: Booking,
  farmerId: string,
  reminderCount: number = 1
): Promise<string> => {
  const reminderText = reminderCount > 1
    ? `Reminder #${reminderCount}: `
    : '';
  
  return sendNotification(
    farmerId,
    `${reminderText}Payment Due`,
    `Payment of ₹${booking.totalPrice} is due for the ${booking.serviceType} service. Please make the payment at your earliest convenience.`,
    'payment',
    booking.id
  );
};

// Send payment confirmation
export const sendPaymentConfirmation = async (
  booking: Booking,
  userId: string,
  isDriver: boolean
): Promise<string> => {
  return sendNotification(
    userId,
    'Payment Successful',
    isDriver
      ? `You have received a payment of ₹${booking.totalPrice} for the ${booking.serviceType} service.`
      : `Your payment of ₹${booking.totalPrice} for the ${booking.serviceType} service has been processed successfully.`,
    'payment',
    booking.id
  );
};
