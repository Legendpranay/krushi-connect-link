
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

const HomePage = () => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [nearbyDrivers, setNearbyDrivers] = useState<DriverProfile[]>([]);
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);

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
      }
    };

    fetchData();
  }, [userProfile]);

  // Render different home page based on user role
  const renderFarmerHome = () => (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{t('home.welcome')}, {userProfile?.name}</h2>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={() => navigate('/booking')}
            className="h-24 flex flex-col items-center justify-center"
          >
            <Calendar className="w-8 h-8 mb-2" />
            {t('home.bookNow')}
          </Button>
          
          <Button 
            onClick={() => navigate('/map')}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center"
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
              <Card key={driver.id} className="shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden mr-4">
                      {driver.profileImage ? (
                        <img 
                          src={driver.profileImage} 
                          alt={driver.name} 
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-gray-500">
                          <User size={24} />
                        </div>
                      )}
                    </div>
                    <div className="flex-grow">
                      <h4 className="font-medium">{driver.name}</h4>
                      <p className="text-sm text-gray-500">{driver.village}</p>
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
              <p>{t('map.nearbyDrivers')} {t('common.loading')}</p>
            </CardContent>
          </Card>
        )}
      </section>
    </>
  );

  const renderDriverHome = () => (
    <>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4">{t('home.welcome')}, {userProfile?.name}</h2>
        
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            onClick={() => navigate('/driver-status')}
            className="h-24 flex flex-col items-center justify-center"
          >
            <Calendar className="w-8 h-8 mb-2" />
            {t('driver.goOnline')}
          </Button>
          
          <Button 
            onClick={() => navigate('/driver-earnings')}
            variant="outline"
            className="h-24 flex flex-col items-center justify-center"
          >
            <Settings className="w-8 h-8 mb-2" />
            {t('driver.earnings')}
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

        <Card className="shadow-sm mb-6">
          <CardContent className="p-4">
            <ul className="divide-y">
              {/* Sample equipment - in a real app, this would come from the user profile */}
              <li className="py-2 flex justify-between">
                <span>Plowing</span>
                <span className="font-medium">₹700/acre</span>
              </li>
              <li className="py-2 flex justify-between">
                <span>Sowing</span>
                <span className="font-medium">₹500/acre</span>
              </li>
              <li className="py-2 flex justify-between">
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
            <Card key={booking.id} className="shadow-sm">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-medium">{booking.serviceType}</h4>
                    <p className="text-sm text-gray-500">
                      {new Date(booking.requestedTime.toString()).toLocaleDateString()} • {booking.acreage} acres
                    </p>
                  </div>
                  <div className={`px-2 py-1 text-xs rounded-full ${
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
            <p>{t('home.recentBookings')} {t('common.loading')}</p>
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

      <Card className="bg-accent/10 border-accent">
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
      {userProfile?.role === 'farmer' ? renderFarmerHome() : renderDriverHome()}
      {renderRecentBookings()}
      {renderAnnouncements()}
    </UserContainer>
  );
};

export default HomePage;
