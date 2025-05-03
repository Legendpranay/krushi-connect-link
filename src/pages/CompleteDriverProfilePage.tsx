
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DriverProfileForm from '../components/DriverProfileForm';
import UserContainer from '../components/UserContainer';

const CompleteDriverProfilePage = () => {
  const { currentUser, userProfile } = useAuth();

  // If not logged in, redirect to auth page
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  // If not a driver, redirect to role selection
  if (userProfile?.role !== 'driver') {
    return <Navigate to="/select-role" />;
  }

  // If profile is already complete, redirect to home
  if (userProfile?.isProfileComplete) {
    return <Navigate to="/" />;
  }

  return (
    <UserContainer hideBottomNav>
      <DriverProfileForm />
    </UserContainer>
  );
};

export default CompleteDriverProfilePage;
