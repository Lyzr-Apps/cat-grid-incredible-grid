# Google Maps Integration Guide

## Setup Instructions

### 1. Get Your Google Maps API Key

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Maps JavaScript API**
4. Create credentials (API Key)
5. Copy your API key

### 2. Add Your API Key

Open `/app/project/index.html` and replace `YOUR_GOOGLE_MAPS_API_KEY` with your actual API key:

```html
<script src="https://maps.googleapis.com/maps/api/js?key=YOUR_ACTUAL_API_KEY&libraries=places,marker" async defer></script>
```

### 3. Using the GoogleMap Component

The `GoogleMap` component is located at `/src/components/GoogleMap.tsx`

#### Basic Usage

```tsx
import GoogleMap from '../components/GoogleMap';

function MyComponent() {
  return (
    <GoogleMap
      center={{ lat: 19.0760, lng: 72.8777 }}
      zoom={13}
    />
  );
}
```

#### With Markers

```tsx
import GoogleMap from '../components/GoogleMap';

function MyComponent() {
  const markers = [
    {
      id: 'zone-1',
      position: { lat: 19.0760, lng: 72.8777 },
      title: 'Zone A - Fed Today',
      color: 'green' as const,
      onClick: () => console.log('Zone A clicked')
    },
    {
      id: 'zone-2',
      position: { lat: 19.0800, lng: 72.8800 },
      title: 'Zone B - Due Soon',
      color: 'amber' as const
    },
    {
      id: 'zone-3',
      position: { lat: 19.0700, lng: 72.8700 },
      title: 'Zone C - Overdue',
      color: 'red' as const
    }
  ];

  return (
    <GoogleMap
      center={{ lat: 19.0760, lng: 72.8777 }}
      zoom={13}
      markers={markers}
      className="w-full h-[500px]"
    />
  );
}
```

#### With Click Handler

```tsx
import GoogleMap from '../components/GoogleMap';
import { useState } from 'react';

function MyComponent() {
  const [selectedLocation, setSelectedLocation] = useState<{lat: number, lng: number} | null>(null);

  const handleMapClick = (lat: number, lng: number) => {
    setSelectedLocation({ lat, lng });
    console.log('Clicked location:', lat, lng);
  };

  return (
    <div>
      <GoogleMap
        center={{ lat: 19.0760, lng: 72.8777 }}
        zoom={13}
        onMapClick={handleMapClick}
      />
      {selectedLocation && (
        <p>Selected: {selectedLocation.lat}, {selectedLocation.lng}</p>
      )}
    </div>
  );
}
```

## Component Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `center` | `{ lat: number, lng: number }` | `{ lat: 19.0760, lng: 72.8777 }` | Map center coordinates |
| `zoom` | `number` | `13` | Zoom level (1-20) |
| `markers` | `MapMarker[]` | `[]` | Array of markers to display |
| `onMapClick` | `(lat: number, lng: number) => void` | - | Callback when map is clicked |
| `className` | `string` | `'w-full h-96'` | Tailwind classes for container |

## MapMarker Interface

```typescript
interface MapMarker {
  id: string;                          // Unique identifier
  position: { lat: number; lng: number }; // Marker location
  title: string;                       // Marker title (tooltip)
  color?: 'green' | 'amber' | 'red';  // Marker color
  onClick?: () => void;                // Click handler
}
```

## Example: Feeder Dashboard Integration

Update your Feeder Dashboard to show zones on the map:

```tsx
import GoogleMap from '../components/GoogleMap';

// Inside your component
const zoneMarkers = uncoveredZones.map((zone, index) => ({
  id: zone.zone_id,
  position: {
    lat: 19.0760 + (index * 0.01), // Use actual coordinates from your data
    lng: 72.8777 + (index * 0.01)
  },
  title: `Zone ${zone.zone_id} - ${zone.urgency}`,
  color: zone.urgency === 'high' ? 'red' : zone.urgency === 'medium' ? 'amber' : 'green',
  onClick: () => handleZoneClick(zone.zone_id)
}));

return (
  <GoogleMap
    center={{ lat: 19.0760, lng: 72.8777 }}
    zoom={12}
    markers={zoneMarkers}
    className="w-full h-[600px]"
  />
);
```

## Color Coding

The map uses CatCare City's color palette:
- **Green (#4CAF50)**: Fed zones, positive status
- **Amber (#FFC107)**: Due soon, warnings
- **Red (#FF7043)**: Overdue zones, emergencies

## Tips

1. **API Key Security**: For production, restrict your API key by domain in Google Cloud Console
2. **Coordinates**: Store actual zone coordinates in your database/state
3. **Performance**: The component handles marker updates efficiently
4. **Custom Styles**: Use the `className` prop to adjust map dimensions
5. **User Location**: Use browser's Geolocation API to get user's current location

## Browser Geolocation Example

```tsx
const getUserLocation = () => {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        console.log('User location:', latitude, longitude);
        // Update map center or add user marker
      },
      (error) => console.error('Error getting location:', error)
    );
  }
};
```
