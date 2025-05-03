
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import FarmerProfileForm from '../components/FarmerProfileForm';
import UserContainer from '../components/UserContainer';

const CompleteFarmerProfilePage = () => {
  const { currentUser, userProfile } = useAuth();

  // If not logged in, redirect to auth page
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  // If not a farmer, redirect to role selection
  if (userProfile?.role !== 'farmer') {
    return <Navigate to="/select-role" />;
  }

  // If profile is already complete, redirect to home
  if (userProfile?.isProfileComplete) {
    return <Navigate to="/" />;
  }

  return (
    <UserContainer hideBottomNav>
      <FarmerProfileForm />
    </UserContainer>
  );
};

export default CompleteFarmerProfilePage;
