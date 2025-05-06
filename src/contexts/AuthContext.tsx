
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signOut,
  signInWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { toast } from '@/components/ui/use-toast';

// Auth context type
interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signInWithPhone: (phoneNumber: string) => Promise<any>;
  confirmOtp: (verificationId: string, otp: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  recaptchaVerifier: React.MutableRefObject<RecaptchaVerifier | null>;
  updateDriverStatus: (isActive: boolean) => Promise<boolean>;
}

// Create the auth context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider props type
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider component
export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const recaptchaVerifierRef = React.useRef<RecaptchaVerifier | null>(null);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data() as UserProfile);
          } else {
            // Create a bare-bones user profile if it doesn't exist yet
            const newUserProfile: UserProfile = {
              id: user.uid,
              phone: user.phoneNumber || '',
              name: '',
              role: null, // User will select role during onboarding
              isProfileComplete: false,
              createdAt: new Date(),
            };
            
            await setDoc(doc(db, 'users', user.uid), newUserProfile);
            setUserProfile(newUserProfile);
          }
        } catch (error) {
          console.error("Error fetching/creating user profile:", error);
          toast({
            title: "Error",
            description: "Failed to load user profile. Please try again later.",
            variant: "destructive",
          });
        }
      } else {
        setUserProfile(null);
      }
      
      setIsLoading(false);
    });

    return unsubscribe;
  }, []);

  // Sign in with phone number
  const signInWithPhone = async (phoneNumber: string) => {
    try {
      // Clear any existing recaptcha
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
      
      // Create a new RecaptchaVerifier
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
        size: 'normal',
        callback: () => {
          // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log("Recaptcha verified");
        },
        'expired-callback': () => {
          // Response expired. Ask user to solve reCAPTCHA again.
          toast({
            title: "Recaptcha expired",
            description: "Please refresh the page and try again",
            variant: "destructive",
          });
        }
      });

      // Format the phone number (add country code if needed)
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+91${phoneNumber}`; // Default to India country code
      
      // Start the phone sign in process
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone,
        recaptchaVerifierRef.current
      );
      
      // Return the verification ID to be used later for confirming the OTP
      return { 
        verificationId: confirmationResult.verificationId,
        success: true 
      };
    } catch (error: any) {
      console.error("Error during phone authentication:", error);
      return { 
        success: false, 
        error: error.message || "Failed to send OTP" 
      };
    }
  };

  // Confirm OTP
  const confirmOtp = async (verificationId: string, otp: string) => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error("Error confirming OTP:", error);
      toast({
        title: "Error confirming OTP",
        description: error.message || "Invalid OTP. Please try again.",
        variant: "destructive"
      });
      return { success: false, error: error.message };
    }
  };

  // Log out
  const logout = async () => {
    await signOut(auth);
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) {
      throw new Error('No user is signed in');
    }

    const userRef = doc(db, 'users', currentUser.uid);
    
    // Get the current data first
    const userDoc = await getDoc(userRef);
    if (userDoc.exists()) {
      // Merge with existing data
      await updateDoc(userRef, { ...data });
    } else {
      // Create new document
      await setDoc(userRef, { 
        id: currentUser.uid,
        phone: currentUser.phoneNumber || '',
        ...data,
        createdAt: new Date()
      });
    }
    
    // Update local state
    if (userProfile) {
      setUserProfile({ ...userProfile, ...data });
    }
  };

  // Update driver status (online/offline)
  const updateDriverStatus = async (isActive: boolean) => {
    if (!currentUser || userProfile?.role !== 'driver') {
      toast({
        title: "Error",
        description: "You must be logged in as a driver to update status",
        variant: "destructive"
      });
      return false;
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, { isActive });
      
      // Update local state
      setUserProfile({
        ...userProfile,
        isActive
      });
      
      toast({
        title: isActive ? "You're Online" : "You're Offline",
        description: isActive 
          ? "You're now visible to farmers and can receive bookings" 
          : "You won't receive new booking requests while offline",
      });
      
      return true;
    } catch (error) {
      console.error("Error updating driver status:", error);
      toast({
        title: "Error",
        description: "Failed to update your status. Please try again.",
        variant: "destructive"
      });
      return false;
    }
  };

  const value = {
    currentUser,
    userProfile,
    isLoading,
    signInWithPhone,
    confirmOtp,
    logout,
    updateUserProfile,
    recaptchaVerifier: recaptchaVerifierRef,
    updateDriverStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
