
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import EmailLoginForm from '../components/EmailLoginForm';
import UserContainer from '../components/UserContainer';

const AuthPage = () => {
  const { currentUser, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Effect to handle redirection after auth state changes
  useEffect(() => {
    if (isLoading) return;
    
    if (currentUser) {
      console.log("Auth page - user logged in, profile state:", 
                  userProfile ? `Role: ${userProfile.role}, Complete: ${userProfile.isProfileComplete}` : "No profile");
      
      // Handle user redirection based on profile completion state
      if (!userProfile) {
        console.log("No user profile available yet, waiting...");
        return; // Wait for profile to load
      }
      
      if (!userProfile.role) {
        console.log("Redirecting to role selection");
        navigate("/select-role");
      } else if (userProfile.isProfileComplete === false) {
        if (userProfile.role === 'farmer') {
          console.log("Redirecting to complete farmer profile");
          navigate("/complete-farmer-profile");
        } else if (userProfile.role === 'driver') {
          console.log("Redirecting to complete driver profile");
          navigate("/complete-driver-profile");
        }
      } else {
        // Profile is complete, go to home
        console.log("Profile is complete, redirecting to home");
        navigate("/");
      }
    }
  }, [currentUser, userProfile, isLoading, navigate]);

  // Show loading while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4">Loading...</p>
      </div>
    );
  }

  // If user is already logged in, don't render the auth page
  // (Redirection is handled by the useEffect hook)
  if (currentUser) {
    return null;
  }

  // Show email login form
  return (
    <UserContainer hideBottomNav>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col justify-center">
        <EmailLoginForm
          onSuccess={() => {/* Nothing needed here - redirects handled by useEffect */}}
        />
      </div>
    </UserContainer>
  );
};

export default AuthPage;
