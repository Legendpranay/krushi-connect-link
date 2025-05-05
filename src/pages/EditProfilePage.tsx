
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/components/ui/use-toast';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

const EditProfilePage = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [name, setName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [village, setVillage] = useState(userProfile?.village || '');
  const [district, setDistrict] = useState(userProfile?.district || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setName(userProfile.name || '');
      setPhone(userProfile.phone || '');
      setVillage(userProfile.village || '');
      setDistrict(userProfile.district || '');
    }
  }, [userProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.id) {
      toast({
        title: 'Error',
        description: 'User profile not found',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setLoading(true);
      const userDocRef = doc(db, 'users', userProfile.id);
      await updateDoc(userDocRef, {
        name,
        phone,
        village,
        district,
        updatedAt: new Date()
      });
      
      toast({
        description: 'Profile updated successfully',
      });
      
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <UserContainer>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">{t('profile.editProfile')}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              {t('common.name')}*
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="phone" className="block text-sm font-medium mb-1">
              {t('common.phone')}*
            </label>
            <Input
              id="phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="village" className="block text-sm font-medium mb-1">
              {t('common.village')}*
            </label>
            <Input
              id="village"
              value={village}
              onChange={(e) => setVillage(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label htmlFor="district" className="block text-sm font-medium mb-1">
              {t('common.district')}*
            </label>
            <Input
              id="district"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              required
            />
          </div>
          
          <div className="pt-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? t('common.saving') : t('common.save')}
            </Button>
          </div>
        </form>
      </div>
    </UserContainer>
  );
};

export default EditProfilePage;
