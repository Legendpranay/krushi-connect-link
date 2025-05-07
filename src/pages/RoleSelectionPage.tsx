
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RoleSelectionForm from '../components/RoleSelectionForm';
import UserContainer from '../components/UserContainer';

const RoleSelectionPage = () => {
  const { currentUser, userProfile } = useAuth();

  // If not logged in, redirect to auth page
  if (!currentUser) {
    return <Navigate to="/auth" />;
  }

  // If already has a role and profile is complete, redirect to home
  if (userProfile?.role && userProfile?.isProfileComplete) {
    return <Navigate to="/" />;
  }

  // If has role but profile is incomplete, redirect to the appropriate profile completion page
  if (userProfile?.role && !userProfile?.isProfileComplete) {
    if (userProfile.role === 'farmer') {
      return <Navigate to="/complete-farmer-profile" />;
    } else if (userProfile.role === 'driver') {
      return <Navigate to="/complete-driver-profile" />;
    }
  }

  return (
    <UserContainer hideBottomNav>
      <RoleSelectionForm />
    </UserContainer>
  );
};

export default RoleSelectionPage;
