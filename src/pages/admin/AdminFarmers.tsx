
import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { FarmerProfile } from '../../types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Search, User, MapPin, Phone } from 'lucide-react';

const AdminFarmers = () => {
  const [farmers, setFarmers] = useState<FarmerProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchFarmers = async () => {
      try {
        setIsLoading(true);
        const farmersRef = collection(db, 'users');
        const q = query(farmersRef, where('role', '==', 'farmer'));
        const snapshot = await getDocs(q);
        
        const farmersList: FarmerProfile[] = [];
        snapshot.forEach((doc) => {
          const farmerData = doc.data() as FarmerProfile;
          farmersList.push({
            id: doc.id,
            ...farmerData,
          });
        });
        
        setFarmers(farmersList);
      } catch (error) {
        console.error('Error fetching farmers:', error);
        toast({
          title: 'Error',
          description: 'Failed to load farmers. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchFarmers();
  }, []);

  const filteredFarmers = farmers.filter(farmer => {
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      (farmer.name?.toLowerCase().includes(query)) ||
      (farmer.village?.toLowerCase().includes(query)) ||
      (farmer.district?.toLowerCase().includes(query)) ||
      (farmer.phone?.includes(query))
    );
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Farmers</h1>
        <div className="relative">
          <Input
            type="text"
            placeholder="Search farmers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-64"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Loading farmers...</p>
        </div>
      ) : filteredFarmers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFarmers.map(farmer => (
            <Card key={farmer.id}>
              <CardHeader>
                <CardTitle className="text-lg">{farmer.name || 'Unnamed Farmer'}</CardTitle>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="h-4 w-4 mr-1" />
                  {farmer.village || 'Unknown location'}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-gray-500" />
                    <span>{farmer.phone}</span>
                  </div>
                  
                  {farmer.farmSize && (
                    <div className="flex items-center">
                      <span className="text-gray-500 mr-2">Farm Size:</span>
                      <span>{farmer.farmSize} acres</span>
                    </div>
                  )}
                  
                  <Button 
                    variant="secondary" 
                    size="sm" 
                    className="w-full mt-4"
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center p-8 bg-muted rounded-lg">
          <p>No farmers found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default AdminFarmers;
