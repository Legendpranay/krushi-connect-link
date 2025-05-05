
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Upload, User } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const EditProfilePage = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [name, setName] = useState(userProfile?.name || '');
  const [village, setVillage] = useState(userProfile?.village || '');
  const [bio, setBio] = useState(userProfile?.bio || '');
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(userProfile?.profileImage || null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // For demo purposes, we're just simulating the update
      // In a real app, you would handle file upload and update the user profile
      // through Firebase or your backend
      
      await updateUserProfile({
        name,
        village,
        bio,
        // The profileImage URL would typically come from uploading the file
        // and getting back a URL, but we're simulating it here
        ...(imagePreview && !imagePreview.includes(userProfile?.profileImage || '') ? 
          { profileImage: imagePreview } : {})
      });

      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
      });
      
      navigate('/profile');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update Failed',
        description: 'Failed to update your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <UserContainer>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/profile')} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">{t('profile.editProfile')}</h2>
        </div>
        
        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Profile Image */}
              <div className="flex flex-col items-center">
                <div className="relative mb-4">
                  {imagePreview ? (
                    <div className="h-24 w-24 rounded-full overflow-hidden">
                      <img
                        src={imagePreview}
                        alt="Profile"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-24 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-12 w-12 text-gray-500" />
                    </div>
                  )}
                  
                  <label htmlFor="profile-image" className="absolute -bottom-2 -right-2 bg-primary text-white p-2 rounded-full cursor-pointer">
                    <Upload className="h-4 w-4" />
                  </label>
                  
                  <input
                    id="profile-image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Click the button to change your profile picture
                </p>
              </div>
              
              {/* Name */}
              <div className="space-y-2">
                <label htmlFor="name" className="block text-sm font-medium">
                  Name
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full name"
                  disabled={isLoading}
                />
              </div>
              
              {/* Village */}
              <div className="space-y-2">
                <label htmlFor="village" className="block text-sm font-medium">
                  Village
                </label>
                <Input
                  id="village"
                  value={village}
                  onChange={(e) => setVillage(e.target.value)}
                  placeholder="Your village or town"
                  disabled={isLoading}
                />
              </div>
              
              {/* Bio */}
              <div className="space-y-2">
                <label htmlFor="bio" className="block text-sm font-medium">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Tell us about yourself"
                  rows={4}
                  disabled={isLoading}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Updating...' : 'Update Profile'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </UserContainer>
  );
};

export default EditProfilePage;
