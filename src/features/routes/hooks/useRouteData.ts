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
    let assignedSector: any = null; // Déclaré ici pour être accessible partout
    
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Chargement des données de route...');
      console.log('👤 Utilisateur connecté:', user);

      // Charger la route du jour
      const route = await routesService.getTodayRoute();
      console.log('📅 Route du jour:', route);
      
      // Charger les PDV du secteur assigné au vendeur (si c'est un REP)
      let outlets: Outlet[] = [];
      if (user?.role === 'REP' && user?.id) {
        console.log(`🔍 Récupération des PDV du vendeur ${user.id}...`);
        try {
          // Utiliser la même méthode que dans la page visits qui fonctionne
          const vendorData = await territoriesService.getVendorOutlets(user.id);
          console.log('🏢 Données vendeur récupérées:', vendorData);
          
          if (vendorData && vendorData.outlets) {
            // Convertir les outlets au bon format
            outlets = vendorData.outlets.map(outlet => ({
              id: outlet.id,
              name: outlet.name,
              code: outlet.code,
              channel: outlet.channel || 'UNKNOWN',
              address: outlet.address || '',
              lat: outlet.lat,
              lng: outlet.lng,
              status: (outlet.status || 'APPROVED') as 'PENDING' | 'APPROVED' | 'REJECTED',
              territoryId: user.territoryId || '',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }));
            assignedSector = vendorData.sector;
            
            console.log(`✅ Secteur trouvé: ${vendorData.sector?.name || 'Aucun'} avec ${outlets.length} PDV`);
          } else {
            console.log('⚠️ Aucune donnée vendeur trouvée');
          }
        } catch (vendorErr: any) {
          console.warn('⚠️ Erreur lors du chargement des PDV du vendeur:', vendorErr);
          console.log('🔍 Tentative de fallback vers les PDV du territoire...');
          // Si pas de secteur assigné, essayer de charger tous les PDV du territoire
          if (user?.territoryId) {
            console.log(`🌍 Chargement des PDV du territoire ${user.territoryId}...`);
            try {
              outlets = await outletsService.getAll({ 
                territoryId: user.territoryId,
                status: 'APPROVED'
              });
              console.log(`✅ PDV du territoire chargés: ${outlets.length}`);
            } catch (outletErr) {
              console.warn('⚠️ Erreur lors du chargement des PDV du territoire:', outletErr);
            }
          } else {
            console.log('❌ Aucun territoryId trouvé pour l\'utilisateur');
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

      // Debug: Vérifier les coordonnées des PDV
      console.log('🗺️ PDV bruts récupérés:', outlets.map(o => ({
        name: o.name,
        lat: o.lat,
        lng: o.lng,
        hasCoords: !!(o.lat && o.lng)
      })));

      // Convertir tous les PDV en format carte (statut 'territory' pour les distinguer)
      const allOutletsConverted: RouteStop[] = outlets
        .map((outlet, index) => {
          let lat = outlet.lat;
          let lng = outlet.lng;
          
          // Si pas de coordonnées, générer des coordonnées par défaut autour d'Abidjan pour test
          if (!lat || !lng) {
            console.log(`⚠️ PDV sans coordonnées: ${outlet.name} - Attribution de coordonnées par défaut`);
            // Coordonnées aléatoires autour d'Abidjan (5.36, -4.01)
            lat = 5.36 + (Math.random() - 0.5) * 0.1; // ±0.05 degrés
            lng = -4.01 + (Math.random() - 0.5) * 0.1;
          } else {
            // Espacer légèrement les PDV qui ont les mêmes coordonnées pour éviter la superposition
            const offset = index * 0.0001; // Petit décalage pour chaque PDV
            lat = Number(lat) + offset;
            lng = Number(lng) + offset;
          }

          return {
            id: parseInt(outlet.id) || index + 1000,
            name: outlet.name,
            latitude: lat,
            longitude: lng,
            status: 'territory' as any, // Nouveau statut pour les PDV du territoire
            time: '',
            distance: '',
          };
        });

      console.log(`📍 Total PDV convertis pour la carte: ${allOutletsConverted.length}`);
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
            // Message d'erreur plus détaillé pour aider au diagnostic
            const errorDetails = [];
            if (!user.territoryId) errorDetails.push('Aucun territoire assigné');
            if (!assignedSector) errorDetails.push('Aucun secteur assigné');
            
            const detailMessage = errorDetails.length > 0 ? ` (${errorDetails.join(', ')})` : '';
            console.log('❌ Aucun PDV trouvé. Détails:', { user, assignedSector, outlets });
            setError(`Aucun point de vente disponible${detailMessage}. Contactez votre administrateur pour assigner un secteur ou territoire.`);
          } else {
            setError('Aucun point de vente disponible dans votre territoire');
          }
        } else {
          console.log('✅ PDV trouvés et affichés sur la carte');
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
