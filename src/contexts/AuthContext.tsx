
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
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';

// User roles
export type UserRole = 'farmer' | 'driver' | 'admin' | null;

// User profile type
export interface UserProfile {
  id: string;
  phone: string;
  name?: string;
  role: UserRole;
  village?: string;
  district?: string;
  state?: string;
  profileImage?: string;
  isProfileComplete: boolean;
  createdAt: Date;
}

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
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          // Create a bare-bones user profile if it doesn't exist yet
          const newUserProfile: UserProfile = {
            id: user.uid,
            phone: user.phoneNumber || '',
            role: null, // User will select role during onboarding
            isProfileComplete: false,
            createdAt: new Date(),
          };
          
          await setDoc(doc(db, 'users', user.uid), newUserProfile);
          setUserProfile(newUserProfile);
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
      // Create a new RecaptchaVerifier if we don't have one
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = new RecaptchaVerifier(auth, 'recaptcha-container', {
          size: 'normal',
          callback: () => {
            // reCAPTCHA solved, allow signInWithPhoneNumber.
          }
        });
      }

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
    } catch (error) {
      console.error("Error during phone authentication:", error);
      return { 
        success: false, 
        error 
      };
    }
  };

  // Confirm OTP
  const confirmOtp = async (verificationId: string, otp: string) => {
    try {
      const credential = PhoneAuthProvider.credential(verificationId, otp);
      const result = await signInWithCredential(auth, credential);
      return { success: true, user: result.user };
    } catch (error) {
      console.error("Error confirming OTP:", error);
      return { success: false, error };
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
    await setDoc(userRef, { ...data }, { merge: true });
    
    // Update local state
    if (userProfile) {
      setUserProfile({ ...userProfile, ...data });
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
