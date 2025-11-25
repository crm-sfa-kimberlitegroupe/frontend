import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-draw/dist/leaflet.draw.css';
import 'leaflet-draw';
import { Icon } from '../../../core/ui/Icon';

interface TerritoryDrawMapProps {
  onPolygonDrawn: (geojson: any, center: [number, number], area: number) => void;
  initialCenter?: [number, number];
  initialZoom?: number;
  existingGeometry?: any; // Géométrie à afficher sur la carte
}

export const TerritoryDrawMap: React.FC<TerritoryDrawMapProps> = ({
  onPolygonDrawn,
  initialCenter = [5.3600, -4.0083], // Abidjan, Côte d'Ivoire par défaut
  initialZoom = 11,
  existingGeometry
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const drawnItems = useRef<L.FeatureGroup>(new L.FeatureGroup());
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    // Initialiser la carte
    const map = L.map(mapContainer.current).setView(initialCenter, initialZoom);
    mapRef.current = map;

    // Ajouter le fond de carte OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    }).addTo(map);

    // Ajouter le groupe pour les dessins
    drawnItems.current.addTo(map);

    // Options de dessin
    const drawControl = new L.Control.Draw({
      position: 'topright',
      draw: {
        polygon: {
          allowIntersection: false,
          showArea: true,
          shapeOptions: {
            color: '#3B82F6',
            fillColor: '#3B82F6',
            fillOpacity: 0.2,
            weight: 3
          }
        },
        polyline: false,
        circle: false,
        rectangle: false,
        marker: false,
        circlemarker: false
      },
      edit: {
        featureGroup: drawnItems.current,
        remove: true
      }
    });

    map.addControl(drawControl);

    // Événement: Polygone créé
    map.on(L.Draw.Event.CREATED, (e: any) => {
      const layer = e.layer;
      drawnItems.current.clearLayers(); // Supprimer l'ancien
      drawnItems.current.addLayer(layer); // Ajouter le nouveau

      // Obtenir le GeoJSON
      const geojson = layer.toGeoJSON();

      // Calculer le centre
      const bounds = layer.getBounds();
      const center: [number, number] = [
        bounds.getCenter().lat,
        bounds.getCenter().lng
      ];

      // Calculer la surface (en m²)
      const areaInSquareMeters = L.GeometryUtil.geodesicArea(layer.getLatLngs()[0]);
      const areaInKm2 = areaInSquareMeters / 1_000_000;

      setIsDrawing(false);
      onPolygonDrawn(geojson.geometry, center, areaInKm2);
    });

    // Événement: Dessin supprimé
    map.on(L.Draw.Event.DELETED, () => {
      onPolygonDrawn(null, [0, 0], 0);
    });

    // Événement: Début du dessin
    map.on(L.Draw.Event.DRAWSTART, () => {
      setIsDrawing(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialCenter, initialZoom, onPolygonDrawn]);

  // Afficher la géométrie existante sur la carte
  useEffect(() => {
    if (!mapRef.current || !existingGeometry) {
      console.log('Carte ou géométrie manquante:', { 
        hasMap: !!mapRef.current, 
        hasGeometry: !!existingGeometry 
      });
      return;
    }

    console.log('Affichage de la géométrie sur la carte:', existingGeometry);

    // Nettoyer les anciens dessins
    drawnItems.current.clearLayers();

    try {
      // Créer le layer depuis le GeoJSON
      const layer = L.geoJSON(existingGeometry, {
        style: {
          color: '#3B82F6',
          fillColor: '#3B82F6',
          fillOpacity: 0.2,
          weight: 3
        }
      });

      console.log('Layer créé:', layer);

      // Ajouter au groupe
      let layerCount = 0;
      layer.eachLayer((l) => {
        drawnItems.current.addLayer(l);
        layerCount++;
      });

      console.log(`${layerCount} layer(s) ajouté(s) à la carte`);

      // Zoomer sur la géométrie
      const bounds = layer.getBounds();
      console.log('🔍 Bounds:', bounds);
      
      if (bounds.isValid()) {
        mapRef.current.fitBounds(bounds, { padding: [50, 50] });
        console.log('Zoom effectué sur la géométrie');
      } else {
        console.warn(' Bounds invalides');
      }
    } catch (error) {
      console.error('Erreur affichage géométrie:', error);
    }
  }, [existingGeometry]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="w-full h-full rounded-lg" />
      
      {/* Instructions flottantes */}
      <div className="absolute top-4 left-4 bg-white p-4 rounded-lg shadow-lg max-w-sm z-[1000]">
        <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
          <Icon name="edit" variant="primary" size="md" />
          Instructions
        </h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span>Cliquez sur l'icône de polygone en haut à droite</span>
          </li>
          <li className="flex items-start gap-2">
            <span>Cliquez sur la carte pour définir les sommets</span>
          </li>
          <li className="flex items-start gap-2">
            <span>Double-cliquez pour fermer le polygone</span>
          </li>
          <li className="flex items-start gap-2">
            <Icon name="trash" size="sm" variant="grey" className="mt-0.5 flex-shrink-0" />
            <span>Utilisez la corbeille pour recommencer</span>
          </li>
        </ol>
        
        {isDrawing && (
          <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded flex items-center gap-2">
            <div className="animate-pulse w-2 h-2 bg-blue-600 rounded-full"></div>
            <p className="text-xs text-blue-800 font-medium">
              Dessinez le territoire sur la carte...
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
