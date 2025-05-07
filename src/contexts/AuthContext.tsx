import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  onAuthStateChanged, 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { UserProfile, UserRole } from '../types';
import { toast } from '@/components/ui/use-toast';

// Auth context type
interface AuthContextType {
  currentUser: FirebaseUser | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
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
              email: user.email || '',
              phone: '', // Adding the required phone field with empty string default
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

  // Sign up with email and password
  const signUp = async (email: string, password: string) => {
    try {
      console.log(`Attempting to sign up with email: ${email}`);
      const result = await createUserWithEmailAndPassword(auth, email, password);
      console.log("Sign up successful");
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error("Error during sign up:", error);
      return { 
        success: false, 
        error: error.message || "Failed to sign up" 
      };
    }
  };

  // Sign in with email and password
  const signIn = async (email: string, password: string) => {
    try {
      console.log(`Attempting to sign in with email: ${email}`);
      const result = await signInWithEmailAndPassword(auth, email, password);
      console.log("Sign in successful");
      return { success: true, user: result.user };
    } catch (error: any) {
      console.error("Error during sign in:", error);
      return { 
        success: false, 
        error: error.message || "Failed to sign in" 
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
      console.error("Cannot update profile: No user is signed in");
      throw new Error('No user is signed in');
    }

    try {
      console.log("Updating user profile with data:", data);
      const userRef = doc(db, 'users', currentUser.uid);
      
      // Get the current data first
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        // Merge with existing data
        console.log("Existing user document found, updating...");
        await updateDoc(userRef, { 
          ...data,
          updatedAt: serverTimestamp()
        });
        console.log("Document updated successfully");
      } else {
        // Create new document
        console.log("No existing user document, creating new one...");
        await setDoc(userRef, { 
          id: currentUser.uid,
          email: currentUser.email || '',
          phone: '',
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
        console.log("Document created successfully");
      }
      
      // Update local state immediately
      setUserProfile(prevProfile => {
        if (!prevProfile) return { ...data, id: currentUser.uid } as UserProfile;
        const updatedProfile = { ...prevProfile, ...data };
        console.log("Updating local user profile state:", updatedProfile);
        return updatedProfile;
      });
      
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
      setUserProfile(prev => {
        if (!prev) return null;
        return {
          ...prev,
          isActive
        };
      });
      
      console.log(`Driver status updated to: ${isActive ? 'online' : 'offline'}`);
      
      // Show a success toast
      toast({
        title: "Status Updated",
        description: `You are now ${isActive ? 'online' : 'offline'}`,
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
    signUp,
    signIn,
    logout,
    updateUserProfile,
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
