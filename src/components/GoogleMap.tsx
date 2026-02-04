import React, { useEffect, useRef, useState } from 'react';

interface MapMarker {
  id: string;
  position: { lat: number; lng: number };
  title: string;
  color?: 'green' | 'amber' | 'red';
  onClick?: () => void;
}

interface GoogleMapProps {
  center?: { lat: number; lng: number };
  zoom?: number;
  markers?: MapMarker[];
  onMapClick?: (lat: number, lng: number) => void;
  className?: string;
}

declare global {
  interface Window {
    google: any;
  }
}

const GoogleMap: React.FC<GoogleMapProps> = ({
  center = { lat: 19.0760, lng: 72.8777 }, // Default: Mumbai
  zoom = 13,
  markers = [],
  onMapClick,
  className = 'w-full h-96'
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [googleMarkers, setGoogleMarkers] = useState<any[]>([]);

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || map) return;

    const checkGoogleMaps = setInterval(() => {
      if (window.google && window.google.maps) {
        clearInterval(checkGoogleMaps);

        const newMap = new window.google.maps.Map(mapRef.current!, {
          center,
          zoom,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          zoomControl: true,
        });

        // Add click listener if provided
        if (onMapClick) {
          newMap.addListener('click', (e: any) => {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            onMapClick(lat, lng);
          });
        }

        setMap(newMap);
      }
    }, 100);

    return () => clearInterval(checkGoogleMaps);
  }, []);

  // Update markers
  useEffect(() => {
    if (!map) return;

    // Clear existing markers
    googleMarkers.forEach(marker => marker.setMap(null));

    // Add new markers
    const newMarkers = markers.map(markerData => {
      const markerColor = getMarkerColor(markerData.color);

      const marker = new window.google.maps.Marker({
        position: markerData.position,
        map,
        title: markerData.title,
        icon: {
          path: window.google.maps.SymbolPath.CIRCLE,
          scale: 10,
          fillColor: markerColor,
          fillOpacity: 1,
          strokeColor: '#fff',
          strokeWeight: 2,
        },
      });

      if (markerData.onClick) {
        marker.addListener('click', markerData.onClick);
      }

      return marker;
    });

    setGoogleMarkers(newMarkers);

    // Cleanup
    return () => {
      newMarkers.forEach(marker => marker.setMap(null));
    };
  }, [map, markers]);

  // Update center when it changes
  useEffect(() => {
    if (map && center) {
      map.setCenter(center);
    }
  }, [map, center]);

  const getMarkerColor = (color?: 'green' | 'amber' | 'red'): string => {
    switch (color) {
      case 'green':
        return '#4CAF50';
      case 'amber':
        return '#FFC107';
      case 'red':
        return '#FF7043';
      default:
        return '#4CAF50';
    }
  };

  return (
    <div className={className}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />
    </div>
  );
};

export default GoogleMap;
