
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { DriverProfile, Equipment, Review } from '../types';
import { Star, MapPin, Tractor } from 'lucide-react';
import LocationMap from '../components/map/LocationMap';

const DriverProfilePage = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDriverData = async () => {
      if (!driverId) return;
      
      try {
        // Fetch driver profile
        const driverRef = doc(db, 'users', driverId);
        const driverSnap = await getDoc(driverRef);
        
        if (driverSnap.exists()) {
          const driverData = driverSnap.data() as DriverProfile;
          setDriver({
            id: driverSnap.id,
            ...driverData
          });
          
          // Fetch driver's equipment
          const equipmentRef = collection(db, 'equipment');
          const equipmentQuery = query(equipmentRef, where('driverId', '==', driverId));
          const equipmentSnap = await getDocs(equipmentQuery);
          
          const equipmentList: Equipment[] = [];
          equipmentSnap.forEach(doc => {
            equipmentList.push({
              id: doc.id,
              ...(doc.data() as Omit<Equipment, 'id'>)
            });
          });
          
          setEquipment(equipmentList);
          
          // Fetch reviews
          const reviewsRef = collection(db, 'reviews');
          const reviewsQuery = query(reviewsRef, where('toUserId', '==', driverId));
          const reviewsSnap = await getDocs(reviewsQuery);
          
          const reviewsList: Review[] = [];
          reviewsSnap.forEach(doc => {
            reviewsList.push({
              id: doc.id,
              ...(doc.data() as Omit<Review, 'id'>),
              createdAt: (doc.data().createdAt?.toDate() || new Date())
            });
          });
          
          setReviews(reviewsList);
        } else {
          toast({
            title: 'Error',
            description: 'Driver not found',
            variant: 'destructive',
          });
          navigate('/map');
        }
      } catch (error) {
        console.error('Error fetching driver data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load driver profile',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDriverData();
  }, [driverId, navigate]);

  const handleBook = () => {
    navigate(`/booking/new/${driverId}`);
  };

  if (isLoading) {
    return (
      <UserContainer>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">{t('common.loading')}</p>
          </div>
        </div>
      </UserContainer>
    );
  }

  if (!driver) {
    return (
      <UserContainer>
        <div className="p-4">
          <h2 className="text-2xl font-bold mb-4">Driver not found</h2>
          <Button onClick={() => navigate('/map')}>Back to Map</Button>
        </div>
      </UserContainer>
    );
  }

  return (
    <UserContainer>
      <div className="p-4">
        {/* Profile Header */}
        <div className="flex items-center mb-6">
          <div className="h-20 w-20 rounded-full bg-gray-200 overflow-hidden mr-4">
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
            <h2 className="text-2xl font-bold">{driver.name}</h2>
            <div className="flex items-center mt-1">
              <MapPin className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-sm text-gray-500">
                {driver.village}, {driver.district}
              </span>
            </div>
            <div className="flex items-center mt-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm ml-1">
                {driver.rating?.toFixed(1) || '4.5'} ({driver.totalRatings || '0'} reviews)
              </span>
            </div>
          </div>
        </div>
        
        {/* Tractor Info */}
        {driver.tractorType && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="flex items-center">
                <Tractor className="h-5 w-5 mr-2 text-gray-500" />
                <h3 className="font-medium">Tractor Type: {driver.tractorType}</h3>
              </div>
              {driver.tractorImage && (
                <div className="mt-2 rounded-md overflow-hidden">
                  <img 
                    src={driver.tractorImage} 
                    alt="Tractor" 
                    className="w-full object-cover h-48"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Services Offered */}
        <h3 className="font-medium text-lg mb-3">Services & Pricing</h3>
        <Card className="mb-6">
          <CardContent className="p-4">
            {equipment.length > 0 ? (
              <div className="divide-y">
                {equipment.map(item => (
                  <div key={item.id} className="py-3 flex justify-between">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">₹{item.pricePerAcre}/acre</p>
                      {item.pricePerHour && (
                        <p className="text-sm text-gray-500">₹{item.pricePerHour}/hour</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-2">No services listed</p>
            )}
          </CardContent>
        </Card>
        
        {/* Map Location */}
        <h3 className="font-medium text-lg mb-3">Location</h3>
        <Card className="mb-6">
          <CardContent className="p-0">
            {driver.location ? (
              <LocationMap
                initialLocation={driver.location}
                showMarkers={true}
                markers={[{
                  id: driver.id,
                  latitude: driver.location.latitude,
                  longitude: driver.location.longitude,
                  title: driver.name || 'Driver'
                }]}
                height="200px"
                interactive={false}
              />
            ) : (
              <div className="p-4 text-center text-gray-500">
                Location not available
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Reviews */}
        <h3 className="font-medium text-lg mb-3">Reviews</h3>
        <Card className="mb-6">
          <CardContent className="p-4">
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map(review => (
                  <div key={review.id} className="border-b pb-3 last:border-b-0 last:pb-0">
                    <div className="flex items-center mb-2">
                      <div className="flex">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500 ml-2">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {review.comment && <p className="text-sm">{review.comment}</p>}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-2">No reviews yet</p>
            )}
          </CardContent>
        </Card>
        
        {/* Book Button */}
        {userProfile?.role === 'farmer' && (
          <Button 
            onClick={handleBook}
            className="w-full"
          >
            Book Now
          </Button>
        )}
      </div>
    </UserContainer>
  );
};

export default DriverProfilePage;
