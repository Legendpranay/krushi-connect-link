
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
  mapType?: 'standard' | 'satellite' | 'terrain';
}

// Create a custom hook to handle map center changes
const ChangeCenter = ({ center }: { center: GeoPoint }) => {
  const map = useMap();
  
  useEffect(() => {
    map.setView([center.latitude, center.longitude], map.getZoom());
  }, [center, map]);
  
  return null;
};

// Custom component to handle map clicks
const MapClickHandler = ({ onMapClick }: { onMapClick?: (location: GeoPoint) => void }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!onMapClick) return;
    
    const handleClick = (e: any) => {
      onMapClick({
        latitude: e.latlng.lat,
        longitude: e.latlng.lng,
      });
    };
    
    map.on('click', handleClick);
    
    return () => {
      map.off('click', handleClick);
    };
  }, [map, onMapClick]);
  
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
  mapType = 'standard',
}) => {
  // Use ref to access the map
  const mapRef = useRef(null);

  // Determine which tile URL to use based on mapType
  const getTileUrl = () => {
    switch (mapType) {
      case 'satellite':
        // Using an open satellite imagery layer
        return 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';
      case 'terrain':
        // Using an open terrain layer
        return 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png';
      case 'standard':
      default:
        // Standard OpenStreetMap tiles
        return 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    }
  };

  // Determine which attribution to use based on mapType
  const getTileAttribution = () => {
    switch (mapType) {
      case 'satellite':
        return '&copy; <a href="https://www.arcgis.com/home/item.html?id=10df2279f9684e4a9f6a7f08febac2a9">Esri</a>';
      case 'terrain':
        return '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>';
      case 'standard':
      default:
        return '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';
    }
  };

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
        attribution={getTileAttribution()}
        url={getTileUrl()}
      />
      
      <ChangeCenter center={center} />
      
      {/* Add click handler component */}
      {onMapClick && <MapClickHandler onMapClick={onMapClick} />}
      
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
