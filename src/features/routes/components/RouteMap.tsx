import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
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

export interface RouteStop {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  status: 'completed' | 'in_progress' | 'planned' | 'territory' | 'route_planned';
  time: string;
  distance: string;
}

interface RouteMapProps {
  stops: RouteStop[]; // PDV de la route planifiée
  allOutlets?: RouteStop[]; // TOUS les PDV du territoire
  userLocation?: { latitude: number; longitude: number } | null;
  height?: string;
  zoom?: number;
  showRoute?: boolean;
}

// Composant pour ajuster la vue de la carte aux marqueurs
function FitBounds({ stops, userLocation }: { stops: RouteStop[]; userLocation?: { latitude: number; longitude: number } | null }) {
  const map = useMap();

  useEffect(() => {
    const bounds: [number, number][] = stops.map(stop => [stop.latitude, stop.longitude]);
    if (userLocation) {
      bounds.push([userLocation.latitude, userLocation.longitude]);
    }
    
    if (bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [stops, userLocation, map]);

  return null;
}

// Créer des icônes personnalisées pour chaque statut
const createCustomIcon = (status: 'completed' | 'in_progress' | 'planned' | 'territory' | 'user' | 'route_planned') => {
  const colors = {
    completed: '#10b981', // green
    in_progress: '#f59e0b', // orange
    planned: '#9ca3af', // gray
    territory: '#d1d5db', // light gray pour PDV du territoire
    route_planned: '#3b82f6', // blue pour PDV de la route planifiée
    user: '#ef4444', // red pour position utilisateur
  };

  const color = colors[status];

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        width: 32px;
        height: 32px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 14px;
      ">
        ${status === 'user' ? '📍' : status === 'completed' ? '✓' : status === 'in_progress' ? '⏱' : status === 'route_planned' ? '🎯' : status === 'territory' ? '●' : '○'}
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export default function RouteMap({
  stops,
  allOutlets = [],
  userLocation,
  height = '400px',
  zoom = 13,
  showRoute = true,
}: RouteMapProps) {
  const [center, setCenter] = useState<[number, number]>([5.3600, -4.0083]); // Abidjan par défaut

  // Debug: Logs pour voir les données reçues
  console.log('🗺️ RouteMap - Données reçues:', {
    stops: stops.length,
    allOutlets: allOutlets.length,
    outletsData: allOutlets.map(o => ({ name: o.name, lat: o.latitude, lng: o.longitude }))
  });

  useEffect(() => {
    if (stops.length > 0) {
      setCenter([stops[0].latitude, stops[0].longitude]);
    } else if (userLocation) {
      setCenter([userLocation.latitude, userLocation.longitude]);
    }
  }, [stops, userLocation]);

  // Créer les points pour la polyline (route)
  const routePoints: [number, number][] = stops.map(stop => [stop.latitude, stop.longitude]);

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Visité';
      case 'in_progress':
        return 'En cours';
      case 'planned':
        return 'Planifié';
      default:
        return status;
    }
  };

  return (
    <div style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden' }}>
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Ligne de route */}
        {showRoute && routePoints.length > 1 && (
          <Polyline
            positions={routePoints}
            color="#3b82f6"
            weight={3}
            opacity={0.6}
            dashArray="10, 10"
          />
        )}

        {/* Position de l'utilisateur */}
        {userLocation && (
          <Marker
            position={[userLocation.latitude, userLocation.longitude]}
            icon={createCustomIcon('user')}
          >
            <Popup>
              <div className="text-center">
                <p className="font-semibold">Votre position</p>
                <p className="text-xs text-gray-600">Position actuelle</p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* MARQUEUR DE TEST - Pour vérifier que la carte fonctionne */}
        <Marker
          position={[5.308416, -4.040294]}
          icon={createCustomIcon('territory')}
        >
          <Popup>
            <div className="min-w-[200px]">
              <p className="font-medium text-red-600 mb-1">🔴 MARQUEUR DE TEST</p>
              <p className="text-xs">Si vous voyez ceci, la carte fonctionne</p>
            </div>
          </Popup>
        </Marker>

        {/* Marqueurs de TOUS les PDV du territoire */}
        {allOutlets
          .filter(outlet => {
            const lat = Number(outlet.latitude);
            const lng = Number(outlet.longitude);
            const isValid = outlet.latitude != null && outlet.longitude != null && 
                           !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
            if (!isValid) {
              console.log(`🚫 [RouteMap] Outlet ${outlet.name} filtré - coordonnées invalides:`, {
                latitude: outlet.latitude,
                longitude: outlet.longitude,
                lat,
                lng
              });
            }
            return isValid;
          })
          .map((outlet, index) => {
          console.log(`🗺️ Création marqueur PDV: ${outlet.name} à [${outlet.latitude}, ${outlet.longitude}] - Status: ${outlet.status}`);
          console.log(`🔍 Types: latitude=${typeof outlet.latitude}, longitude=${typeof outlet.longitude}`);
          
          // Déterminer l'icône et le z-index selon le statut
          let zIndex = 0;
          let iconColor = '#6B7280'; // Gris par défaut pour territory
          
          if (outlet.status === 'completed') {
            zIndex = 300; // PDV visités au-dessus de tout
            iconColor = '#10B981'; // Vert pour visité
          } else if (outlet.status === 'in_progress') {
            zIndex = 250; // PDV en cours au-dessus des planifiés
            iconColor = '#F59E0B'; // Orange pour en cours
          } else if (outlet.status === 'planned') {
            zIndex = 200; // PDV planifiés au-dessus du territoire
            iconColor = '#3B82F6'; // Bleu pour planifié
          } else if (outlet.status === 'territory') {
            zIndex = 100; // PDV du territoire en arrière-plan
            iconColor = '#6B7280'; // Gris pour territoire
          }
          
          // Déterminer l'emoji pour le popup
          const emoji = outlet.status === 'completed' ? '✅' : 
                       outlet.status === 'in_progress' ? '🔄' :
                       outlet.status === 'planned' ? '🎯' : '🏪';
          
          // Créer une icône personnalisée avec la couleur appropriée
          const customIcon = L.divIcon({
            html: `<div style="
              background-color: ${iconColor};
              width: 20px;
              height: 20px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0,0,0,0.3);
              display: flex;
              align-items: center;
              justify-content: center;
              color: white;
              font-size: 10px;
              font-weight: bold;
            ">${outlet.status === 'completed' ? '✓' : 
                outlet.status === 'in_progress' ? '●' :
                outlet.status === 'planned' ? '!' : '○'}</div>`,
            className: 'custom-outlet-marker',
            iconSize: [20, 20],
            iconAnchor: [10, 10]
          });
          
          return (
            <Marker
              key={`outlet-${outlet.id}-${index}`}
              position={[Number(outlet.latitude), Number(outlet.longitude)]}
              icon={customIcon}
              zIndexOffset={zIndex}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <p className="font-medium text-gray-900 mb-1">
                    {emoji} {outlet.name}
                  </p>
                  <span className={`text-xs px-2 py-1 rounded ${
                    outlet.status === 'completed' ? 'bg-green-100 text-green-800' :
                    outlet.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                    outlet.status === 'planned' ? 'bg-blue-100 text-blue-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {outlet.status === 'completed' ? 'PDV visité' :
                     outlet.status === 'in_progress' ? 'Visite en cours' :
                     outlet.status === 'planned' ? 'PDV planifié' : 
                     'PDV du territoire'}
                  </span>
                  <p className="text-xs text-gray-600 mt-1">
                    Coordonnées: [{Number(outlet.latitude)?.toFixed(6) || 'N/A'}, {Number(outlet.longitude)?.toFixed(6) || 'N/A'}]
                  </p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Marqueurs des arrêts de la route - SEULEMENT si pas déjà dans allOutlets */}
        {stops.length > 0 && allOutlets.length === 0 && stops.map((stop, index) => (
          <Marker
            key={`route-${stop.id}-${index}`}
            position={[stop.latitude, stop.longitude]}
            icon={createCustomIcon(stop.status)}
            zIndexOffset={1000} // Au premier plan
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-sm">Arrêt #{index + 1}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    stop.status === 'completed' ? 'bg-green-100 text-green-800' :
                    stop.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {getStatusLabel(stop.status)}
                  </span>
                </div>
                <p className="font-medium text-gray-900 mb-1">{stop.name}</p>
                <div className="text-xs text-gray-600 space-y-1">
                  <p>🕐 {stop.time}</p>
                  <p>📍 {stop.distance}</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}

        <FitBounds stops={[...allOutlets, ...stops]} userLocation={userLocation} />
      </MapContainer>
    </div>
  );
}
