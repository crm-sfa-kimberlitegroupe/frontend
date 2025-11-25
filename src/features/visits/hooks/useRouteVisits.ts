import { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/core/auth';
import routesService, { type RoutePlan, type RouteStop } from '../../routes/services/routesService';
import territoriesService from '../../territories/services/territoriesService';
import { useVisitsStore } from '../stores/visitsStore';

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
  const [data, setData] = useState<RouteVisitData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const user = useAuthStore((state) => state.user);

  // Utiliser le store Zustand pour les visites actives
  const activeVisits = useVisitsStore((state) => state.activeVisits);

  const fetchRouteVisitsInitial = useCallback(async () => {
    if (!user?.id || user.role !== 'REP') {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const todayRoute = await routesService.getTodayRoute();

      console.log(todayRoute);

      
      if (!todayRoute) {
        
        let sectorInfo = null;
        try {
          const vendorData = await territoriesService.getVendorOutlets(user.id);
          sectorInfo = vendorData.sector;
        } catch (err) {
          console.warn('Impossible de récupérer les infos du secteur:', err);
        }
        
        setError('Aucune route planifiée pour aujourd\'hui. Contactez votre manager pour créer une route.');
        setData({
          routePlan: null,
          visits: [],
          sector: sectorInfo
        });
        return;
      }

      const visits = (todayRoute.routeStops || [])
        .sort((a, b) => a.seq - b.seq)
        .map((stop: RouteStop) => {
          let visitStatus: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' = 'PLANNED';
          
          if (stop.status === 'VISITED') {
            visitStatus = 'COMPLETED';
          } else if (stop.status === 'PLANNED') {
            // Logique pour déterminer si c'est le prochain à visiter
            const hasStarted = todayRoute.status === 'IN_PROGRESS';
            const isFirstUnvisited = todayRoute.routeStops?.findIndex(s => s.status === 'PLANNED') === todayRoute.routeStops?.indexOf(stop);
            
            if (hasStarted && isFirstUnvisited) {
              visitStatus = 'IN_PROGRESS';
            }
          }

          return {
            id: stop.outletId,
            pdvName: stop.outlet?.name || 'Point de vente',
            outletId: stop.outletId,
            routeStopId: stop.id,      //ID du RouteStop
            status: visitStatus,
            scheduledTime: stop.eta ? new Date(stop.eta).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : `${8 + stop.seq}:00`,
            sequence: stop.seq,
            address: stop.outlet?.address || '',
            checkInTime: undefined,
            checkOutTime: undefined,
          };
        });

      let sectorInfo = null;
      try {
        const vendorData = await territoriesService.getVendorOutlets(user.id);
        sectorInfo = vendorData.sector;
      } catch (err) {
        console.warn(' Impossible de récupérer les infos du secteur:', err);
      }

      setData({
        routePlan: todayRoute,
        visits,
        sector: sectorInfo
      });

    } catch (err: unknown) {
      console.error(' Erreur lors de la récupération de la route:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message 
        : 'Erreur lors de la récupération de la route planifiée';
      setError(errorMessage || 'Erreur lors de la récupération de la route planifiée');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.role]);

  // Version qui utilise le store pour les statuts
  const fetchRouteVisits = useCallback(async () => {
    if (!data) {
      // Si pas de données, faire le chargement initial
      await fetchRouteVisitsInitial();
      return;
    }

    // Mettre à jour seulement les statuts depuis le store
    const updatedVisits = data.visits.map(visit => {
      const activeVisit = activeVisits[visit.outletId];
      
      if (activeVisit) {
        return {
          ...visit,
          status: (activeVisit.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS') as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'
        };
      }
      
      return visit;
    });

    setData({
      ...data,
      visits: updatedVisits
    });
  }, [data, activeVisits, fetchRouteVisitsInitial]);

  useEffect(() => {
    fetchRouteVisitsInitial();
  }, [user?.id, user?.role, fetchRouteVisitsInitial]);

  // Mettre à jour les statuts quand le store change
  useEffect(() => {
    if (data && data.visits.length > 0) {
      const updatedVisits = data.visits.map(visit => {
        const activeVisit = activeVisits[visit.outletId];
        
        if (activeVisit) {
          return {
            ...visit,
            status: (activeVisit.status === 'COMPLETED' ? 'COMPLETED' : 'IN_PROGRESS') as 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'
          };
        }
        
        return visit;
      });

      // Vérifier s'il y a vraiment des changements avant de mettre à jour
      const hasChanges = updatedVisits.some((visit, index) => 
        visit.status !== data.visits[index].status
      );

      if (hasChanges) {
        console.log('Mise à jour des statuts depuis le store');
        setData({
          ...data,
          visits: updatedVisits
        });
      }
    }
  }, [activeVisits, data]);

  const refetch = async () => {
    if (!user?.id || user.role !== 'REP') return;
    
    await fetchRouteVisits();
  };

  return {
    data,
    routePlan: data?.routePlan || null,
    visits: data?.visits || [],
    sector: data?.sector,
    loading,
    error,
    refetch,
  };
}
