import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import { GeoPoint } from '../../types';
import { Icon } from 'leaflet';

// Define props interface
export interface LeafletMapProps {
  center: GeoPoint;
  zoom: number;
  markers?: {
    position: { latitude: number; longitude: number };
    popup: string;
    onClick?: () => void;
  }[];
  onMapClick?: (location: GeoPoint) => void;
  userLocation?: GeoPoint;
  locationRadius?: number;
  interactive?: boolean;
}

// Create a custom hook to handle map center changes
const ChangeCenter = ({ center }: { center: GeoPoint }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.latitude, center.longitude], map.getZoom());
  }, [center, map]);
  
  return null;
};

// Default marker icon
const defaultIcon = new Icon({
  iconUrl: '/path/to/marker-icon.png',
  shadowUrl: '/path/to/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom = 13,
  markers = [],
  onMapClick,
  userLocation,
  locationRadius = 5000,
  interactive = true,
}) => {
  // Use ref to access the map
  const mapRef = useRef(null);

  return (
    <MapContainer
      center={[center.latitude, center.longitude]}
      zoom={zoom}
      style={{ height: '100%', width: '100%' }}
      scrollWheelZoom={interactive}
      dragging={interactive}
      doubleClickZoom={interactive}
      zoomControl={interactive}
      ref={mapRef}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      <ChangeCenter center={center} />
      
      {/* User location circle */}
      {userLocation && (
        <Circle
          center={[userLocation.latitude, userLocation.longitude]}
          pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
          radius={locationRadius}
        />
      )}
      
      {/* User location marker */}
      {userLocation && (
        <Marker position={[userLocation.latitude, userLocation.longitude]}>
          <Popup>Your location</Popup>
        </Marker>
      )}
      
      {/* Other markers */}
      {markers.map((marker, index) => (
        <Marker
          key={index}
          position={[marker.position.latitude, marker.position.longitude]}
          eventHandlers={{
            click: () => {
              if (marker.onClick) marker.onClick();
            },
          }}
        >
          <Popup>{marker.popup}</Popup>
        </Marker>
      ))}
    </MapContainer>
  );
};

export default LeafletMap;
