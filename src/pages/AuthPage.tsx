
import React, { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PhoneLoginForm from '../components/PhoneLoginForm';
import OtpVerificationForm from '../components/OtpVerificationForm';
import UserContainer from '../components/UserContainer';

const AuthPage = () => {
  const { currentUser, userProfile, isLoading, initializeRecaptcha } = useAuth();
  const [verificationId, setVerificationId] = useState<string | null>(null);
  const navigate = useNavigate();

  // Initialize recaptcha when page loads
  useEffect(() => {
    initializeRecaptcha();
  }, [initializeRecaptcha]);
  
  // Effect to handle redirection after auth state changes
  useEffect(() => {
    if (isLoading) return;
    
    if (currentUser) {
      // Handle user redirection based on profile completion state
      if (userProfile?.isProfileComplete) {
        navigate("/");
      } else if (!userProfile?.role) {
        navigate("/select-role");
      } else if (userProfile?.role === 'farmer') {
        navigate("/complete-farmer-profile");
      } else if (userProfile?.role === 'driver') {
        navigate("/complete-driver-profile");
      } else {
        // Fallback to home if something unexpected happens
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

  // Show OTP verification form if verificationId is set
  if (verificationId) {
    return (
      <UserContainer hideBottomNav>
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col justify-center">
          <OtpVerificationForm 
            verificationId={verificationId}
            onBackToPhone={() => setVerificationId(null)}
          />
        </div>
      </UserContainer>
    );
  }

  // Otherwise, show phone login form
  return (
    <UserContainer hideBottomNav>
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex flex-col justify-center">
        <PhoneLoginForm
          onSuccess={(verId) => setVerificationId(verId)}
        />
      </div>
    </UserContainer>
  );
};

export default AuthPage;
