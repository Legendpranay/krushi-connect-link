
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Equipment } from '../../types';
import PersonalInfoSection from './PersonalInfoSection';
import ProfileImageSection from './ProfileImageSection';
import TractorDetailsSection from './TractorDetailsSection';
import EquipmentSection from './EquipmentSection';
import { useDriverProfileSubmit } from '../../hooks/useDriverProfileSubmit';
import ProfileFormSubmitButton from './ProfileFormSubmitButton';

const DriverProfileForm = () => {
  const { userProfile } = useAuth();
  const { isLoading, handleSubmit } = useDriverProfileSubmit();
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    village: userProfile?.village || '',
    district: userProfile?.district || '',
    state: userProfile?.state || '',
    tractorType: userProfile?.tractorType || '',
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [tractorImage, setTractorImage] = useState<File | null>(null);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: '1', name: '', pricePerAcre: 0 }
  ]);

  // Pre-populate equipment if it exists
  useEffect(() => {
    if (userProfile?.equipment && userProfile.equipment.length > 0) {
      setEquipment(userProfile.equipment);
    }
  }, [userProfile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(formData, profileImage, tractorImage, licenseImage, equipment);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">
        Complete Your Profile
      </h2>
      
      <form onSubmit={onSubmit} className="space-y-4">
        <h3 className="text-lg font-semibold">My Profile</h3>
        
        <PersonalInfoSection 
          formData={formData} 
          handleChange={handleChange} 
          t={(key) => key} 
        />
        
        <ProfileImageSection 
          profileImage={profileImage} 
          setProfileImage={setProfileImage} 
          userProfile={userProfile}
          t={(key) => key}
        />
        
        <TractorDetailsSection 
          formData={formData}
          handleChange={handleChange}
          tractorImage={tractorImage}
          setTractorImage={setTractorImage}
          licenseImage={licenseImage}
          setLicenseImage={setLicenseImage}
          t={(key) => key}
        />
        
        <EquipmentSection 
          equipment={equipment}
          setEquipment={setEquipment}
          t={(key) => key}
        />
        
        <ProfileFormSubmitButton isLoading={isLoading} />
      </form>
    </div>
  );
};

export default DriverProfileForm;
