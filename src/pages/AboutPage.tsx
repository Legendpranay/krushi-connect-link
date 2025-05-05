
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  return (
    <UserContainer>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/more')} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">{t('profile.about')}</h2>
        </div>
        
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              <div className="h-24 w-24 bg-primary/10 rounded-full flex items-center justify-center">
                <Info className="h-12 w-12 text-primary" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-center mb-2">KrushiLink</h3>
            <p className="text-center text-muted-foreground mb-6">Version 1.0.0</p>
            
            <div className="space-y-4">
              <p>
                KrushiLink is a platform designed to connect farmers with tractor and agricultural 
                machinery service providers. Our mission is to make farming easier and more efficient 
                by providing access to affordable machinery services.
              </p>
              
              <p>
                Through our app, farmers can easily find and book nearby tractor services, while 
                service providers can manage their bookings and earnings efficiently.
              </p>
              
              <h4 className="text-lg font-medium mt-6 mb-2">Our Vision</h4>
              <p>
                To transform agriculture by enabling every farmer to access modern machinery services 
                through a transparent, reliable, and user-friendly platform.
              </p>
              
              <h4 className="text-lg font-medium mt-6 mb-2">Key Features</h4>
              <ul className="list-disc pl-5 space-y-1">
                <li>Location-based service discovery</li>
                <li>Transparent pricing</li>
                <li>Secure payment system</li>
                <li>Service provider ratings and reviews</li>
                <li>Booking management</li>
                <li>Multilingual support</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </UserContainer>
  );
};

export default AboutPage;
