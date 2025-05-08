
import { GeoPoint as FirebaseGeoPoint } from 'firebase/firestore';

export type UserRole = 'farmer' | 'driver' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole | null;
  isProfileComplete: boolean;
  createdAt: Date;
  updatedAt?: Date;
  // Common fields
  village?: string;
  district?: string;
  state?: string;
  profileImage?: string;
  farmLocation?: GeoPoint;
  isActive?: boolean;
  // Farmer fields
  farmSize?: number;
  // Driver fields
  tractorType?: string;
  tractorImage?: string;
  licenseImage?: string;
  equipment?: Equipment[];
  location?: GeoPoint;
  rating?: number;
  totalRatings?: number;
  isVerified?: boolean;
}

export interface DriverProfile extends UserProfile {
  tractorType: string;
  tractorImage: string;
  licenseImage: string;
  equipment: Equipment[];
  isActive: boolean;
  location?: GeoPoint;
  rating?: number;
  totalRatings?: number;
  isVerified?: boolean;
}

export interface FarmerProfile extends UserProfile {
  farmSize: number;
  farmLocation?: GeoPoint;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export interface Equipment {
  id: string;
  name: string;
  pricePerAcre: number;
  pricePerHour?: number | null;
}

export type BookingStatus = 'requested' | 'accepted' | 'in_progress' | 'completed' | 'canceled' | 'rejected' | 'awaiting_payment' | 'cancelled';

export type PaymentMethod = 'cash' | 'later' | 'online';

export type PaymentStatus = 'pending' | 'paid' | 'failed';

export interface Booking {
  id: string;
  farmerId: string;
  driverId: string;
  serviceType: string;
  equipmentId?: string;
  acreage: number;
  location: FirebaseGeoPoint;
  address: string;
  requestedTime: Date;
  scheduledTime?: Date;
  completedTime?: Date;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paymentDueDate?: Date;
  pricePerAcre: number;
  totalPrice: number;
  reminderCount?: number;
  lastReminderSent?: Date;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export type NotificationType = 'booking_request' | 'booking_update' | 'payment' | 'chat' | 'system' | 'general';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: NotificationType;
  relatedId?: string;
  isRead: boolean;
  createdAt: Date;
}

export interface Review {
  id: string;
  bookingId: string;
  toUserId: string;
  fromUserId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export type Language = 'en' | 'hi' | 'mr';
