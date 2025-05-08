
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '../types';

const RoleSelectionForm = () => {
  const { updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  const handleSelectRole = async (role: UserRole) => {
    setIsLoading(true);
    
    try {
      await updateUserProfile({ 
        role,
        // Setting isProfileComplete to false as they need to complete their profile
        isProfileComplete: false 
      });
      
      // Redirect to complete profile page based on role
      if (role === 'farmer') {
        toast({
          description: 'Role selected. Please complete your profile.',
        });
        setTimeout(() => {
          navigate('/complete-farmer-profile');
        }, 1000);
      } else if (role === 'driver') {
        toast({
          description: 'Role selected. Please complete your profile.',
        });
        setTimeout(() => {
          navigate('/complete-driver-profile');
        }, 1000);
      } else if (role === 'admin') {
        // Admins don't have a profile completion form, they go straight to the admin dashboard
        await updateUserProfile({
          isProfileComplete: true
        });
        toast({
          description: 'Admin role selected. Redirecting to dashboard.',
        });
        setTimeout(() => {
          navigate('/admin');
        }, 1000);
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to set user role. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        Select Your Role
      </h2>
      
      <div className="space-y-4">
        <Button
          onClick={() => handleSelectRole('farmer')}
          className="w-full h-16 text-lg justify-start px-6"
          disabled={isLoading}
        >
          <span className="flex items-center">
            <span className="text-2xl mr-4">👨‍🌾</span>
            <span>Farmer</span>
          </span>
        </Button>
        
        <Button
          onClick={() => handleSelectRole('driver')}
          className="w-full h-16 text-lg justify-start px-6"
          disabled={isLoading}
          variant="outline"
        >
          <span className="flex items-center">
            <span className="text-2xl mr-4">🚜</span>
            <span>Driver</span>
          </span>
        </Button>

        <Button
          onClick={() => handleSelectRole('admin')}
          className="w-full h-16 text-lg justify-start px-6"
          disabled={isLoading}
          variant="secondary"
        >
          <span className="flex items-center">
            <span className="text-2xl mr-4">👨‍💼</span>
            <span>Admin</span>
          </span>
        </Button>
      </div>
    </div>
  );
};

export default RoleSelectionForm;
