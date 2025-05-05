
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Info, Share2, Star, MessageSquare, ShieldCheck } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const MorePage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();

  const menuItems = [
    {
      icon: HelpCircle,
      title: t('profile.help'),
      description: 'Get help and support',
      onClick: () => navigate('/help'),
    },
    {
      icon: Star,
      title: 'Rate the App',
      description: 'Share your feedback',
      onClick: () => {
        toast({
          description: 'Thanks for your interest! In the full version, this would open your app store.'
        });
      },
    },
    {
      icon: Share2,
      title: 'Share KrushiLink',
      description: 'Invite friends and family',
      onClick: () => {
        toast({
          description: 'Thanks for sharing! In the full version, this would open your sharing options.'
        });
      },
    },
    {
      icon: MessageSquare,
      title: 'Contact Us',
      description: 'Send us a message',
      onClick: () => navigate('/contact'),
    },
    {
      icon: ShieldCheck,
      title: 'Privacy Policy',
      description: 'Read our privacy policy',
      onClick: () => navigate('/privacy'),
    },
    {
      icon: Info,
      title: t('profile.about'),
      description: 'About KrushiLink',
      onClick: () => navigate('/about'),
    },
  ];

  return (
    <UserContainer>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-4">{t('bottomNav.more')}</h2>
        
        <div className="space-y-4">
          {menuItems.map((item, index) => (
            <Card key={index} className="shadow-sm">
              <CardContent className="p-4">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start p-2"
                  onClick={item.onClick}
                >
                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mr-3">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </UserContainer>
  );
};

export default MorePage;
