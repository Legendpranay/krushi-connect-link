
import React from 'react';
import { Input } from '@/components/ui/input';
import { UserProfile } from '../../types';

interface ProfileImageSectionProps {
  profileImage: File | null;
  setProfileImage: React.Dispatch<React.SetStateAction<File | null>>;
  userProfile: UserProfile | null;
  t: (key: string) => string;
}

const ProfileImageSection: React.FC<ProfileImageSectionProps> = ({ 
  profileImage, 
  setProfileImage, 
  userProfile, 
  t 
}) => {
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  return (
    <div className="form-input-group">
      <label htmlFor="profileImage" className="form-label">
        Upload Photo
      </label>
      <div className="mt-2">
        {profileImage ? (
          <div className="relative h-24 w-24 rounded-full overflow-hidden mx-auto">
            <img
              src={URL.createObjectURL(profileImage)}
              alt="Profile Preview"
              className="h-full w-full object-cover"
            />
          </div>
        ) : userProfile?.profileImage ? (
          <div className="relative h-24 w-24 rounded-full overflow-hidden mx-auto">
            <img
              src={userProfile.profileImage}
              alt="Current Profile"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto">
            <span className="text-gray-500 text-4xl">👤</span>
          </div>
        )}
        
        <Input
          id="profileImage"
          type="file"
          accept="image/*"
          onChange={handleProfileImageChange}
          className="mt-2"
        />
      </div>
    </div>
  );
};

export default ProfileImageSection;
