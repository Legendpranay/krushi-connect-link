import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Star } from 'lucide-react';
import { collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DriverProfile, GeoPoint } from '../types';
import LeafletMap from '../components/map/LeafletMap';
import { toast } from '@/components/ui/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const MapPage = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [filteredDrivers, setFilteredDrivers] = useState<DriverProfile[]>([]);
  const [userLocation, setUserLocation] = useState<GeoPoint>({
    latitude: 19.0760, // Default to Mumbai
    longitude: 72.8777
  });
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDriverId, setSelectedDriverId] = useState<string | null>(null);
  const [maxDistance, setMaxDistance] = useState<number>(10); // 10km default radius

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        // Get user's location from profile if available
        if (userProfile?.role === 'farmer' && userProfile.farmLocation) {
          setUserLocation(userProfile.farmLocation);
        } else {
          // Try to get current location
          navigator.geolocation.getCurrentPosition((position) => {
            setUserLocation({
              latitude: position.coords.latitude,
              longitude: position.coords.longitude
            });
          });
        }
        
        // Fetch verified and active drivers
        const driversRef = collection(db, 'users');
        const q = query(
          driversRef,
          where('role', '==', 'driver'),
          where('isVerified', '==', true),
          where('isActive', '==', true)
        );
        
        const snapshot = await getDocs(q);
        const driversList: DriverProfile[] = [];
        
        snapshot.forEach((doc) => {
          const driverData = doc.data() as DriverProfile;
          driversList.push({
            id: doc.id,
            ...driverData
          });
        });
        
        setDrivers(driversList);
        setFilteredDrivers(driversList);
      } catch (error) {
        console.error('Error fetching drivers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load drivers. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDrivers();
  }, [userProfile]);

  useEffect(() => {
    // Filter drivers based on search query
    if (!searchQuery.trim()) {
      setFilteredDrivers(drivers);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = drivers.filter(
      driver => 
        driver.name?.toLowerCase().includes(query) ||
        driver.village?.toLowerCase().includes(query) ||
        driver.district?.toLowerCase().includes(query)
    );
    
    setFilteredDrivers(filtered);
  }, [searchQuery, drivers]);

  const handleLocationSelect = async (location: { latitude: number; longitude: number; address?: string }) => {
    setUserLocation({
      latitude: location.latitude,
      longitude: location.longitude
    });
    
    // If user is a farmer, update their farm location
    if (userProfile?.role === 'farmer' && userProfile.id) {
      try {
        const userRef = doc(db, 'users', userProfile.id);
        await updateDoc(userRef, {
          farmLocation: {
            latitude: location.latitude,
            longitude: location.longitude
          }
        });
        
        toast({
          description: 'Your location has been updated'
        });
      } catch (error) {
        console.error('Error updating location:', error);
      }
    }
  };

  // Calculate distance between two points (in km)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    
    const R = 6371; // Radius of the earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2); 
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
    const distance = R * c; // Distance in km
    return distance;
  };

  // Sort drivers by distance
  const sortedDrivers = [...filteredDrivers].sort((a, b) => {
    const distanceA = a.location ? 
      calculateDistance(
        userLocation.latitude, 
        userLocation.longitude,
        a.location.latitude,
        a.location.longitude
      ) : 9999;
    
    const distanceB = b.location ? 
      calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        b.location.latitude,
        b.location.longitude
      ) : 9999;
      
    return (distanceA || 9999) - (distanceB || 9999);
  });

  // Filter drivers by distance
  const driversWithinDistance = sortedDrivers.filter(driver => {
    if (!driver.location) return false;
    
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      driver.location.latitude,
      driver.location.longitude
    );
    
    return distance !== null && distance <= maxDistance;
  });

  // Prepare map markers
  const mapMarkers = driversWithinDistance.map(driver => ({
    position: {
      latitude: driver.location?.latitude || 0,
      longitude: driver.location?.longitude || 0
    },
    popup: driver.name || 'Driver',
    onClick: () => setSelectedDriverId(driver.id)
  })).filter(marker => marker.position.latitude && marker.position.longitude);

  return (
    <UserContainer>
      <div className="mb-4 p-4">
        <h2 className="text-2xl font-bold mb-4">{t('map.nearbyDrivers')}</h2>
        
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder={t('map.searchLocation')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          {/* Distance filter */}
          <div className="w-32">
            <Select 
              value={maxDistance.toString()} 
              onValueChange={(value) => setMaxDistance(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Distance" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 km</SelectItem>
                <SelectItem value="10">10 km</SelectItem>
                <SelectItem value="20">20 km</SelectItem>
                <SelectItem value="50">50 km</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {/* Map */}
        <div className="mb-6">
          <LeafletMap
            center={userLocation}
            zoom={13}
            markers={mapMarkers}
            onMapClick={handleLocationSelect}
            userLocation={userLocation}
            locationRadius={maxDistance * 1000} // Convert km to meters
          />
        </div>
      </div>

      {/* Nearby drivers list */}
      <div className="mb-4 px-4">
        <h3 className="text-lg font-semibold mb-4">
          {t('map.nearbyDrivers')} ({driversWithinDistance.length})
        </h3>
        
        {/* Driver cards */}
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">{t('common.loading')}</p>
          </div>
        ) : driversWithinDistance.length > 0 ? (
          <div className="space-y-4">
            {driversWithinDistance.map(driver => {
              const distance = driver.location ? 
                calculateDistance(
                  userLocation.latitude,
                  userLocation.longitude,
                  driver.location.latitude,
                  driver.location.longitude
                ) : null;
              
              return (
                <Card 
                  key={driver.id} 
                  className={`shadow-sm ${selectedDriverId === driver.id ? 'border-primary' : ''}`}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between">
                      <div className="flex">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 mr-4 overflow-hidden">
                          {driver.profileImage ? (
                            <img 
                              src={driver.profileImage} 
                              alt={driver.name} 
                              className="h-full w-full object-cover" 
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-gray-500">
                              👤
                            </div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium">{driver.name}</h4>
                          <p className="text-sm text-gray-500">
                            {driver.village} • {distance ? `${distance.toFixed(1)}km` : 'Distance unknown'}
                          </p>
                          <div className="flex items-center mt-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                            <span className="text-sm ml-1">
                              {driver.rating?.toFixed(1) || '4.5'} ({driver.totalRatings || '0'} reviews)
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Button 
                          size="sm" 
                          onClick={() => navigate(`/driver/profile/${driver.id}`)}
                        >
                          {t('map.viewProfile')}
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => navigate(`/booking/new/${driver.id}`)}
                        >
                          {t('map.book')}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-8 bg-muted rounded-lg">
            <p>No drivers found within {maxDistance}km of your location. Try adjusting your search or location.</p>
          </div>
        )}
      </div>
    </UserContainer>
  );
};

export default MapPage;
