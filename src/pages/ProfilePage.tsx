
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { User, Edit, Globe, LogOut, HelpCircle, Settings, Info } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const ProfilePage = () => {
  const { userProfile, logout } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/auth');
    } catch (error) {
      console.error(error);
      toast({
        title: 'Error',
        description: 'Failed to log out. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const changeLanguage = (lang: 'en' | 'hi' | 'mr') => {
    setLanguage(lang);
    toast({
      description: 'Language changed successfully',
    });
  };

  return (
    <UserContainer>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">{t('profile.myProfile')}</h2>
        
        {/* Profile Card */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="mr-4">
                {userProfile?.profileImage ? (
                  <div className="h-20 w-20 rounded-full overflow-hidden">
                    <img
                      src={userProfile.profileImage}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-20 w-20 bg-gray-200 rounded-full flex items-center justify-center">
                    <User className="h-10 w-10 text-gray-500" />
                  </div>
                )}
              </div>
              
              <div>
                <h3 className="text-xl font-medium">{userProfile?.name || 'User'}</h3>
                <p className="text-sm text-gray-500">{userProfile?.phone}</p>
                <div className="flex items-center mt-1">
                  <span className="text-xs px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full">
                    {userProfile?.role === 'farmer' ? t('auth.farmer') : t('auth.driver')}
                  </span>
                  {userProfile?.village && (
                    <span className="text-xs text-gray-500 ml-2">
                      {userProfile.village}
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="mt-4 w-full"
              onClick={() => navigate('/edit-profile')}
            >
              <Edit className="h-4 w-4 mr-2" />
              {t('profile.editProfile')}
            </Button>
          </CardContent>
        </Card>
        
        {/* Language Selection */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center mb-3">
              <Globe className="h-5 w-5 mr-3 text-gray-500" />
              <h3 className="font-medium">{t('profile.language')}</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <Button
                variant={language === 'en' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => changeLanguage('en')}
              >
                English
              </Button>
              
              <Button
                variant={language === 'hi' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => changeLanguage('hi')}
              >
                हिंदी
              </Button>
              
              <Button
                variant={language === 'mr' ? 'default' : 'outline'}
                size="sm"
                className="w-full"
                onClick={() => changeLanguage('mr')}
              >
                मराठी
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Settings & Help */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/settings')}
          >
            <Settings className="h-5 w-5 mr-3" />
            {t('profile.settings')}
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/help')}
          >
            <HelpCircle className="h-5 w-5 mr-3" />
            {t('profile.help')}
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => navigate('/about')}
          >
            <Info className="h-5 w-5 mr-3" />
            {t('profile.about')}
          </Button>
          
          <Button
            variant="ghost"
            className="w-full justify-start text-destructive hover:text-destructive"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5 mr-3" />
            {t('auth.logout')}
          </Button>
        </div>
      </div>
    </UserContainer>
  );
};

export default ProfilePage;
