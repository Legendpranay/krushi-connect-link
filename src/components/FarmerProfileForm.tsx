
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';

const FarmerProfileForm = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    village: userProfile?.village || '',
    district: userProfile?.district || '',
    state: userProfile?.state || '',
    farmSize: 0,
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      let profileImageUrl = userProfile?.profileImage || '';
      
      // Upload profile image if selected
      if (profileImage) {
        const imageRef = ref(storage, `profile-images/${userProfile?.id}/${Date.now()}`);
        await uploadBytes(imageRef, profileImage);
        profileImageUrl = await getDownloadURL(imageRef);
      }
      
      // Update user profile
      await updateUserProfile({
        ...formData,
        profileImage: profileImageUrl,
        isProfileComplete: true,
      });
      
      toast({
        description: 'Profile updated successfully',
      });
      
      // Redirect to home page
      navigate('/');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        {t('auth.completeProfile')}
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="form-input-group">
          <label htmlFor="name" className="form-label">
            {t('profile.name')}*
          </label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Village */}
        <div className="form-input-group">
          <label htmlFor="village" className="form-label">
            {t('profile.village')}*
          </label>
          <Input
            id="village"
            name="village"
            value={formData.village}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* District */}
        <div className="form-input-group">
          <label htmlFor="district" className="form-label">
            {t('profile.district')}*
          </label>
          <Input
            id="district"
            name="district"
            value={formData.district}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* State */}
        <div className="form-input-group">
          <label htmlFor="state" className="form-label">
            {t('profile.state')}*
          </label>
          <Input
            id="state"
            name="state"
            value={formData.state}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Farm Size */}
        <div className="form-input-group">
          <label htmlFor="farmSize" className="form-label">
            {t('booking.acreage')} (in acres)
          </label>
          <Input
            id="farmSize"
            name="farmSize"
            type="number"
            min="0"
            step="0.5"
            value={formData.farmSize}
            onChange={handleChange}
          />
        </div>
        
        {/* Profile Image */}
        <div className="form-input-group">
          <label htmlFor="profileImage" className="form-label">
            {t('driver.uploadPhoto')}
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
              onChange={handleImageChange}
              className="mt-2"
            />
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full mt-6" 
          disabled={isLoading}
        >
          {isLoading ? t('common.loading') : t('common.save')}
        </Button>
      </form>
    </div>
  );
};

export default FarmerProfileForm;
