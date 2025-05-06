
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Map, Calendar, User, Settings } from 'lucide-react';
import { collection, query, where, limit, getDocs } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { DriverProfile, Booking } from '../types';
import { Switch } from '@/components/ui/switch';
import { 
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import { toast } from '@/components/ui/use-toast';

// Sample carousel images - replace with your own
const carouselImages = [
  {
    src: "https://images.unsplash.com/photo-1605000797499-95a51c5269ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80",
    alt: "Tractor working in field",
    title: "Connect with equipment drivers"
  },
  {
    src: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    alt: "Farm harvest",
    title: "Book equipment for your farm"
  },
  {
    src: "https://images.unsplash.com/photo-1530267981375-f0de937f5f13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80",
    alt: "Rural landscape",
    title: "Grow your agricultural business"
  }
];

const HomePage = () => {
  const { userProfile, updateDriverStatus } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [nearbyDrivers, setNearbyDrivers] = useState<DriverProfile[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [isOnline, setIsOnline] = useState(userProfile?.isActive || false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  useEffect(() => {
    // Update online status from user profile when it loads
    if (userProfile) {
      setIsOnline(userProfile.isActive || false);
    }
  }, [userProfile]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userProfile) return;

      try {
        // If user is a farmer, fetch nearby drivers
        if (userProfile.role === 'farmer') {
          // In a real app, this would use GeoFirestore to query by location
          const driversRef = collection(db, 'users');
          const driversQuery = query(
            driversRef,
            where('role', '==', 'driver'),
            where('isActive', '==', true),
            where('isVerified', '==', true),
            limit(3)
          );
          
          const driversSnapshot = await getDocs(driversQuery);
          const drivers: DriverProfile[] = [];
          
          driversSnapshot.forEach(doc => {
            drivers.push({ id: doc.id, ...doc.data() } as DriverProfile);
          });
          
          setNearbyDrivers(drivers);
        }

        // Fetch recent bookings for both farmers and drivers
        const bookingsRef = collection(db, 'bookings');
        const bookingsQuery = query(
          bookingsRef,
          userProfile.role === 'farmer'
            ? where('farmerId', '==', userProfile.id)
            : where('driverId', '==', userProfile.id),
          limit(3)
        );
        
        const bookingsSnapshot = await getDocs(bookingsQuery);
        const bookings: Booking[] = [];
        
        bookingsSnapshot.forEach(doc => {
          bookings.push({ id: doc.id, ...doc.data() } as Booking);
        });
        
        setRecentBookings(bookings);

      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive"
        });
      }
    };

    fetchData();
  }, [userProfile]);

  // Handle driver going online/offline
  const handleToggleOnline = async () => {
    if (userProfile?.role !== 'driver') return;
    
    setIsUpdatingStatus(true);
    try {
      const newStatus = !isOnline;
      const success = await updateDriverStatus(newStatus);
      
      if (success) {
        setIsOnline(newStatus);
      }
    } catch (error) {
      console.error('Error updating driver status:', error);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Render image carousel for both farmer and driver
  const renderCarousel = () => (
    <div className="mb-6">
      <Carousel className="w-full">
        <CarouselContent>
          {carouselImages.map((image, index) => (
            <CarouselItem key={index}>
              <div className="relative rounded-lg overflow-hidden aspect-[16/9]">
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = '/placeholder.svg';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <div className="p-4 text-white">
                    <h3 className="text-xl font-bold">{image.title}</h3>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2" />
        <CarouselNext className="right-2" />
      </Carousel>
    </div>
  );

  // Render different home page based on user role
  const renderFarmerHome = () => (
    <>
      {renderCarousel()}
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{t('home.welcome')}, {userProfile?.name || 'Farmer'}</h2>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={() => navigate('/booking')}
            className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-green-500 to-green-600"
          >
            <Calendar className="w-8 h-8 mb-2" />
            {t('home.bookNow')}
          </Button>
          
          <Button 
            onClick={() => navigate('/map')}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center border-2 border-green-500 text-green-700"
          >
            <Map className="w-8 h-8 mb-2" />
            {t('map.nearbyDrivers')}
          </Button>
        </div>
      </div>

      {/* Nearby Drivers */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('home.nearbyDrivers')}</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/map')}>
            {t('home.viewAll')}
          </Button>
        </div>

        {nearbyDrivers.length > 0 ? (
          <div className="space-y-4">
            {nearbyDrivers.map(driver => (
              <Card key={driver.id} className="shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-green-100 to-green-200 flex-shrink-0 overflow-hidden mr-4">
                      {driver.profileImage ? (
                        <img 
                          src={driver.profileImage} 
                          alt={driver.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-green-500">
                          <User size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{driver.name || 'Driver'}</h4>
                      <p className="text-sm text-gray-500">{driver.village || 'Local Area'}</p>
                    </div>
                    <Button size="sm" onClick={() => navigate(`/driver/${driver.id}`)}>
                      {t('map.book')}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-muted/50">
            <CardContent className="p-6 text-center">
              <p>No nearby drivers available at the moment</p>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );

  const renderDriverHome = () => (
    <>
      {renderCarousel()}
      
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{t('home.welcome')}, {userProfile?.name || 'Driver'}</h2>
        
        {/* Driver Status Toggle */}
        <Card className="mb-6 shadow-md border-l-4 border-l-primary">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-lg">Driver Status</h3>
                <p className="text-sm text-muted-foreground">
                  {isOnline ? "You're currently online and visible to farmers" : "You're offline and not receiving bookings"}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${isOnline ? 'text-green-600' : 'text-gray-500'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
                <Switch 
                  checked={isOnline} 
                  onCheckedChange={handleToggleOnline} 
                  disabled={isUpdatingStatus}
                  className={isUpdatingStatus ? 'opacity-50 cursor-not-allowed' : ''}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={() => navigate('/driver-earnings')}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center border-2 border-blue-500 text-blue-700"
          >
            <Settings className="w-8 h-8 mb-2" />
            {t('driver.earnings')}
          </Button>
          
          <Button 
            onClick={() => navigate('/driver-services')}
            className="h-24 flex flex-col items-center justify-center bg-gradient-to-br from-blue-500 to-blue-600"
          >
            <Calendar className="w-8 h-8 mb-2" />
            {t('driver.myServices')}
          </Button>
        </div>
      </div>

      {/* Equipment List */}
      <section className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">{t('driver.myServices')}</h3>
          <Button variant="ghost" size="sm" onClick={() => navigate('/driver-services')}>
            {t('driver.editEquipment')}
          </Button>
        </div>

        <Card className="shadow-sm mb-6 hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <ul className="divide-y">
              {/* Sample equipment - in a real app, this would come from the user profile */}
              <li className="py-3 flex justify-between">
                <span>Plowing</span>
                <span className="font-medium">₹700/acre</span>
              </li>
              <li className="py-3 flex justify-between">
                <span>Sowing</span>
                <span className="font-medium">₹500/acre</span>
              </li>
              <li className="py-3 flex justify-between">
                <span>Transport</span>
                <span className="font-medium">₹600/hour</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </section>
    </>
  );

  // Recent Bookings section is common for both roles
  const renderRecentBookings = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t('home.recentBookings')}</h3>
        <Button variant="ghost" size="sm" onClick={() => navigate('/bookings')}>
          {t('home.viewAll')}
        </Button>
      </div>

      {recentBookings.length > 0 ? (
        <div className="space-y-4">
          {recentBookings.map(booking => (
            <Card key={booking.id} className="shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{booking.serviceType}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.requestedTime).toLocaleDateString()} • {booking.acreage} acres
                    </p>
                  </div>
                  <div className={`px-3 py-1 text-xs rounded-full font-medium ${
                    booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                    booking.status === 'awaiting_payment' ? 'bg-yellow-100 text-yellow-800' :
                    booking.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    booking.status === 'requested' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.status.replace('_', ' ')}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-muted/50">
          <CardContent className="p-6 text-center">
            <p>No recent bookings found</p>
          </CardContent>
        </Card>
      )}
    </section>
  );

  // Announcements section is common for both roles
  const renderAnnouncements = () => (
    <section className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">{t('home.announcements')}</h3>
      </div>

      <Card className="bg-accent/10 border-accent hover:shadow-md transition-shadow">
        <CardContent className="p-4">
          <h4 className="font-semibold mb-2">Welcome to KrushiLink!</h4>
          <p className="text-sm">
            We're connecting farmers with tractor drivers to make agricultural work easier.
          </p>
        </CardContent>
      </Card>
    </section>
  );

  return (
    <UserContainer>
      <div className="p-4">
        {userProfile?.role === 'farmer' ? renderFarmerHome() : renderDriverHome()}
        {renderRecentBookings()}
        {renderAnnouncements()}
      </div>
    </UserContainer>
  );
};

export default HomePage;
