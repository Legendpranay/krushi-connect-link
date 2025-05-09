
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import PersonalInfoSection from '../components/driver/PersonalInfoSection';
import { useLanguage } from '@/contexts/LanguageContext';

const DriverRegistrationPage = () => {
  const { userProfile, updateUserProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    village: userProfile?.village || '',
    district: userProfile?.district || '',
    state: userProfile?.state || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to complete your profile",
        variant: "destructive"
      });
      return;
    }

    // Validate form
    if (!formData.name || !formData.village || !formData.district || !formData.state) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Update user profile using the context method
      await updateUserProfile({
        name: formData.name,
        village: formData.village,
        district: formData.district,
        state: formData.state,
        role: 'driver',
        isProfileComplete: false // Mark as incomplete since this is just basic info
      });

      toast({
        description: "Basic details saved successfully! You can complete your profile later."
      });

      // Navigate to home
      navigate('/');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!userProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p>Please sign in to continue</p>
          <Button onClick={() => navigate('/auth')} className="mt-4">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold">Driver Registration</h1>
        <p className="text-gray-600 mt-2">Enter your basic information to get started</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
          <PersonalInfoSection 
            formData={formData} 
            handleChange={handleChange} 
            t={t} 
          />
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save & Continue'}
            </Button>
            <p className="text-sm text-center text-gray-600 mt-3">
              You can complete your full profile including your tractor details later.
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default DriverRegistrationPage;
