import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../lib/firebase';
import LeafletMap from './map/LeafletMap';
import { GeoPoint } from '../types';

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
    farmSize: userProfile?.farmSize || 0,
  });
  
  const [selectedLocation, setSelectedLocation] = useState<GeoPoint | null>(
    userProfile?.farmLocation || null
  );
  
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

  const handleLocationSelect = (location: GeoPoint) => {
    console.log("Location selected:", location);
    setSelectedLocation(location);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) {
      console.log("Form submission prevented - already loading");
      return;
    }
    
    setIsLoading(true);
    console.log('Farmer profile form submission started');
    
    try {
      // Validate form data
      if (!formData.name.trim()) {
        toast({
          title: 'Error',
          description: 'Please enter your name',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!formData.village.trim() || !formData.district.trim() || !formData.state.trim()) {
        toast({
          title: 'Error',
          description: 'Please fill in all location fields',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      let profileImageUrl = userProfile?.profileImage || '';
      
      // Upload profile image if selected
      if (profileImage) {
        console.log('Uploading profile image');
        try {
          const imageRef = ref(storage, `profile-images/${userProfile?.id}/${Date.now()}`);
          await uploadBytes(imageRef, profileImage);
          profileImageUrl = await getDownloadURL(imageRef);
          console.log('Profile image uploaded successfully:', profileImageUrl);
        } catch (imageError) {
          console.error('Error uploading profile image:', imageError);
          toast({
            title: 'Warning',
            description: 'Failed to upload profile image, but continuing with other data',
            variant: 'destructive',
          });
        }
      }
      
      // Prepare the data to update
      const updateData = {
        ...formData,
        profileImage: profileImageUrl,
        isProfileComplete: true,
        role: 'farmer' as const,
        farmLocation: selectedLocation || undefined
      };
      
      console.log('Updating user profile with data:', updateData);
      
      // Update user profile
      await updateUserProfile(updateData);
      
      toast({
        description: 'Profile updated successfully',
      });
      
      console.log('Profile saved successfully');
      
      // Important: Reset loading state before navigation
      setIsLoading(false);
      
      // Navigate to home page immediately after successful update
      navigate('/', { replace: true });
      
    } catch (error) {
      console.error('Error updating farmer profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        Complete Your Profile
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="form-input-group">
          <label htmlFor="name" className="form-label">
            Full Name*
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
            Village*
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
            District*
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
            State*
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
            Farm Size (in acres)
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
        
        {/* Farm Location Map */}
        <div className="form-input-group">
          <label className="form-label mb-2">
            Select your farm location on the map
          </label>
          <div className="h-[300px] border rounded-md overflow-hidden">
            <LeafletMap
              center={selectedLocation || {latitude: 20.5937, longitude: 78.9629}} // Default to center of India
              zoom={selectedLocation ? 13 : 5}
              onMapClick={handleLocationSelect}
              markers={selectedLocation ? [
                {
                  position: selectedLocation,
                  popup: "Your Farm Location"
                }
              ] : []}
            />
          </div>
          {selectedLocation && (
            <p className="text-sm mt-1 text-green-600">
              Location selected at lat: {selectedLocation.latitude.toFixed(6)}, lng: {selectedLocation.longitude.toFixed(6)}
            </p>
          )}
        </div>
        
        {/* Profile Image */}
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
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
              Saving...
            </div>
          ) : 'Save Profile'}
        </Button>
      </form>
    </div>
  );
};

export default FarmerProfileForm;
