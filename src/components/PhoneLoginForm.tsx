
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Phone } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";

const PhoneLoginForm = ({ onSuccess }: { onSuccess: (verificationId: string) => void }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [billingError, setBillingError] = useState(false);
  const { signInWithPhone, initializeRecaptcha } = useAuth();
  const { t } = useLanguage();

  useEffect(() => {
    // Initialize recaptcha when component mounts
    initializeRecaptcha();
  }, [initializeRecaptcha]);
  
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber || phoneNumber.length < 10) {
      toast({
        title: 'Error',
        description: 'Please enter a valid 10-digit phone number',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setBillingError(false);
    
    try {
      const result = await signInWithPhone(phoneNumber);
      
      if (result.success) {
        toast({
          title: 'Success',
          description: 'OTP sent successfully. Please check your phone.',
        });
        onSuccess(result.verificationId);
      } else {
        // Check if it's a billing error
        if (result.billingError) {
          setBillingError(true);
        }
        
        toast({
          title: 'Error',
          description: result.error || 'Failed to send OTP. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Phone auth error:', error);
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
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
        <h2 className="text-2xl font-bold mt-4">
          Welcome to KrushiLink
        </h2>
        <p className="text-muted-foreground mt-2">
          Connecting farmers with equipment drivers
        </p>
      </div>
      
      {billingError && (
        <Alert variant="destructive" className="mb-4">
          <Info className="h-4 w-4" />
          <AlertTitle>Firebase Billing Required</AlertTitle>
          <AlertDescription>
            Phone authentication requires Firebase billing to be enabled. Please contact the app administrator.
          </AlertDescription>
        </Alert>
      )}
      
      <Card className="border-none shadow-lg">
        <CardHeader className="bg-primary rounded-t-lg text-white">
          <CardTitle>Sign In with Phone</CardTitle>
          <CardDescription className="text-primary-100">
            Enter your phone number to continue
          </CardDescription>
        </CardHeader>
        
        <CardContent className="p-6">
          <form onSubmit={handlePhoneSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                {t('auth.phoneNumber')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                </div>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9876543210"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
                  className="pl-10"
                  disabled={isLoading}
                  maxLength={10}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                We'll send a verification code to this number
              </p>
            </div>
            
            {/* Hidden div for invisible recaptcha - kept but will be invisible */}
            <div id="invisible-recaptcha" className="invisible"></div>
            
            <Button 
              type="submit" 
              className="w-full bg-primary hover:bg-primary-600" 
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
              ) : t('auth.sendOtp')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PhoneLoginForm;
