
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPhoneNumber,
  PhoneAuthProvider,
  RecaptchaVerifier,
  signOut,
  signInWithCredential,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, createRecaptchaVerifier } from '../lib/firebase';
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
  updateDriverStatus: (isActive: boolean) => Promise<boolean>;
  initializeRecaptcha: () => void;
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
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);

  // Initialize reCAPTCHA verifier
  const initializeRecaptcha = useCallback(() => {
    if (recaptchaVerifier) {
      // Clean up previous instance if exists
      try {
        recaptchaVerifier.clear();
      } catch (e) {
        console.error("Error clearing previous recaptcha:", e);
      }
    }

    try {
      const verifier = createRecaptchaVerifier(auth);
      setRecaptchaVerifier(verifier);
      console.log("Recaptcha verifier initialized");
    } catch (error) {
      console.error("Failed to initialize reCAPTCHA:", error);
    }
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log("Auth state changed:", user ? `User ${user.uid}` : "No user");
      setCurrentUser(user);
      
      if (user) {
        try {
          // Fetch user profile from Firestore
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Convert Firestore timestamps to Date objects
            const profile = {
              ...userData,
              createdAt: userData.createdAt ? new Date(userData.createdAt.seconds * 1000) : new Date()
            } as UserProfile;
            
            setUserProfile(profile);
            console.log("User profile loaded:", profile);
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
            
            await setDoc(doc(db, 'users', user.uid), {
              ...newUserProfile,
              createdAt: serverTimestamp()
            });
            setUserProfile(newUserProfile);
            console.log("New user profile created");
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
      if (!recaptchaVerifier) {
        console.error("reCAPTCHA verifier not initialized");
        return { 
          success: false, 
          error: "Authentication system not ready. Please refresh the page and try again."
        };
      }
      
      // Format the phone number (add country code if needed)
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+91${phoneNumber}`; // Default to India country code
      
      console.log(`Attempting to sign in with phone: ${formattedPhone}`);
      
      // Start the phone sign in process
      const confirmationResult = await signInWithPhoneNumber(
        auth, 
        formattedPhone,
        recaptchaVerifier
      );
      
      console.log("OTP sent successfully");
      
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
      console.log("Attempting to verify OTP");
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      console.log("OTP verified successfully");
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error("Error confirming OTP:", error);
      return { 
        success: false, 
        error: error.message || "Invalid OTP. Please try again."
      };
    }
  };

  // Log out
  const logout = async () => {
    await signOut(auth);
    console.log("User logged out");
  };

  // Update user profile
  const updateUserProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) {
      throw new Error('No user is signed in');
    }

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Get the current data first
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        // Merge with existing data
        await updateDoc(userRef, { 
          ...data,
          updatedAt: serverTimestamp()
        });
      } else {
        // Create new document
        await setDoc(userRef, { 
          id: currentUser.uid,
          phone: currentUser.phoneNumber || '',
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      
      // Update local state
      if (userProfile) {
        setUserProfile({ ...userProfile, ...data });
      }
      
      console.log("User profile updated successfully");
      return;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw new Error('Failed to update profile');
    }
  };

  // Update driver status (online/offline)
  const updateDriverStatus = async (isActive: boolean) => {
    if (!currentUser || userProfile?.role !== 'driver') {
      console.error("Cannot update driver status: User not logged in or not a driver");
      toast({
        title: "Error",
        description: "You must be logged in as a driver to update status",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.log(`Updating driver status to: ${isActive ? 'online' : 'offline'}`);
      const userRef = doc(db, 'users', currentUser.uid);
      
      await updateDoc(userRef, { 
        isActive,
        updatedAt: serverTimestamp()
      });
      
      // Update local state
      setUserProfile({
        ...userProfile,
        isActive
      });
      
      console.log(`Driver status updated to: ${isActive ? 'online' : 'offline'}`);
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
    updateDriverStatus,
    initializeRecaptcha
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
