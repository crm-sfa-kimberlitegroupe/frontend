import { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix pour les icônes Leaflet avec Vite
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// @ts-expect-error - Fix pour les icônes Leaflet avec Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

interface MapProps {
  latitude: number;
  longitude: number;
  onLocationChange?: (lat: number, lng: number) => void;
  height?: string;
  zoom?: number;
  draggableMarker?: boolean;
  popupText?: string;
}

// Composant pour recentrer la carte quand les coordonnées changent
function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  
  return null;
}

export default function Map({
  latitude,
  longitude,
  onLocationChange,
  height = '300px',
  zoom = 15,
  draggableMarker = false,
  popupText = 'Position du point de vente'
}: MapProps) {
  const markerRef = useRef<L.Marker>(null);
  const position: [number, number] = [latitude, longitude];

  const handleMarkerDragEnd = () => {
    const marker = markerRef.current;
    if (marker && onLocationChange) {
      const newPos = marker.getLatLng();
      onLocationChange(newPos.lat, newPos.lng);
    }
  };

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={position}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker
          position={position}
          draggable={draggableMarker}
          eventHandlers={{
            dragend: handleMarkerDragEnd,
          }}
          ref={markerRef}
        >
          <Popup>{popupText}</Popup>
        </Marker>
        <MapUpdater center={position} zoom={zoom} />
      </MapContainer>
    </div>
  );
}
