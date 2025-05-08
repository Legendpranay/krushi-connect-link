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
}

export interface DriverProfile extends UserProfile {
  tractorType: string;
  tractorImage: string;
  licenseImage: string;
  equipment: Equipment[];
  isActive: boolean;
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

export interface Booking {
  id: string;
  farmerId: string;
  driverId: string;
  serviceType: string;
  acreage: number;
  location: FirebaseGeoPoint;
  requestedTime: Date;
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled' | 'awaiting_payment';
  createdAt: Date;
  updatedAt?: Date;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'booking_request' | 'booking_update' | 'general';
  message: string;
  timestamp: Date;
  isRead: boolean;
}

export interface Review {
  id: string;
  bookingId: string;
  driverId: string;
  farmerId: string;
  rating: number;
  comment?: string;
  timestamp: Date;
}

export type Language = 'en' | 'hi' | 'mr';
