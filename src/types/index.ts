
export type UserRole = 'farmer' | 'driver' | 'admin';

export type Language = 'en' | 'hi' | 'mr';

export interface UserProfile {
  id: string;
  phone: string;
  name?: string;
  role: UserRole | null;
  village?: string;
  district?: string;
  state?: string;
  profileImage?: string;
  isProfileComplete: boolean;
  createdAt: Date;
  language?: Language;
  // Add properties that are used in both DriverProfile and FarmerProfile
  tractorImage?: string;
  licenseImage?: string;
  farmSize?: number;
  farmLocation?: GeoPoint;
  location?: GeoPoint;
}

export interface DriverProfile extends UserProfile {
  role: 'driver';
  tractorType?: string;
  tractorImage?: string;
  licenseImage?: string;
  equipment: Equipment[];
  isVerified: boolean;
  rating?: number;
  totalRatings?: number;
  reviews?: Review[];
  location?: GeoPoint;
  isActive: boolean;
}

export interface FarmerProfile extends UserProfile {
  role: 'farmer';
  farmSize?: number; // in acres
  farmLocation?: GeoPoint;
  preferredPaymentMethod?: PaymentMethod;
  rating?: number;
  totalRatings?: number;
}

export interface AdminProfile extends UserProfile {
  role: 'admin';
  permissions: string[];
}

export type Equipment = {
  id: string;
  name: string;
  pricePerAcre: number;
  pricePerHour?: number;
};

export type GeoPoint = {
  latitude: number;
  longitude: number;
};

export type PaymentMethod = 'razorpay' | 'cash' | 'later';

export type BookingStatus = 
  | 'requested' 
  | 'accepted' 
  | 'rejected' 
  | 'completed' 
  | 'canceled'
  | 'in_progress'
  | 'awaiting_payment';

export interface Booking {
  id: string;
  farmerId: string;
  driverId: string;
  serviceType: string;
  equipmentId: string;
  location: GeoPoint;
  address: string;
  acreage: number;
  pricePerAcre: number;
  totalPrice: number;
  status: BookingStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: 'paid' | 'pending' | 'failed';
  paymentDueDate?: Date;
  requestedTime: Date;
  scheduledTime?: Date;
  completedTime?: Date;
  farmerRating?: number;
  driverRating?: number;
  farmerFeedback?: string;
  driverFeedback?: string;
  createdAt: Date;
  updatedAt: Date;
  reminderCount?: number;
  lastReminderSent?: Date;
  paymentDate?: Date;
  paymentId?: string;
}

export interface Review {
  id: string;
  fromUserId: string;
  toUserId: string;
  bookingId: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface PaymentReminder {
  id: string;
  bookingId: string;
  farmerId: string;
  driverId: string;
  amount: number;
  dueDate: Date;
  status: 'pending' | 'sent' | 'paid';
  lastReminderSent?: Date;
  reminderCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  body: string;
  type: 'booking' | 'payment' | 'system' | 'chat';
  relatedId?: string; // ID of related entity (booking, payment, etc.)
  isRead: boolean;
  createdAt: Date;
}
