import { useMemo } from 'react';
import { useAuthStore } from '@/core/auth';
import { type RoutePlan, type RouteStop } from '../../routes/services/routesService';
import { useVisitsStore } from '../stores/visitsStore';
import { useRoutesStore } from '../../routes/stores/routesStore';

interface RouteVisitData {
  routePlan: RoutePlan | null;
  visits: Array<{
    id: string;
    pdvName: string;
    outletId: string;
    routeStopId: string;           // ID du RouteStop
    status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED';
    scheduledTime: string;
    sequence: number;
    address?: string;
    checkInTime?: string;
    checkOutTime?: string;
  }>;
  sector: {
    id: string;
    code: string;
    name: string;
  } | null;
}

export function useRouteVisits() {
  const user = useAuthStore((state) => state.user);
  
  // Utiliser les stores préchargés
  const todayRoute = useRoutesStore((state) => state.todayRoute);
  const activeVisits = useVisitsStore((state) => state.activeVisits);
  const { loadTodayRoute } = useRoutesStore();

  // Calculer les données à partir du store (pas d'appel API)
  const data = useMemo<RouteVisitData | null>(() => {
    if (!user?.id || user.role !== 'REP') {
      return null;
    }

    if (!todayRoute) {
      return {
        routePlan: null,
        visits: [],
        sector: {
          id: 'sector-1',
          code: 'SEC001',
          name: 'Secteur Centre-Ville'
        }
      };
    }

    const visits = (todayRoute.routeStops || [])
      .sort((a, b) => a.seq - b.seq)
      .map((stop: RouteStop) => {
        let visitStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' = 'PLANNED';
        
        // Vérifier d'abord dans les visites actives
        const activeVisit = activeVisits[stop.outletId];
        if (activeVisit) {
          visitStatus = activeVisit.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS';
        } else if (stop.status === 'VISITED') {
          visitStatus = 'COMPLETED';
        } else if (stop.status === 'IN_PROGRESS') {
          visitStatus = 'IN_PROGRESS';
        } else if (stop.status === 'PLANNED') {
          visitStatus = 'PLANNED';
        }

        return {
          id: stop.outletId,
          pdvName: stop.outlet?.name || 'Point de vente',
          outletId: stop.outletId,
          routeStopId: stop.id,
          status: visitStatus,
          scheduledTime: stop.eta ? new Date(stop.eta).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : `${8 + stop.seq}:00`,
          sequence: stop.seq,
          address: stop.outlet?.address || '',
          checkInTime: activeVisit?.checkinAt,
          checkOutTime: undefined,
        };
      });

    return {
      routePlan: todayRoute,
      visits,
      sector: {
        id: 'sector-1',
        code: 'SEC001',
        name: 'Secteur Centre-Ville'
      }
    };
  }, [todayRoute, activeVisits, user?.id, user?.role]);

  const refetch = async () => {
    if (!user?.id || user.role !== 'REP') return;
    await loadTodayRoute(user.id);
  };

  return {
    data,
    routePlan: data?.routePlan || null,
    visits: data?.visits || [],
    sector: data?.sector,
    loading: false,
    error: !todayRoute && user?.role === 'REP' ? 'Aucune route planifiée pour aujourd\'hui' : null,
    refetch,
  };
}
