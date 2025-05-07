
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import LeafletMap from '../map/LeafletMap';
import { useAuth } from '@/contexts/AuthContext';
import { GeoPoint } from '@/types';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useLanguage } from '@/contexts/LanguageContext';

interface AddFarmLocationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

const AddFarmLocationModal: React.FC<AddFarmLocationModalProps> = ({ 
  open, 
  onOpenChange,
  onSuccess
}) => {
  const { userProfile } = useAuth();
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [locationName, setLocationName] = useState('');
  const [farmSize, setFarmSize] = useState<number>(0);
  const [selectedLocation, setSelectedLocation] = useState<GeoPoint | null>(null);

  const handleLocationSelect = (location: GeoPoint) => {
    console.log("New farm location selected:", location);
    setSelectedLocation(location);
  };

  const handleSave = async () => {
    if (!userProfile?.id) {
      toast({
        title: "Error",
        description: "You must be logged in to add a farm location",
        variant: "destructive"
      });
      return;
    }

    if (!locationName.trim()) {
      toast({
        title: "Error",
        description: "Please provide a name for this farm location",
        variant: "destructive"
      });
      return;
    }

    if (!selectedLocation) {
      toast({
        title: "Error",
        description: "Please select a location on the map",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Add the farm location to the farmLocations collection
      await addDoc(collection(db, 'farmLocations'), {
        userId: userProfile.id,
        name: locationName,
        location: selectedLocation,
        size: farmSize || 0,
        createdAt: serverTimestamp()
      });

      toast({
        description: "Farm location added successfully"
      });

      // Reset form
      setLocationName('');
      setFarmSize(0);
      setSelectedLocation(null);
      
      // Close modal and trigger success callback
      onOpenChange(false);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error adding farm location:", error);
      toast({
        title: "Error",
        description: "Failed to add farm location. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Farm Location</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="farmName">Farm Name</Label>
            <Input 
              id="farmName"
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="e.g. North Field"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="farmSize">Size (acres)</Label>
            <Input 
              id="farmSize"
              type="number"
              min="0"
              step="0.5"
              value={farmSize}
              onChange={(e) => setFarmSize(parseFloat(e.target.value))}
            />
          </div>
          
          <div className="space-y-2">
            <Label>Select Location</Label>
            <div className="h-[250px] border rounded-md overflow-hidden">
              <LeafletMap
                center={selectedLocation || (userProfile?.farmLocation || {latitude: 20.5937, longitude: 78.9629})}
                zoom={selectedLocation ? 15 : 5}
                onMapClick={handleLocationSelect}
                markers={selectedLocation ? [
                  {
                    position: selectedLocation,
                    popup: locationName || "New Farm Location"
                  }
                ] : []}
              />
            </div>
            {selectedLocation && (
              <p className="text-xs text-green-600">
                Location selected at lat: {selectedLocation.latitude.toFixed(6)}, lng: {selectedLocation.longitude.toFixed(6)}
              </p>
            )}
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                Saving...
              </>
            ) : "Save Location"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddFarmLocationModal;
