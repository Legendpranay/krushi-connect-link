
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { toast } from '@/components/ui/use-toast';

// You'll need to add your Mapbox access token
const MAPBOX_TOKEN = "YOUR_MAPBOX_ACCESS_TOKEN"; // Replace this with your actual token

interface LocationMapProps {
  initialLocation?: { latitude: number; longitude: number };
  onLocationSelect?: (location: { latitude: number; longitude: number; address: string }) => void;
  showMarkers?: boolean;
  markers?: Array<{
    id: string;
    latitude: number;
    longitude: number;
    title?: string;
    onClick?: () => void;
  }>;
  height?: string;
  interactive?: boolean;
}

const LocationMap: React.FC<LocationMapProps> = ({
  initialLocation = { latitude: 19.0760, longitude: 72.8777 }, // Mumbai default
  onLocationSelect,
  showMarkers = false,
  markers = [],
  height = '400px',
  interactive = true,
}) => {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markerRefs = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const userMarker = useRef<mapboxgl.Marker | null>(null);
  const [mapboxTokenSet, setMapboxTokenSet] = useState(!!MAPBOX_TOKEN && MAPBOX_TOKEN !== "YOUR_MAPBOX_ACCESS_TOKEN");
  const [tokenInput, setTokenInput] = useState("");
  const [address, setAddress] = useState<string>("");

  const initializeMap = (token: string) => {
    if (!mapContainer.current) return;
    
    try {
      mapboxgl.accessToken = token;
      
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [initialLocation.longitude, initialLocation.latitude],
        zoom: 12,
        attributionControl: false
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      if (interactive) {
        map.current.addControl(new mapboxgl.GeolocateControl({
          positionOptions: {
            enableHighAccuracy: true
          },
          trackUserLocation: true
        }));
      }

      // Add user marker for initial location
      userMarker.current = new mapboxgl.Marker({ color: '#FF0000' })
        .setLngLat([initialLocation.longitude, initialLocation.latitude])
        .addTo(map.current);

      // Set up click handler for location selection
      if (interactive && onLocationSelect) {
        map.current.on('click', async (e) => {
          const { lng, lat } = e.lngLat;
          
          // Update marker position
          if (userMarker.current) {
            userMarker.current.setLngLat([lng, lat]);
          }
          
          // Reverse geocode to get address
          try {
            const response = await fetch(
              `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${mapboxgl.accessToken}`
            );
            const data = await response.json();
            const placeName = data.features[0]?.place_name || "Unknown location";
            setAddress(placeName);
            
            // Call the callback with location data
            onLocationSelect({
              latitude: lat,
              longitude: lng,
              address: placeName
            });
          } catch (error) {
            console.error("Error getting address:", error);
            toast({
              title: "Error",
              description: "Failed to get address for selected location",
              variant: "destructive"
            });
          }
        });
      }
      
      // Add markers if provided
      if (showMarkers && markers.length > 0) {
        markers.forEach(marker => {
          const el = document.createElement('div');
          el.className = 'custom-marker';
          el.style.width = '30px';
          el.style.height = '30px';
          el.style.backgroundImage = 'url(https://img.icons8.com/color/48/000000/tractor.png)';
          el.style.backgroundSize = 'cover';
          el.style.borderRadius = '50%';
          el.style.cursor = 'pointer';
          
          const popup = new mapboxgl.Popup({ offset: 25 })
            .setHTML(`<strong>${marker.title || 'Driver'}</strong>`);
          
          const mapMarker = new mapboxgl.Marker(el)
            .setLngLat([marker.longitude, marker.latitude])
            .setPopup(popup)
            .addTo(map.current);
            
          if (marker.onClick) {
            el.addEventListener('click', () => {
              marker.onClick?.();
            });
          }
          
          markerRefs.current[marker.id] = mapMarker;
        });
      }
      
      return true;
    } catch (error) {
      console.error("Error initializing map:", error);
      toast({
        title: "Error",
        description: "Failed to initialize map. Please check your Mapbox token.",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (mapboxTokenSet) {
      initializeMap(MAPBOX_TOKEN);
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxTokenSet]);

  // Update markers when the markers prop changes
  useEffect(() => {
    if (!map.current || !showMarkers) return;
    
    // Clear existing markers
    Object.values(markerRefs.current).forEach(marker => marker.remove());
    markerRefs.current = {};
    
    // Add new markers
    if (markers.length > 0 && map.current) {
      markers.forEach(marker => {
        const el = document.createElement('div');
        el.className = 'custom-marker';
        el.style.width = '30px';
        el.style.height = '30px';
        el.style.backgroundImage = 'url(https://img.icons8.com/color/48/000000/tractor.png)';
        el.style.backgroundSize = 'cover';
        el.style.borderRadius = '50%';
        el.style.cursor = 'pointer';
        
        const popup = new mapboxgl.Popup({ offset: 25 })
          .setHTML(`<strong>${marker.title || 'Driver'}</strong>`);
        
        const mapMarker = new mapboxgl.Marker(el)
          .setLngLat([marker.longitude, marker.latitude])
          .setPopup(popup)
          .addTo(map.current);
          
        if (marker.onClick) {
          el.addEventListener('click', () => {
            marker.onClick?.();
          });
        }
        
        markerRefs.current[marker.id] = mapMarker;
      });
    }
  }, [markers, showMarkers]);

  // Handle token input and initialization
  const handleSetToken = () => {
    if (tokenInput.trim() === "") {
      toast({
        title: "Error",
        description: "Please enter a valid Mapbox token",
        variant: "destructive"
      });
      return;
    }
    
    const success = initializeMap(tokenInput);
    if (success) {
      setMapboxTokenSet(true);
      // Save token to localStorage for persistence
      localStorage.setItem('mapbox_token', tokenInput);
    }
  };

  // Try to load token from localStorage
  useEffect(() => {
    if (!mapboxTokenSet) {
      const savedToken = localStorage.getItem('mapbox_token');
      if (savedToken) {
        setTokenInput(savedToken);
        const success = initializeMap(savedToken);
        if (success) {
          setMapboxTokenSet(true);
        }
      }
    }
  }, []);

  if (!mapboxTokenSet) {
    return (
      <div className="border rounded-md p-4">
        <h3 className="font-medium mb-2">Map Configuration Required</h3>
        <p className="text-sm text-gray-500 mb-4">
          To use the map feature, please enter your Mapbox access token.
          You can get one from <a href="https://account.mapbox.com/" target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">mapbox.com</a>
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={tokenInput}
            onChange={(e) => setTokenInput(e.target.value)}
            placeholder="Enter Mapbox token"
            className="flex-1 px-3 py-2 border rounded-md"
          />
          <button
            onClick={handleSetToken}
            className="bg-primary text-white px-4 py-2 rounded-md"
          >
            Set Token
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div 
        ref={mapContainer} 
        style={{ height, width: '100%', borderRadius: '0.5rem' }}
        className="border"
      />
      {address && interactive && (
        <div className="mt-2 text-sm text-gray-500">
          Selected location: {address}
        </div>
      )}
    </div>
  );
};

export default LocationMap;
