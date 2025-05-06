
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { ArrowLeft } from 'lucide-react';

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
        // Auth context will handle user state and redirection
      } else {
        toast({
          title: 'Error',
          description: result.error || 'Invalid OTP. Please try again.',
          variant: 'destructive',
        });
        setOtp(''); // Reset OTP on error
      }
    } catch (error: any) {
      console.error(error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
      setOtp(''); // Reset OTP on error
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
    <div className="w-full max-w-md mx-auto p-4">
      <div className="mb-6 text-center">
        <img 
          src="/assets/logo.png" 
          alt="KrushiLink Logo" 
          className="mx-auto h-24 w-auto object-contain"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/placeholder.svg';
          }}
        />
      </div>
      
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-primary rounded-t-lg text-white">
          <Button 
            variant="ghost" 
            className="text-white hover:text-white/80 hover:bg-primary-600 p-0 h-8 w-8 absolute top-4 left-4"
            onClick={onBackToPhone}
          >
            <ArrowLeft size={20} />
          </Button>
          <CardTitle className="text-center">{t('auth.verifyOtp')}</CardTitle>
          <CardDescription className="text-center text-primary-100">
            {t('auth.enterOtp')}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="pt-6 pb-4">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="flex justify-center">
                <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                  <InputOTPGroup>
                    <InputOTPSlot index={0} />
                    <InputOTPSlot index={1} />
                    <InputOTPSlot index={2} />
                    <InputOTPSlot index={3} />
                    <InputOTPSlot index={4} />
                    <InputOTPSlot index={5} />
                  </InputOTPGroup>
                </InputOTP>
              </div>
              
              <p className="text-center text-sm text-muted-foreground">
                We've sent a 6-digit code to your phone
              </p>
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {t('common.loading')}
                </>
              ) : t('auth.verifyOtp')}
            </Button>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-1">
                {countdown > 0 ? (
                  `Resend code in ${countdown}s`
                ) : (
                  "Didn't receive the code?"
                )}
              </p>
              <Button
                type="button"
                variant="link"
                onClick={handleResendOtp}
                disabled={countdown > 0}
                className="text-sm p-0 h-auto"
              >
                {t('auth.resendOtp')}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default OtpVerificationForm;
