import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '../lib/firebase';
import { collection, addDoc } from 'firebase/firestore';
import { Equipment } from '../types';

const DriverProfileForm = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    village: userProfile?.village || '',
    district: userProfile?.district || '',
    state: userProfile?.state || '',
    tractorType: '',
  });
  
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [tractorImage, setTractorImage] = useState<File | null>(null);
  const [licenseImage, setLicenseImage] = useState<File | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([
    { id: '1', name: '', pricePerAcre: 0 }
  ]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProfileImage(e.target.files[0]);
    }
  };

  const handleTractorImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setTractorImage(e.target.files[0]);
    }
  };

  const handleLicenseImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setLicenseImage(e.target.files[0]);
    }
  };

  const handleEquipmentChange = (index: number, field: keyof Equipment, value: string | number) => {
    const updatedEquipment = [...equipment];
    updatedEquipment[index] = {
      ...updatedEquipment[index],
      [field]: field === 'pricePerAcre' || field === 'pricePerHour' 
        ? parseFloat(value as string) || 0 
        : value
    };
    setEquipment(updatedEquipment);
  };

  const addEquipmentField = () => {
    setEquipment([
      ...equipment,
      { id: `${equipment.length + 1}`, name: '', pricePerAcre: 0 }
    ]);
  };

  const removeEquipmentField = (index: number) => {
    if (equipment.length > 1) {
      setEquipment(equipment.filter((_, i) => i !== index));
    }
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
              onChange={handleProfileImageChange}
              className="mt-2"
            />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mt-8">{t('driver.tractorDetails')}</h3>
        
        {/* Tractor Type */}
        <div className="form-input-group">
          <label htmlFor="tractorType" className="form-label">
            {t('driver.tractorType')}*
          </label>
          <Input
            id="tractorType"
            name="tractorType"
            value={formData.tractorType}
            onChange={handleChange}
            required
          />
        </div>
        
        {/* Tractor Image */}
        <div className="form-input-group">
          <label htmlFor="tractorImage" className="form-label">
            {t('driver.tractorPhoto')}*
          </label>
          <div className="mt-2">
            {tractorImage && (
              <div className="relative h-36 w-full rounded overflow-hidden">
                <img
                  src={URL.createObjectURL(tractorImage)}
                  alt="Tractor Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            
            <Input
              id="tractorImage"
              type="file"
              accept="image/*"
              onChange={handleTractorImageChange}
              className="mt-2"
              required
            />
          </div>
        </div>
        
        {/* License Image */}
        <div className="form-input-group">
          <label htmlFor="licenseImage" className="form-label">
            {t('driver.drivingLicense')}*
          </label>
          <div className="mt-2">
            {licenseImage && (
              <div className="relative h-36 w-full rounded overflow-hidden">
                <img
                  src={URL.createObjectURL(licenseImage)}
                  alt="License Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            
            <Input
              id="licenseImage"
              type="file"
              accept="image/*"
              onChange={handleLicenseImageChange}
              className="mt-2"
              required
            />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mt-8">{t('driver.myServices')}</h3>
        
        {/* Equipment List */}
        {equipment.map((item, index) => (
          <div key={index} className="p-4 border rounded-md">
            <div className="form-input-group">
              <label htmlFor={`equipment-name-${index}`} className="form-label">
                {t('driver.equipmentName')}*
              </label>
              <Input
                id={`equipment-name-${index}`}
                value={item.name}
                onChange={(e) => handleEquipmentChange(index, 'name', e.target.value)}
                required
              />
            </div>
            
            <div className="form-input-group">
              <label htmlFor={`equipment-price-${index}`} className="form-label">
                {t('driver.pricePerAcre')}*
              </label>
              <Input
                id={`equipment-price-${index}`}
                type="number"
                min="0"
                step="10"
                value={item.pricePerAcre}
                onChange={(e) => handleEquipmentChange(index, 'pricePerAcre', e.target.value)}
                required
              />
            </div>
            
            <div className="form-input-group">
              <label htmlFor={`equipment-hour-price-${index}`} className="form-label">
                {t('driver.pricePerHour')} ({t('common.optional')})
              </label>
              <Input
                id={`equipment-hour-price-${index}`}
                type="number"
                min="0"
                step="10"
                value={item.pricePerHour || ''}
                onChange={(e) => handleEquipmentChange(index, 'pricePerHour', e.target.value)}
              />
            </div>
            
            {equipment.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={() => removeEquipmentField(index)}
                className="mt-2"
              >
                Remove
              </Button>
            )}
          </div>
        ))}
        
        <Button
          type="button"
          variant="outline"
          onClick={addEquipmentField}
          className="w-full"
        >
          + {t('driver.addEquipment')}
        </Button>
        
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
