
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
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
  const { t } = useLanguage();
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
    setIsLoading(true);
    
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

      // Upload images
      let profileImageUrl = userProfile?.profileImage || '';
      let tractorImageUrl = '';
      let licenseImageUrl = '';
      
      if (profileImage) {
        const imageRef = ref(storage, `profile-images/${userProfile?.id}/${Date.now()}`);
        await uploadBytes(imageRef, profileImage);
        profileImageUrl = await getDownloadURL(imageRef);
      }
      
      if (tractorImage) {
        const imageRef = ref(storage, `tractor-images/${userProfile?.id}/${Date.now()}`);
        await uploadBytes(imageRef, tractorImage);
        tractorImageUrl = await getDownloadURL(imageRef);
      }
      
      if (licenseImage) {
        const imageRef = ref(storage, `license-images/${userProfile?.id}/${Date.now()}`);
        await uploadBytes(imageRef, licenseImage);
        licenseImageUrl = await getDownloadURL(imageRef);
      }
      
      // Save equipment to Firestore
      const savedEquipment: Equipment[] = [];
      for (const item of equipment) {
        // Skip empty equipment
        if (!item.name || item.pricePerAcre <= 0) continue;
        
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
      }
      
      // Update user profile
      await updateUserProfile({
        ...formData,
        profileImage: profileImageUrl,
        tractorImage: tractorImageUrl,
        licenseImage: licenseImageUrl,
        isProfileComplete: true,
        role: 'driver' as const
      });
      
      toast({
        description: 'Profile updated successfully. Waiting for admin verification.',
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
        <h3 className="text-lg font-semibold">{t('profile.myProfile')}</h3>
        
        <PersonalInfoSection 
          formData={formData} 
          handleChange={handleChange} 
          t={t} 
        />
        
        <ProfileImageSection 
          profileImage={profileImage} 
          setProfileImage={setProfileImage} 
          userProfile={userProfile} 
          t={t} 
        />
        
        <TractorDetailsSection 
          formData={formData}
          handleChange={handleChange}
          tractorImage={tractorImage}
          setTractorImage={setTractorImage}
          licenseImage={licenseImage}
          setLicenseImage={setLicenseImage}
          t={t}
        />
        
        <EquipmentSection 
          equipment={equipment}
          setEquipment={setEquipment}
          t={t}
        />
        
        <Button 
          type="submit" 
          className="w-full mt-8" 
          disabled={isLoading}
        >
          {isLoading ? t('common.loading') : t('common.save')}
        </Button>
      </form>
    </div>
  );
};

export default DriverProfileForm;
