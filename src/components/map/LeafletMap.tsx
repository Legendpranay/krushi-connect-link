
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoPoint, DriverProfile } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

// Fix Leaflet default icon issue
// We need to fix the marker icon paths
useEffect(() => {
  delete L.Icon.Default.prototype._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  });
}, []);

// MapUpdater component to update map view when location changes
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center);
  }, [center, map]);
  return null;
};

interface LeafletMapProps {
  initialLocation: GeoPoint;
  onLocationSelect: (location: { latitude: number; longitude: number; address: string }) => void;
  showMarkers?: boolean;
  markers?: {
    id: string;
    latitude: number;
    longitude: number;
    title: string;
    onClick?: () => void;
  }[];
  drivers?: DriverProfile[];
  height?: string;
  maxDistance?: number;
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  initialLocation,
  onLocationSelect,
  showMarkers = false,
  markers = [],
  drivers = [],
  height = '400px',
  maxDistance = 10, // 10km default radius
}) => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [center, setCenter] = useState<[number, number]>([
    initialLocation.latitude, 
    initialLocation.longitude
  ]);
  const [address, setAddress] = useState<string>('');

  // Custom icon for farmers and drivers
  const farmerIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const driverIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  // Handle map click to update location
  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    const { lat, lng } = e.latlng;
    setCenter([lat, lng]);
    
    // Reverse geocode to get address (using Nominatim OpenStreetMap service)
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      const addressStr = data.display_name || 'Unknown location';
      setAddress(addressStr);
      
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: addressStr
      });
    } catch (error) {
      console.error('Error fetching address:', error);
      onLocationSelect({
        latitude: lat,
        longitude: lng,
        address: 'Location selected'
      });
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

  return (
    <div style={{ height, width: '100%' }}>
      <MapContainer 
        center={center} 
        zoom={13} 
        style={{ height: '100%', width: '100%', borderRadius: '8px' }}
        whenCreated={(map) => {
          map.on('click', handleMapClick);
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <MapUpdater center={center} />
        
        {/* User's location marker */}
        <Marker 
          position={center} 
          icon={userProfile?.role === 'driver' ? driverIcon : farmerIcon}
        >
          <Popup>
            <div className="font-medium">Your Location</div>
            <div className="text-sm">{address || 'Selected Location'}</div>
          </Popup>
        </Marker>
        
        {/* Show search radius circle */}
        <Circle 
          center={center}
          radius={maxDistance * 1000} // Convert km to meters
          pathOptions={{ fillColor: 'blue', fillOpacity: 0.1, color: 'blue', weight: 1 }}
        />

        {/* Show other markers if enabled */}
        {showMarkers && markers.map(marker => (
          <Marker 
            key={marker.id}
            position={[marker.latitude, marker.longitude]}
            icon={driverIcon}
            eventHandlers={{
              click: marker.onClick,
            }}
          >
            <Popup>
              <div className="font-medium">{marker.title}</div>
            </Popup>
          </Marker>
        ))}

        {/* Show driver markers */}
        {drivers.map(driver => {
          if (!driver.location) return null;
          
          // Check if driver is within the maxDistance
          const distance = calculateDistance(
            center[0], 
            center[1], 
            driver.location.latitude, 
            driver.location.longitude
          );
          
          if (distance && distance > maxDistance) return null;
          
          return (
            <Marker
              key={driver.id}
              position={[driver.location.latitude, driver.location.longitude]}
              icon={driverIcon}
            >
              <Popup>
                <div className="p-2">
                  <div className="font-medium">{driver.name}</div>
                  <div className="text-sm text-gray-500">
                    {driver.village} • {distance ? `${distance.toFixed(1)}km` : 'Distance unknown'}
                  </div>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="text-sm ml-1">
                      {driver.rating?.toFixed(1) || '4.5'}
                    </span>
                  </div>
                  <div className="mt-2 space-y-2">
                    <Button 
                      size="sm" 
                      className="w-full"
                      onClick={() => navigate(`/driver/profile/${driver.id}`)}
                    >
                      View Profile
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="w-full"
                      onClick={() => navigate(`/booking/new/${driver.id}`)}
                    >
                      Book Now
                    </Button>
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
