import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, DrawingManager } from '@react-google-maps/api';
import { Icon } from '../../../core/ui/Icon';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || 'VOTRE_CLE_API_ICI';

interface GoogleTerritoryMapProps {
  onPolygonDrawn: (geojson: any, center: [number, number], area: number) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  existingGeometry?: any; // Géométrie à afficher sur la carte
}

const libraries: ("drawing" | "places" | "geometry")[] = ["drawing", "places", "geometry"];

export const GoogleTerritoryMap: React.FC<GoogleTerritoryMapProps> = ({
  onPolygonDrawn,
  initialCenter = [5.3600, -4.0083], // Abidjan par défaut
  initialZoom = 11,
  existingGeometry
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [drawnPolygon, setDrawnPolygon] = useState<google.maps.Polygon | null>(null);
  const [existingPolygon, setExistingPolygon] = useState<google.maps.Polygon | null>(null);

  const mapContainerStyle = {
    width: '100%',
    height: '100%'
  };

  const center = {
    lat: initialCenter[0],
    lng: initialCenter[1]
  };

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    console.log('✅ Google Map chargée');
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Afficher la géométrie existante
  useEffect(() => {
    if (!map || !existingGeometry) {
      console.log('⚠️ Carte ou géométrie manquante');
      return;
    }

    console.log('🎨 Affichage de la géométrie existante:', existingGeometry);

    // Supprimer l'ancien polygone s'il existe
    if (existingPolygon) {
      existingPolygon.setMap(null);
    }

    try {
      // Convertir GeoJSON en coordonnées Google Maps
      const coordinates = existingGeometry.coordinates[0].map((coord: number[]) => ({
        lat: coord[1],
        lng: coord[0]
      }));

      // Créer le polygone
      const polygon = new google.maps.Polygon({
        paths: coordinates,
        strokeColor: '#3B82F6',
        strokeOpacity: 1,
        strokeWeight: 3,
        fillColor: '#3B82F6',
        fillOpacity: 0.2,
        editable: false,
        draggable: false
      });

      polygon.setMap(map);
      setExistingPolygon(polygon);

      // Zoomer sur le polygone
      const bounds = new google.maps.LatLngBounds();
      coordinates.forEach((coord: google.maps.LatLngLiteral) => {
        bounds.extend(coord);
      });
      map.fitBounds(bounds);

      console.log('✅ Polygone affiché et zoomé');

    } catch (error) {
      console.error('❌ Erreur affichage géométrie:', error);
    }
  }, [map, existingGeometry]);

  // Gérer le dessin d'un nouveau polygone
  const onPolygonComplete = useCallback((polygon: google.maps.Polygon) => {
    console.log('🖊️ Nouveau polygone dessiné');

    // Supprimer l'ancien polygone dessiné
    if (drawnPolygon) {
      drawnPolygon.setMap(null);
    }

    setDrawnPolygon(polygon);

    // Extraire les coordonnées
    const path = polygon.getPath();
    const coordinates: number[][] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push([point.lng(), point.lat()]);
    }

    // Fermer le polygone
    if (coordinates.length > 0) {
      coordinates.push(coordinates[0]);
    }

    // Convertir en GeoJSON
    const geojson = {
      type: 'Polygon',
      coordinates: [coordinates]
    };

    // Calculer le centre
    const bounds = new google.maps.LatLngBounds();
    path.forEach((point) => {
      bounds.extend(point);
    });
    const center = bounds.getCenter();
    const centerCoords: [number, number] = [center.lat(), center.lng()];

    // Calculer la superficie approximative (en km²)
    const area = google.maps.geometry.spherical.computeArea(path) / 1000000;

    console.log('📊 Données du polygone:', { geojson, center: centerCoords, area });

    // Notifier le parent
    onPolygonDrawn(geojson, centerCoords, area);

  }, [drawnPolygon, onPolygonDrawn]);

  return (
    <div className="relative w-full h-full">
      <LoadScript
        googleMapsApiKey={GOOGLE_MAPS_API_KEY}
        libraries={libraries}
        loadingElement={
          <div className="flex items-center justify-center h-full bg-gray-100">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-gray-600">Chargement de Google Maps...</p>
            </div>
          </div>
        }
      >
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={center}
          zoom={initialZoom}
          onLoad={onLoad}
          onUnmount={onUnmount}
          options={{
            mapTypeControl: true,
            streetViewControl: false,
            fullscreenControl: true,
          }}
        >
          {map && (
            <DrawingManager
              onPolygonComplete={onPolygonComplete}
              options={{
                drawingControl: true,
                drawingControlOptions: {
                  position: window.google?.maps?.ControlPosition?.TOP_CENTER || 2,
                  drawingModes: [
                    window.google?.maps?.drawing?.OverlayType?.POLYGON || 'polygon',
                  ]
                },
                polygonOptions: {
                  fillColor: '#3B82F6',
                  fillOpacity: 0.3,
                  strokeWeight: 2,
                  strokeColor: '#3B82F6',
                  clickable: true,
                  editable: true,
                  zIndex: 1
                }
              }}
            />
          )}
        </GoogleMap>
      </LoadScript>

      {/* Instructions */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm z-10">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <Icon name="map" variant="primary" size="md" />
          Instructions
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span>Cliquez sur l'icône de polygone en haut</span>
          </li>
          <li className="flex items-start gap-2">
            <span>Cliquez sur la carte pour définir les sommets</span>
          </li>
          <li className="flex items-start gap-2">
            <span>Cliquez sur le premier point pour fermer</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="edit" size="sm" variant="grey" className="mt-0.5 flex-shrink-0" />
            <span>Vous pouvez éditer en glissant les points</span>
          </li>
        </ol>
      </div>
    </div>
  );
};
