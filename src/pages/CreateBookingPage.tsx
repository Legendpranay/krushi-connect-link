
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import UserContainer from '../components/UserContainer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { db } from '../lib/firebase';
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { DriverProfile, Equipment, Booking, GeoPoint, PaymentMethod } from '../types';
import LocationMap from '../components/map/LocationMap';

const CreateBookingPage = () => {
  const { driverId } = useParams<{ driverId: string }>();
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const [driver, setDriver] = useState<DriverProfile | null>(null);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    equipmentId: '',
    acreage: 1,
    address: '',
    scheduledDate: '',
    paymentMethod: 'cash' as PaymentMethod,
  });
  
  const [location, setLocation] = useState<GeoPoint | null>(null);
  
  useEffect(() => {
    const fetchData = async () => {
      if (!driverId) return;
      
      try {
        // Fetch driver details
        const driverRef = doc(db, 'users', driverId);
        const driverSnap = await getDoc(driverRef);
        
        if (!driverSnap.exists()) {
          toast({
            title: 'Error',
            description: 'Driver not found',
            variant: 'destructive',
          });
          navigate('/map');
          return;
        }
        
        const driverData = driverSnap.data() as DriverProfile;
        setDriver({
          id: driverSnap.id,
          ...driverData
        });
        
        // Fetch driver's equipment
        const equipmentRef = collection(db, 'equipment');
        const q = query(equipmentRef, where('driverId', '==', driverId));
        const equipmentSnap = await getDocs(q);
        
        const equipmentList: Equipment[] = [];
        equipmentSnap.forEach(doc => {
          equipmentList.push({
            id: doc.id,
            ...(doc.data() as Omit<Equipment, 'id'>)
          });
        });
        
        setEquipment(equipmentList);
        if (equipmentList.length > 0) {
          setFormData(prev => ({
            ...prev,
            equipmentId: equipmentList[0].id
          }));
        }
        
        // Set initial location from user profile if available
        if (userProfile?.role === 'farmer' && userProfile.farmLocation) {
          setLocation(userProfile.farmLocation);
        }
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load driver information',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [driverId, navigate, userProfile]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'acreage' ? parseFloat(value) : value
    }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleLocationSelect = (locationData: { latitude: number; longitude: number; address: string }) => {
    setLocation({
      latitude: locationData.latitude,
      longitude: locationData.longitude
    });
    setFormData(prev => ({
      ...prev,
      address: locationData.address
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile || !driver || !location) {
      toast({
        title: 'Error',
        description: 'Missing required information',
        variant: 'destructive',
      });
      return;
    }
    
    // Validate form
    if (!formData.equipmentId || formData.acreage <= 0 || !formData.address) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Get selected equipment
      const selectedEquipment = equipment.find(item => item.id === formData.equipmentId);
      if (!selectedEquipment) {
        throw new Error('Selected service not found');
      }
      
      // Calculate total price
      const totalPrice = selectedEquipment.pricePerAcre * formData.acreage;
      
      // Create booking
      const bookingData: Omit<Booking, 'id'> = {
        farmerId: userProfile.id,
        driverId: driver.id,
        serviceType: selectedEquipment.name,
        equipmentId: selectedEquipment.id,
        location: location,
        address: formData.address,
        acreage: formData.acreage,
        pricePerAcre: selectedEquipment.pricePerAcre,
        totalPrice: totalPrice,
        status: 'requested',
        paymentMethod: formData.paymentMethod,
        paymentStatus: 'pending',
        paymentDueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
        requestedTime: new Date(),
        scheduledTime: formData.scheduledDate ? new Date(formData.scheduledDate) : undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save to Firestore
      await addDoc(collection(db, 'bookings'), {
        ...bookingData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      toast({
        description: 'Booking request sent successfully!'
      });
      
      // Redirect to bookings page
      navigate('/bookings');
    } catch (error) {
      console.error('Error creating booking:', error);
      toast({
        title: 'Error',
        description: 'Failed to create booking. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Calculate total price
  const selectedEquipment = equipment.find(item => item.id === formData.equipmentId);
  const totalPrice = selectedEquipment ? selectedEquipment.pricePerAcre * formData.acreage : 0;

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

  if (!driver || !userProfile || userProfile.role !== 'farmer') {
    return (
      <UserContainer>
        <div className="p-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Access Denied</h2>
          <p className="mb-4">Only farmers can book services.</p>
          <Button onClick={() => navigate('/map')}>Back to Map</Button>
        </div>
      </UserContainer>
    );
  }

  return (
    <UserContainer>
      <div className="p-4">
        <h2 className="text-2xl font-bold mb-6">New Booking Request</h2>
        
        {/* Driver Info */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gray-200 overflow-hidden mr-4">
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
                <h3 className="font-medium">{driver.name}</h3>
                <p className="text-sm text-gray-500">{driver.village}, {driver.district}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Service Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Service*
            </label>
            {equipment.length > 0 ? (
              <Select
                value={formData.equipmentId}
                onValueChange={(value) => handleSelectChange('equipmentId', value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a service" />
                </SelectTrigger>
                <SelectContent>
                  {equipment.map(item => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} - ₹{item.pricePerAcre}/acre
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-gray-500">No services available from this driver</p>
            )}
          </div>
          
          {/* Acreage */}
          <div>
            <label htmlFor="acreage" className="block text-sm font-medium mb-1">
              Farm Size (acres)*
            </label>
            <Input
              id="acreage"
              name="acreage"
              type="number"
              min="0.5"
              step="0.5"
              value={formData.acreage}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Location Map */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Select Location*
            </label>
            <LocationMap
              initialLocation={location || { latitude: 19.0760, longitude: 72.8777 }}
              onLocationSelect={handleLocationSelect}
              height="250px"
            />
          </div>
          
          {/* Address */}
          <div>
            <label htmlFor="address" className="block text-sm font-medium mb-1">
              Address*
            </label>
            <Input
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
            />
          </div>
          
          {/* Scheduled Date */}
          <div>
            <label htmlFor="scheduledDate" className="block text-sm font-medium mb-1">
              Preferred Date (optional)
            </label>
            <Input
              id="scheduledDate"
              name="scheduledDate"
              type="date"
              value={formData.scheduledDate}
              onChange={handleChange}
              min={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          {/* Payment Method */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Payment Method*
            </label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(value) => handleSelectChange('paymentMethod', value as PaymentMethod)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash on completion</SelectItem>
                <SelectItem value="later">Pay later (within 7 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Price Summary */}
          <Card className="bg-muted/50">
            <CardContent className="p-4">
              <div className="flex justify-between mb-2">
                <span>Service:</span>
                <span>{selectedEquipment?.name}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Price per acre:</span>
                <span>₹{selectedEquipment?.pricePerAcre}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span>Acreage:</span>
                <span>{formData.acreage} acres</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total price:</span>
                <span>₹{totalPrice}</span>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => navigate(-1)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </form>
      </div>
    </UserContainer>
  );
};

export default CreateBookingPage;
