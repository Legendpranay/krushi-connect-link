
import React, { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import DriverProfileForm from '../components/driver/DriverProfileForm';
import UserContainer from '../components/UserContainer';
import { toast } from '@/components/ui/use-toast';

const CompleteDriverProfilePage = () => {
  const { currentUser, userProfile, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If profile is already complete, redirect to home with a message
    if (userProfile?.isProfileComplete) {
      toast({
        description: "Your profile is already complete!"
      });
      navigate('/');
    }
  }, [userProfile, navigate]);

  // Show loading while auth state is being determined
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
    return <Navigate to="/auth" replace />;
  }

  // If not a driver, redirect to role selection
  if (userProfile?.role !== 'driver') {
    return <Navigate to="/select-role" replace />;
  }

  return (
    <UserContainer hideBottomNav>
      <DriverProfileForm />
    </UserContainer>
  );
};

export default CompleteDriverProfilePage;
