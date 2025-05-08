
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '../../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Equipment } from '../../types';
import PersonalInfoSection from './PersonalInfoSection';
import ProfileImageSection from './ProfileImageSection';
import TractorDetailsSection from './TractorDetailsSection';
import EquipmentSection from './EquipmentSection';

const DriverProfileForm = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    name: userProfile?.name || '',
    village: userProfile?.village || '',
    district: userProfile?.district || '',
    state: userProfile?.state || '',
    tractorType: '',
  });
  
  const [profileImage, setProfileImage] = React.useState<File | null>(null);
  const [tractorImage, setTractorImage] = React.useState<File | null>(null);
  const [licenseImage, setLicenseImage] = React.useState<File | null>(null);
  const [equipment, setEquipment] = React.useState<Equipment[]>([
    { id: '1', name: '', pricePerAcre: 0 }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Prevent multiple submissions
    if (isLoading) return;
    
    setIsLoading(true);
    console.log('Form submission started');
    
    try {
      // Validate form
      if (!formData.name || !formData.village || !formData.tractorType) {
        toast({
          title: 'Error',
          description: 'Please fill in all required fields',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Validate equipment
      const isEquipmentValid = equipment.every(item => item.name && item.pricePerAcre > 0);
      if (!isEquipmentValid) {
        toast({
          title: 'Error',
          description: 'Please fill in all equipment details',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      // Validate required images
      if (!tractorImage && !userProfile?.tractorImage) {
        toast({
          title: 'Error',
          description: 'Please upload a tractor image',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      if (!licenseImage && !userProfile?.licenseImage) {
        toast({
          title: 'Error',
          description: 'Please upload a license image',
          variant: 'destructive',
        });
        setIsLoading(false);
        return;
      }

      console.log('Starting profile image upload process');
      // Upload images
      let profileImageUrl = userProfile?.profileImage || '';
      let tractorImageUrl = userProfile?.tractorImage || '';
      let licenseImageUrl = userProfile?.licenseImage || '';
      
      if (profileImage) {
        const imageRef = ref(storage, `profile-images/${userProfile?.id}/${Date.now()}`);
        await uploadBytes(imageRef, profileImage);
        profileImageUrl = await getDownloadURL(imageRef);
        console.log('Profile image uploaded:', profileImageUrl);
      }
      
      console.log('Starting tractor image upload process');
      if (tractorImage) {
        const imageRef = ref(storage, `tractor-images/${userProfile?.id}/${Date.now()}`);
        await uploadBytes(imageRef, tractorImage);
        tractorImageUrl = await getDownloadURL(imageRef);
        console.log('Tractor image uploaded:', tractorImageUrl);
      }
      
      console.log('Starting license image upload process');
      if (licenseImage) {
        const imageRef = ref(storage, `license-images/${userProfile?.id}/${Date.now()}`);
        await uploadBytes(imageRef, licenseImage);
        licenseImageUrl = await getDownloadURL(imageRef);
        console.log('License image uploaded:', licenseImageUrl);
      }
      
      console.log('Starting equipment saving process');
      // Save equipment to Firestore
      const savedEquipment: Equipment[] = [];
      for (const item of equipment) {
        // Skip empty equipment
        if (!item.name || item.pricePerAcre <= 0) continue;
        
        console.log('Saving equipment item:', item);
        try {
          const equipmentRef = await addDoc(collection(db, 'equipment'), {
            name: item.name,
            pricePerAcre: item.pricePerAcre,
            pricePerHour: item.pricePerHour || null,
            driverId: userProfile?.id,
            createdAt: new Date()
          });
          
          savedEquipment.push({
            id: equipmentRef.id,
            name: item.name,
            pricePerAcre: item.pricePerAcre,
            pricePerHour: item.pricePerHour
          });
          console.log('Equipment saved successfully:', equipmentRef.id);
        } catch (equipError) {
          console.error('Error saving equipment item:', equipError);
          // Continue with other equipment items even if one fails
        }
      }
      
      console.log('Updating user profile');
      // Update user profile with all collected data
      const profileData = {
        ...formData,
        profileImage: profileImageUrl,
        tractorImage: tractorImageUrl,
        licenseImage: licenseImageUrl,
        isProfileComplete: true,
        role: 'driver' as const,
        isActive: false, // Start as offline
        equipment: savedEquipment
      };
      
      console.log('Sending profile update with data:', profileData);
      
      // Update user profile with better error handling
      try {
        await updateUserProfile(profileData);
        
        console.log('Profile update successful');
        toast({
          description: 'Profile updated successfully. Waiting for admin verification.',
        });
        
        // Redirect to home page after a short delay
        setTimeout(() => {
          console.log('Redirecting to home page now');
          navigate('/');
        }, 3000);
      } catch (updateError) {
        console.error('Error in updateUserProfile:', updateError);
        throw updateError; // Re-throw to be caught by the outer catch
      }
      
    } catch (error) {
      console.error('Error updating driver profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      // Always reset loading state, even if there was an error
      console.log('Resetting loading state');
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        Complete Your Profile
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold">My Profile</h3>
        
        <PersonalInfoSection 
          formData={formData} 
          handleChange={handleChange} 
          t={(key) => key.split('.').pop() || key} 
        />
        
        <ProfileImageSection 
          profileImage={profileImage} 
          setProfileImage={setProfileImage} 
          userProfile={userProfile}
          t={(key) => key.split('.').pop() || key}
        />
        
        <TractorDetailsSection 
          formData={formData}
          handleChange={handleChange}
          tractorImage={tractorImage}
          setTractorImage={setTractorImage}
          licenseImage={licenseImage}
          setLicenseImage={setLicenseImage}
          t={(key) => key.split('.').pop() || key}
        />
        
        <EquipmentSection 
          equipment={equipment}
          setEquipment={setEquipment}
          t={(key) => key.split('.').pop() || key}
        />
        
        <Button 
          type="submit" 
          className="w-full mt-8" 
          disabled={isLoading}
        >
          {isLoading ? 'Saving...' : 'Save Profile'}
        </Button>
      </form>
    </div>
  );
};

export default DriverProfileForm;
