
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
