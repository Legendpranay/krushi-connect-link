
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import PhoneLoginForm from '../components/PhoneLoginForm';
import OtpVerificationForm from '../components/OtpVerificationForm';
import UserContainer from '../components/UserContainer';

const AuthPage = () => {
  const { currentUser, userProfile } = useAuth();
  const [verificationId, setVerificationId] = useState<string | null>(null);

  // If user is logged in and profile is complete, redirect to home
  if (currentUser && userProfile?.isProfileComplete) {
    return <Navigate to="/" />;
  }

  // If user is logged in but needs to select role or complete profile
  if (currentUser && !userProfile?.role) {
    return <Navigate to="/select-role" />;
  }
  
  if (currentUser && !userProfile?.isProfileComplete && userProfile?.role === 'farmer') {
    return <Navigate to="/complete-farmer-profile" />;
  }
  
  if (currentUser && !userProfile?.isProfileComplete && userProfile?.role === 'driver') {
    return <Navigate to="/complete-driver-profile" />;
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
