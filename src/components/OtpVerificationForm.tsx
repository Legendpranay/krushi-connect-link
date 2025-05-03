
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';

interface OtpVerificationFormProps {
  verificationId: string;
  onBackToPhone: () => void;
}

const OtpVerificationForm = ({ verificationId, onBackToPhone }: OtpVerificationFormProps) => {
  const [otp, setOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const { confirmOtp } = useAuth();
  const { t } = useLanguage();

  // Countdown for resend OTP
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 6-digit OTP',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await confirmOtp(verificationId, otp);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'Login successful!',
        });
        // Auth context will handle user state
      } else {
        toast({
          title: 'Error',
          description: 'Invalid OTP. Please try again.',
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

  const handleResendOtp = () => {
    onBackToPhone();
    toast({
      description: 'You can now request a new OTP',
    });
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold text-center mb-6">
        {t('auth.verifyOtp')}
      </h2>
      
      <p className="text-center text-muted-foreground mb-6">
        {t('auth.enterOtp')}
      </p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder="123456"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').substring(0, 6))}
            className="text-center text-xl tracking-widest"
            disabled={isLoading}
            maxLength={6}
          />
        </div>
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
          {isLoading ? t('common.loading') : t('auth.verifyOtp')}
        </Button>
        
        <div className="text-center mt-4">
          <Button
            type="button"
            variant="ghost"
            onClick={handleResendOtp}
            disabled={countdown > 0}
            className="text-sm"
          >
            {countdown > 0 
              ? `${t('auth.resendOtp')} (${countdown}s)` 
              : t('auth.resendOtp')}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default OtpVerificationForm;
