
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { GeoPoint } from '@/types';

// Define marker icon
const defaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface MarkerPosition {
  position: GeoPoint;
  popup?: string;
}

interface LeafletMapProps {
  center: GeoPoint;
  zoom?: number;
  markers?: MarkerPosition[];
  height?: string;
  onMapClick?: (position: GeoPoint) => void;
  mapType?: 'standard' | 'satellite';
}

const LeafletMap: React.FC<LeafletMapProps> = ({
  center,
  zoom = 13,
  markers = [],
  height = '400px',
  onMapClick,
  mapType = 'standard'
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const markerRefs = useRef<L.Marker[]>([]);
  const [mapReady, setMapReady] = useState(false);

  // Initialize map
  useEffect(() => {
    const mapContainer = document.createElement('div');
    mapContainer.style.height = '100%';
    
    const mapElement = document.getElementById('leaflet-map');
    if (mapElement) {
      mapElement.innerHTML = '';
      mapElement.appendChild(mapContainer);
      
      // Create map
      const map = L.map(mapContainer).setView(
        [center.latitude, center.longitude],
        zoom
      );

      // Add map tiles based on type
      if (mapType === 'satellite') {
        // Esri Satellite layer
        L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        }).addTo(map);
      } else {
        // Standard OpenStreetMap layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
      }
      
      // Add click handler
      if (onMapClick) {
        map.on('click', (e) => {
          onMapClick({
            latitude: e.latlng.lat,
            longitude: e.latlng.lng
          });
        });
      }
      
      // Save map reference
      mapRef.current = map;
      setMapReady(true);
      
      // Cleanup
      return () => {
        map.remove();
        mapRef.current = null;
      };
    }
  }, [mapType]); // Re-create map when mapType changes

  // Update markers and center/zoom whenever they change or the map is ready
  useEffect(() => {
    if (!mapRef.current || !mapReady) return;
    
    // Clear existing markers
    markerRefs.current.forEach(marker => marker.remove());
    markerRefs.current = [];
    
    // Add markers
    markers.forEach(({ position, popup }) => {
      const marker = L.marker(
        [position.latitude, position.longitude],
        { icon: defaultIcon }
      ).addTo(mapRef.current!);
      
      if (popup) {
        marker.bindPopup(popup);
      }
      
      markerRefs.current.push(marker);
    });
    
    // Center and zoom
    mapRef.current.setView([center.latitude, center.longitude], zoom);
    
  }, [markers, center, zoom, mapReady]);
  
  return <div id="leaflet-map" style={{ height, width: '100%' }} />;
};

export default LeafletMap;
