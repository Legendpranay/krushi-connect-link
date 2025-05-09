
import React from 'react';
import { Button } from '@/components/ui/button';

interface ProfileFormSubmitButtonProps {
  isLoading: boolean;
}

const ProfileFormSubmitButton: React.FC<ProfileFormSubmitButtonProps> = ({ isLoading }) => {
  return (
    <Button 
      type="submit" 
      className="w-full mt-8" 
      disabled={isLoading}
    >
      {isLoading ? (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
          Saving...
        </div>
      ) : 'Save Profile'}
    </Button>
  );
};

export default ProfileFormSubmitButton;
