
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { UserRole } from '../types';

const RoleSelectionForm = () => {
  const { updateUserProfile } = useAuth();
  const { t } = useLanguage();
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
        navigate('/complete-farmer-profile');
      } else if (role === 'driver') {
        navigate('/complete-driver-profile');
      } else if (role === 'admin') {
        // Admins don't have a profile completion form, they go straight to the admin dashboard
        await updateUserProfile({
          isProfileComplete: true
        });
        navigate('/admin');
      }
      
      toast({
        description: 'Role selected successfully',
      });
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
        {t('auth.selectRole')}
      </h2>
      
      <div className="space-y-4">
        <Button
          onClick={() => handleSelectRole('farmer')}
          className="w-full h-16 text-lg justify-start px-6"
          disabled={isLoading}
        >
          <span className="flex items-center">
            <span className="text-2xl mr-4">👨‍🌾</span>
            <span>{t('auth.farmer')}</span>
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
            <span>{t('auth.driver')}</span>
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
