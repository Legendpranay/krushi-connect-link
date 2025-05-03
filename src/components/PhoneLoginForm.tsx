
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

const PhoneLoginForm = ({ onSuccess }: { onSuccess: (verificationId: string) => void }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signInWithPhone } = useAuth();
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: 'Error',
        description: 'Please enter a valid phone number',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Format the phone number if needed
      const formattedPhone = phoneNumber.startsWith('+') 
        ? phoneNumber 
        : `+91${phoneNumber}`; // Default to India country code
      
      const result = await signInWithPhone(formattedPhone);
      
      if (result.success) {
        onSuccess(result.verificationId);
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send OTP. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        {t('auth.phoneLogin')}
      </h2>
      
      <p className="text-center text-muted-foreground mb-6">
        {t('auth.enterPhone')}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="phone" className="form-label">
            {t('auth.phoneNumber')}
          </label>
          <Input
            id="phone"
            type="tel"
            placeholder="9876543210"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
            className="w-full"
            disabled={isLoading}
            maxLength={10}
          />
        </div>
        
        <div id="recaptcha-container"></div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? t('common.loading') : t('auth.sendOtp')}
        </Button>
      </form>
    </div>
  );
};

export default PhoneLoginForm;
