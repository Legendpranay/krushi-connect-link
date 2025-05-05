
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Bell, Globe, Shield, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

const SettingsPage = () => {
  const { t } = useLanguage();
  const { userProfile } = useAuth();
  const navigate = useNavigate();

  // Settings states
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleToggleSetting = (
    setting: string,
    value: boolean,
    setter: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    setter(value);
    toast({
      description: `${setting} ${value ? 'enabled' : 'disabled'}`,
    });
  };

  return (
    <UserContainer>
      <div className="p-4">
        <div className="flex items-center mb-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/more')} className="mr-2">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold">{t('profile.settings')}</h2>
        </div>
        
        {/* Notifications */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <Bell className="h-5 w-5 text-primary mr-3" />
              <h3 className="text-lg font-medium">Notifications</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive alerts about bookings and updates
                  </p>
                </div>
                <Switch 
                  checked={pushNotifications}
                  onCheckedChange={(checked) => 
                    handleToggleSetting('Push notifications', checked, setPushNotifications)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive booking confirmations and receipts via email
                  </p>
                </div>
                <Switch 
                  checked={emailNotifications}
                  onCheckedChange={(checked) => 
                    handleToggleSetting('Email notifications', checked, setEmailNotifications)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* App Settings */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <Settings className="h-5 w-5 text-primary mr-3" />
              <h3 className="text-lg font-medium">App Settings</h3>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Location Services</p>
                  <p className="text-sm text-muted-foreground">
                    Allow app to access your location
                  </p>
                </div>
                <Switch 
                  checked={locationServices}
                  onCheckedChange={(checked) => 
                    handleToggleSetting('Location services', checked, setLocationServices)
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
                <Switch 
                  checked={darkMode}
                  onCheckedChange={(checked) => 
                    handleToggleSetting('Dark mode', checked, setDarkMode)
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Language */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <Globe className="h-5 w-5 text-primary mr-3" />
              <h3 className="text-lg font-medium">{t('profile.language')}</h3>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => navigate('/profile')}
            >
              Change Language
            </Button>
          </CardContent>
        </Card>
        
        {/* Privacy */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center mb-4">
              <Shield className="h-5 w-5 text-primary mr-3" />
              <h3 className="text-lg font-medium">Privacy and Security</h3>
            </div>
            
            <Button 
              variant="outline" 
              className="w-full justify-start mb-3"
              onClick={() => navigate('/privacy')}
            >
              Privacy Policy
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                toast({
                  description: 'Cache cleared successfully',
                });
              }}
            >
              Clear App Cache
            </Button>
          </CardContent>
        </Card>
      </div>
    </UserContainer>
  );
};

export default SettingsPage;
