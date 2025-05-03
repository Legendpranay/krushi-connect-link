
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { DriverProfile } from '../../types';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle 
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { CheckCircle, XCircle, Search, Phone, MapPin } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AdminDrivers = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const initialFilter = queryParams.get('filter') || 'all';

  const [drivers, setDrivers] = useState<DriverProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<string>(initialFilter);

  useEffect(() => {
    fetchDrivers();
  }, [filter]);

  const fetchDrivers = async () => {
    try {
      setIsLoading(true);
      const driversRef = collection(db, 'users');
      let q = query(driversRef, where('role', '==', 'driver'));
      
      // Apply additional filters
      if (filter === 'pending') {
        q = query(driversRef, 
          where('role', '==', 'driver'),
          where('isVerified', '==', false)
        );
      } else if (filter === 'verified') {
        q = query(driversRef, 
          where('role', '==', 'driver'),
          where('isVerified', '==', true)
        );
      } else if (filter === 'active') {
        q = query(driversRef, 
          where('role', '==', 'driver'),
          where('isVerified', '==', true),
          where('isActive', '==', true)
        );
      } else if (filter === 'inactive') {
        q = query(driversRef, 
          where('role', '==', 'driver'),
          where('isVerified', '==', true),
          where('isActive', '==', false)
        );
      }
      
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

  const handleVerifyDriver = async (driverId: string, isVerified: boolean) => {
    try {
      const driverRef = doc(db, 'users', driverId);
      await updateDoc(driverRef, {
        isVerified: isVerified
      });
      
      // Update local state
      setDrivers(drivers.map(driver => 
        driver.id === driverId ? { ...driver, isVerified } : driver
      ));
      
      toast({
        description: `Driver ${isVerified ? 'approved' : 'rejected'} successfully.`
      });
      
      // Refresh the list if we're filtering
      if (filter === 'pending' || filter === 'verified') {
        fetchDrivers();
      }
    } catch (error) {
      console.error('Error updating driver verification status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update driver status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleToggleActive = async (driverId: string, isActive: boolean) => {
    try {
      const driverRef = doc(db, 'users', driverId);
      await updateDoc(driverRef, {
        isActive: isActive
      });
      
      // Update local state
      setDrivers(drivers.map(driver => 
        driver.id === driverId ? { ...driver, isActive } : driver
      ));
      
      toast({
        description: `Driver ${isActive ? 'activated' : 'deactivated'} successfully.`
      });
      
      // Refresh the list if we're filtering
      if (filter === 'active' || filter === 'inactive') {
        fetchDrivers();
      }
    } catch (error) {
      console.error('Error updating driver active status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update driver status. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const filteredDrivers = drivers.filter(driver => {
    // Skip search if query is empty
    if (!searchQuery.trim()) return true;
    
    // Search in name, village, district, and phone
    const query = searchQuery.toLowerCase();
    return (
      (driver.name?.toLowerCase().includes(query)) ||
      (driver.village?.toLowerCase().includes(query)) ||
      (driver.district?.toLowerCase().includes(query)) ||
      (driver.phone?.includes(query))
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Drivers</h1>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Search drivers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
          
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Drivers</SelectItem>
              <SelectItem value="pending">Pending Verification</SelectItem>
              <SelectItem value="verified">Verified Drivers</SelectItem>
              <SelectItem value="active">Active Drivers</SelectItem>
              <SelectItem value="inactive">Inactive Drivers</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading drivers...</p>
        </div>
      ) : filteredDrivers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrivers.map(driver => (
            <Card key={driver.id} className="shadow-sm">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{driver.name || 'Unnamed Driver'}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <MapPin className="h-4 w-4 mr-1" />
                      {driver.village || 'Unknown location'}
                    </CardDescription>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <div className={`text-sm px-2 py-0.5 rounded-full ${
                      driver.isVerified 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {driver.isVerified ? 'Verified' : 'Pending'}
                    </div>
                    {driver.isVerified && (
                      <div className={`text-xs px-2 py-0.5 rounded-full mt-1 ${
                        driver.isActive 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {driver.isActive ? 'Active' : 'Inactive'}
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="flex items-center mb-2">
                  <Phone className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{driver.phone}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {driver.tractorImage && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">Tractor Image:</div>
                      <img 
                        src={driver.tractorImage} 
                        alt="Tractor" 
                        className="h-24 w-full object-cover rounded" 
                      />
                    </div>
                  )}
                  
                  {driver.licenseImage && (
                    <div>
                      <div className="text-xs text-gray-500 mb-1">License Image:</div>
                      <img 
                        src={driver.licenseImage} 
                        alt="License" 
                        className="h-24 w-full object-cover rounded" 
                      />
                    </div>
                  )}
                </div>
                
                {driver.equipment && driver.equipment.length > 0 && (
                  <div className="mt-4">
                    <div className="text-xs text-gray-500 mb-1">Equipment:</div>
                    <div className="flex flex-wrap gap-1">
                      {driver.equipment.map((item, index) => (
                        <div key={index} className="text-xs bg-gray-100 rounded px-2 py-1">
                          {item.name}: ₹{item.pricePerAcre}/acre
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
              
              <CardFooter className="pt-0">
                <div className="flex justify-between w-full gap-2">
                  {!driver.isVerified ? (
                    <>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="w-1/2"
                        onClick={() => handleVerifyDriver(driver.id, true)}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm"
                        className="w-1/2"
                        onClick={() => handleVerifyDriver(driver.id, false)}
                      >
                        <XCircle className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant={driver.isActive ? "outline" : "default"}
                        size="sm"
                        className="w-1/2"
                        onClick={() => handleToggleActive(driver.id, !driver.isActive)}
                      >
                        {driver.isActive ? 'Deactivate' : 'Activate'}
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-1/2"
                        onClick={() => navigate(`/driver/profile/${driver.id}`)}
                      >
                        View Profile
                      </Button>
                    </>
                  )}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p>No drivers found matching the current filters.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDrivers;
