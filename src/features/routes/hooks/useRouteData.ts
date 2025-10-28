     import { useState, useEffect } from 'react';
import routesService, { type RoutePlan, type RouteStop as BackendRouteStop } from '../services/routesService';
import outletsService, { type Outlet } from '../../pdv/services/outletsService';
import territoriesService from '../../territories/services/territoriesService';
import type { RouteStop } from '../components/RouteMap';
import { useAuthStore } from '@/core/auth';

interface UseRouteDataReturn {
  routeStops: RouteStop[];
  allOutlets: RouteStop[]; // Tous les PDV du territoire
  routePlan: RoutePlan | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  stats: {
    totalStops: number;
    completed: number;
    remaining: number;
    totalDistance: string;
    estimatedTime: string;
  };
}

// Fonction pour calculer la distance entre deux points GPS (formule de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Rayon de la Terre en km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Convertir les arrêts du backend au format du composant RouteMap
function convertBackendStopsToMapStops(backendStops: BackendRouteStop[]): RouteStop[] {
  return backendStops
    .sort((a, b) => a.seq - b.seq)
    .map((stop, index) => {
      // Déterminer le statut
      let status: 'completed' | 'in_progress' | 'planned' = 'planned';
      if (stop.status === 'VISITED') {
        status = 'completed';
      } else if (index === backendStops.findIndex(s => s.status === 'PLANNED')) {
        status = 'in_progress';
      }

      // Calculer la distance depuis le point précédent
      let distance = '0 km';
      if (index > 0 && stop.outlet?.lat && stop.outlet?.lng) {
        const prevStop = backendStops[index - 1];
        if (prevStop.outlet?.lat && prevStop.outlet?.lng) {
          const dist = calculateDistance(
            prevStop.outlet.lat,
            prevStop.outlet.lng,
            stop.outlet.lat,
            stop.outlet.lng
          );
          distance = `${dist.toFixed(1)} km`;
        }
      }

      return {
        id: parseInt(stop.id) || index + 1,
        name: stop.outlet?.name || 'Point de vente',
        latitude: stop.outlet?.lat || 5.3600,
        longitude: stop.outlet?.lng || -4.0083,
        status,
        time: stop.eta ? new Date(stop.eta).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : `${8 + index}:00`,
        distance,
      };
    });
}

export function useRouteData(): UseRouteDataReturn {
  const user = useAuthStore((state) => state.user);
  const [routePlan, setRoutePlan] = useState<RoutePlan | null>(null);
  const [routeStops, setRouteStops] = useState<RouteStop[]>([]);
  const [allOutlets, setAllOutlets] = useState<RouteStop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRouteData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Charger la route du jour
      const route = await routesService.getTodayRoute();
      
      // Charger les PDV du secteur assigné au vendeur (si c'est un REP)
      let outlets: Outlet[] = [];
      if (user?.role === 'REP' && user?.id) {
        try {
          // Récupérer le secteur assigné au vendeur
          const assignedSectorResponse = await territoriesService.getVendorAssignedSector(user.id);
          const assignedSector = assignedSectorResponse?.data;
          
          if (assignedSector && assignedSector.outletsSector) {
            // Extraire les PDV du secteur assigné
            outlets = assignedSector.outletsSector.map((outletSector: any) => ({
              id: outletSector.outlet.id,
              name: outletSector.outlet.name,
              code: outletSector.outlet.code,
              address: outletSector.outlet.address,
              lat: outletSector.outlet.lat,
              lng: outletSector.outlet.lng,
              status: 'APPROVED' as any,
              territoryId: user.territoryId,
              sectorId: assignedSector.id,
            }));
            
            console.log(`✅ Secteur assigné trouvé: ${assignedSector.name} avec ${outlets.length} PDV`);
          } else {
            console.log('⚠️ Aucun secteur assigné ou aucun PDV dans le secteur');
          }
        } catch (sectorErr: any) {
          console.warn('⚠️ Erreur lors du chargement du secteur assigné:', sectorErr);
          // Si pas de secteur assigné, essayer de charger tous les PDV du territoire
          if (user?.territoryId) {
            try {
              outlets = await outletsService.getAll({ 
                territoryId: user.territoryId,
                status: 'APPROVED'
              });
            } catch (outletErr) {
              console.warn('⚠️ Erreur lors du chargement des PDV du territoire:', outletErr);
            }
          }
        }
      } else if (user?.territoryId) {
        // Pour les autres rôles (ADMIN, SUP), charger tous les PDV du territoire
        try {
          outlets = await outletsService.getAll({ 
            territoryId: user.territoryId,
            status: 'APPROVED'
          });
        } catch (outletErr) {
          console.warn('⚠️ Erreur lors du chargement des PDV:', outletErr);
        }
      }

      // Convertir tous les PDV en format carte (statut 'territory' pour les distinguer)
      const allOutletsConverted: RouteStop[] = outlets
        .filter(outlet => outlet.lat && outlet.lng)
        .map((outlet, index) => ({
          id: parseInt(outlet.id) || index + 1000,
          name: outlet.name,
          latitude: Number(outlet.lat),
          longitude: Number(outlet.lng),
          status: 'territory' as any, // Nouveau statut pour les PDV du territoire
          time: '',
          distance: '',
        }));

      setAllOutlets(allOutletsConverted);
      
      if (route && route.routeStops && route.routeStops.length > 0) {
        setRoutePlan(route);
        const convertedStops = convertBackendStopsToMapStops(route.routeStops);
        setRouteStops(convertedStops);
      } else {
        // Pas de route pour aujourd'hui, mais on affiche quand même les PDV
        setRoutePlan(null);
        setRouteStops([]);
        if (allOutletsConverted.length === 0) {
          if (user?.role === 'REP') {
            setError('Aucun secteur assigné ou aucun point de vente dans votre secteur. Contactez votre administrateur.');
          } else {
            setError('Aucun point de vente disponible dans votre territoire');
          }
        }
        // Ne pas afficher d'erreur si on a des PDV à afficher
      }
    } catch (err) {
      console.error('❌ Erreur lors du chargement de la route:', err);
      setError('Impossible de charger les données. Vérifiez votre connexion.');
      setRoutePlan(null);
      setRouteStops([]);
      setAllOutlets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRouteData();
  }, []);

  // Calculer les statistiques
  const stats = {
    totalStops: routeStops.length,
    completed: routeStops.filter(s => s.status === 'completed').length,
    remaining: routeStops.filter(s => s.status !== 'completed').length,
    totalDistance: routeStops.reduce((acc, stop) => {
      const dist = parseFloat(stop.distance.replace(' km', ''));
      return acc + (isNaN(dist) ? 0 : dist);
    }, 0).toFixed(1) + ' km',
    estimatedTime: `${Math.ceil(routeStops.length * 30 / 60)}h ${(routeStops.length * 30) % 60}min`,
  };

  return {
    routeStops,
    allOutlets,
    routePlan,
    loading,
    error,
    refresh: loadRouteData,
    stats,
  };
}
