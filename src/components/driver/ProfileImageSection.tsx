
import React from 'react';
import { Input } from '@/components/ui/input';
import { UserProfile } from '../../types';

interface ProfileImageSectionProps {
  profileImage: File | null;
  setProfileImage: React.Dispatch<React.SetStateAction<File | null>>;
  userProfile: UserProfile | null;
  t: (key: string) => string;
}

const ProfileImageSection = ({ profileImage, setProfileImage, userProfile, t }: ProfileImageSectionProps) => {
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  return (
    <div className="form-group">
      <label className="block text-gray-700 mb-2">
        Profile Photo
      </label>
      <div className="flex flex-col items-center mb-4">
        {profileImage ? (
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
            <img 
              src={URL.createObjectURL(profileImage)} 
              alt="Profile preview" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : userProfile?.profileImage ? (
          <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
            <img 
              src={userProfile.profileImage} 
              alt="Current profile" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-32 h-32 bg-gray-200 rounded-full flex items-center justify-center mb-4">
            <span className="text-5xl text-gray-400">👤</span>
          </div>
        )}
        <Input 
          type="file"
          id="profileImage"
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
    </div>
  );
};

export default ProfileImageSection;
