
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, MapPin, Star } from 'lucide-react';

const MapPage = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <UserContainer>
      <div className="mb-4">
        <h2 className="text-2xl font-bold mb-4">{t('map.nearbyDrivers')}</h2>
        
        {/* Search bar */}
        <div className="relative mb-4">
          <Input
            type="text"
            placeholder={t('map.searchLocation')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        {/* Map placeholder */}
        <div className="bg-gray-100 rounded-lg h-48 mb-4 flex items-center justify-center">
          <div className="text-center">
            <MapPin className="h-8 w-8 text-primary mx-auto mb-2" />
            <p>{t('map.currentLocation')}</p>
            <p className="text-sm text-gray-500">Map integration would appear here</p>
          </div>
        </div>
      </div>

      {/* Nearby drivers list */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-4">{t('map.nearbyDrivers')}</h3>
        
        {/* Driver cards */}
        <div className="space-y-4">
          {/* Sample driver data - would come from Firebase in a real app */}
          {[1, 2, 3].map((driver) => (
            <Card key={driver} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between">
                  <div className="flex">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 mr-4"></div>
                    <div>
                      <h4 className="font-medium">Ramesh Patil</h4>
                      <p className="text-sm text-gray-500">Baramati • 3.2km</p>
                      <div className="flex items-center mt-1">
                        <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                        <span className="text-sm ml-1">4.8 (24 reviews)</span>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Button 
                      size="sm" 
                      onClick={() => navigate(`/driver/profile/${driver}`)}
                    >
                      {t('map.viewProfile')}
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => navigate(`/booking/new/${driver}`)}
                    >
                      {t('map.book')}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </UserContainer>
  );
};

export default MapPage;
