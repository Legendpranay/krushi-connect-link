
import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Index = () => {
  const { currentUser, userProfile, isLoading } = useAuth();

  // Redirect logic based on auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in, redirect to auth page
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  // If logged in but needs to select role
  if (currentUser && userProfile && !userProfile.role) {
    return <Navigate to="/select-role" />;
  }

  // If logged in but profile is incomplete
  if (currentUser && userProfile?.role && userProfile.isProfileComplete === false) {
    if (userProfile.role === 'farmer') {
      return <Navigate to="/complete-farmer-profile" />;
    }
    if (userProfile.role === 'driver') {
      return <Navigate to="/complete-driver-profile" />;
    }
  }

  // If everything is set up, go to home
  return <Navigate to="/" />;
};

export default Index;
