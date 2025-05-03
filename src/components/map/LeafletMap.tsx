
import { useState, useEffect } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { GeoPoint } from '@/types';

// Fix Leaflet default icon issue
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

// Component to automatically update map view when center prop changes
const ChangeMapView = ({ center, zoom }: { center: [number, number], zoom: number }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
};

interface LeafletMapProps {
  center: GeoPoint;
  zoom?: number;
  markers?: {
    position: GeoPoint;
    popup?: string;
    onClick?: () => void;
  }[];
  onMapClick?: (position: GeoPoint) => void;
  userLocation?: GeoPoint;
  locationRadius?: number;
}

const LeafletMap = ({
  center,
  zoom = 13,
  markers = [],
  onMapClick,
  userLocation,
  locationRadius = 10000 // Default 10km in meters
}: LeafletMapProps) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  
  // Convert GeoPoint to LatLng array format for react-leaflet
  const centerPosition: [number, number] = [center.latitude, center.longitude];

  return (
    <div className="w-full h-full min-h-[300px] rounded-lg overflow-hidden">
      <MapContainer
        center={centerPosition}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        whenReady={() => setMapLoaded(true)}
        onClick={(e: any) => {
          if (onMapClick) {
            const { lat, lng } = e.latlng;
            onMapClick({ latitude: lat, longitude: lng });
          }
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Update view when center changes */}
        <ChangeMapView center={centerPosition} zoom={zoom} />
        
        {/* Show user location with radius */}
        {userLocation && (
          <>
            <Marker 
              position={[userLocation.latitude, userLocation.longitude]}
              icon={L.divIcon({
                className: 'bg-primary rounded-full border-2 border-white shadow-lg',
                iconSize: [30, 30],
                html: '<div class="bg-primary w-full h-full rounded-full flex items-center justify-center text-white">You</div>'
              })}
            >
              <Popup>Your Location</Popup>
            </Marker>
            
            <Circle
              center={[userLocation.latitude, userLocation.longitude]}
              radius={locationRadius}
              fillColor="#3b82f6"
              fillOpacity={0.1}
              stroke={true}
              color="#3b82f6"
            />
          </>
        )}
        
        {/* Display all markers */}
        {markers.map((marker, index) => (
          <Marker
            key={`marker-${index}`}
            position={[marker.position.latitude, marker.position.longitude]}
            eventHandlers={{
              click: marker.onClick
            }}
          >
            {marker.popup && <Popup>{marker.popup}</Popup>}
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default LeafletMap;
