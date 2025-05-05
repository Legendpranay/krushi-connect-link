
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Info, Tractor, Users, Calendar, MapPin, Globe, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AboutPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const features = [
    { 
      icon: MapPin, 
      title: "Location-based Service", 
      description: "Find nearby tractor services based on your location" 
    },
    { 
      icon: Users, 
      title: "Verified Providers", 
      description: "All service providers are verified for quality" 
    },
    { 
      icon: Calendar, 
      title: "Easy Booking", 
      description: "Book services with just a few taps" 
    },
    { 
      icon: Phone, 
      title: "Direct Communication", 
      description: "Connect directly with service providers" 
    }
  ];

  return (
    <UserContainer>
      <div className="p-4">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate('/more')} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">{t('profile.about')}</h2>
        </div>
        
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex justify-center mb-6">
              <div className="h-28 w-28 bg-primary/10 rounded-full flex items-center justify-center">
                <Tractor className="h-14 w-14 text-primary" />
              </div>
            </div>
            
            <h3 className="text-2xl font-bold text-center mb-2">KrushiLink</h3>
            <p className="text-center text-muted-foreground mb-8">Version 1.0.0</p>
            
            <div className="space-y-6">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                <p className="text-center font-medium text-lg">
                  Connecting farmers with agricultural machinery services
                </p>
              </div>
              
              <p>
                KrushiLink is a platform designed to connect farmers with tractor and agricultural 
                machinery service providers. Our mission is to make farming easier and more efficient 
                by providing access to affordable machinery services.
              </p>
              
              <p>
                Through our app, farmers can easily find and book nearby tractor services, while 
                service providers can manage their bookings and earnings efficiently.
              </p>
              
              <h4 className="text-xl font-medium mt-8 mb-4">Our Vision</h4>
              <div className="bg-gradient-to-r from-primary/20 to-accent/20 p-4 rounded-lg">
                <p className="italic">
                  "To transform agriculture by enabling every farmer to access modern machinery services 
                  through a transparent, reliable, and user-friendly platform."
                </p>
              </div>
              
              <h4 className="text-xl font-medium mt-8 mb-4">Key Features</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {features.map((feature, index) => (
                  <Card key={index} className="bg-gray-50">
                    <CardContent className="p-4 flex">
                      <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                        <feature.icon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h5 className="font-medium">{feature.title}</h5>
                        <p className="text-sm text-gray-500">{feature.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="mt-8">
                <h4 className="text-xl font-medium mb-4">Supported Languages</h4>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">English</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">हिन्दी (Hindi)</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">मराठी (Marathi)</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">ಕನ್ನಡ (Kannada)</span>
                  <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm">తెలుగు (Telugu)</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <Button variant="outline" onClick={() => navigate('/contact')} className="mx-auto">
            <Phone className="h-4 w-4 mr-2" /> Contact Us
          </Button>
        </div>
      </div>
    </UserContainer>
  );
};

export default AboutPage;
