
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { HelpCircle, Info, Share2, Star, MessageSquare, ShieldCheck, Settings } from 'lucide-react';
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
      color: 'bg-blue-500'
    },
    {
      icon: Settings,
      title: 'Settings',
      description: 'App preferences',
      onClick: () => navigate('/settings'),
      color: 'bg-gray-600'
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
      color: 'bg-yellow-500'
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
      color: 'bg-green-600'
    },
    {
      icon: MessageSquare,
      title: 'Contact Us',
      description: 'Send us a message',
      onClick: () => navigate('/contact'),
      color: 'bg-indigo-500'
    },
    {
      icon: ShieldCheck,
      title: 'Privacy Policy',
      description: 'Read our privacy policy',
      onClick: () => navigate('/privacy'),
      color: 'bg-red-500'
    },
    {
      icon: Info,
      title: t('profile.about'),
      description: 'About KrushiLink',
      onClick: () => navigate('/about'),
      color: 'bg-purple-500'
    },
  ];

  return (
    <UserContainer>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">{t('bottomNav.more')}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, index) => (
            <Card key={index} className="shadow-sm hover:shadow-md transition-all">
              <CardContent className="p-0">
                <Button
                  variant="ghost"
                  className="w-full flex items-center justify-start p-4 h-auto"
                  onClick={item.onClick}
                >
                  <div className={`h-12 w-12 rounded-full ${item.color} text-white flex items-center justify-center mr-4`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-medium text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">KrushiLink v1.0.0</p>
          <p className="text-xs text-gray-400 mt-1">© 2025 KrushiLink Technologies</p>
        </div>
      </div>
    </UserContainer>
  );
};

export default MorePage;
