import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ActiveVisit {
  // IDs principaux
  outletId: string;
  visitId: string;
  routeStopId: string;  // ID du RouteStop dans la route
  
  // Informations du PDV
  pdvName: string;
  address?: string;
  
  // Données temporelles
  createdAt: string;
  checkInTime?: string;   // Heure réelle de check-in
  checkOutTime?: string;  // Heure réelle de check-out
  scheduledTime?: string; // Heure prévue dans la route
  
  // Données de route
  sequence: number;       // Ordre dans la route
  routePlanId?: string;   // ID du plan de route
  
  // Statut et actions
  status: 'IN_PROGRESS' | 'COMPLETED';
  venteId?: string;       // ID de la vente associée
  merchId?: string;       // ID du merchandising associé
}

export interface VisitData {
  outletId: string;
  visitId: string;
  routeStopId: string;
  pdvName: string;
  address?: string;
  scheduledTime?: string;
  sequence: number;
  routePlanId?: string;
}

interface VisitsStore {
  // Visites actives indexées par outletId
  activeVisits: Record<string, ActiveVisit>;
  
  // Actions
  startVisit: (visitData: VisitData) => void;
  completeVisit: (outletId: string) => void;
  getActiveVisit: (outletId: string) => ActiveVisit | undefined;
  clearVisit: (outletId: string) => void;
  clearAllVisits: () => void;
  
  // Actions pour vente et merchandising
  setVenteId: (outletId: string, venteId: string) => void;
  setMerchId: (outletId: string, merchId: string) => void;
  setCheckInTime: (outletId: string, checkInTime: string) => void;
  setCheckOutTime: (outletId: string, checkOutTime: string) => void;
  
  // État de synchronisation
  isSyncing: boolean;
  setSyncing: (syncing: boolean) => void;
}

export const useVisitsStore = create<VisitsStore>()(
  persist(
    (set, get) => ({
      activeVisits: {},
      isSyncing: false,
      
      startVisit: (visitData: VisitData) => {
        set((state) => ({
          activeVisits: {
            ...state.activeVisits,
            [visitData.outletId]: {
              outletId: visitData.outletId,
              visitId: visitData.visitId,
              routeStopId: visitData.routeStopId,
              pdvName: visitData.pdvName,
              address: visitData.address,
              scheduledTime: visitData.scheduledTime,
              sequence: visitData.sequence,
              routePlanId: visitData.routePlanId,
              createdAt: new Date().toISOString(),
              checkInTime: new Date().toISOString(),
              status: 'IN_PROGRESS',
            },
          },
        }));
      },
      
      completeVisit: (outletId: string) => {
        set((state) => {
          const visit = state.activeVisits[outletId];
          if (!visit) return state;
          
          return {
            activeVisits: {
              ...state.activeVisits,
              [outletId]: {
                ...visit,
                status: 'COMPLETED',
              },
            },
          };
        });
      },
      
      getActiveVisit: (outletId: string) => {
        return get().activeVisits[outletId];
      },
      
      clearVisit: (outletId: string) => {
        set((state) => {
          const newActiveVisits = { ...state.activeVisits };
          delete newActiveVisits[outletId];
          return { activeVisits: newActiveVisits };
        });
      },
      
      clearAllVisits: () => {
        set({ activeVisits: {} });
      },
      
      setVenteId: (outletId: string, venteId: string) => {
        set((state) => {
          const visit = state.activeVisits[outletId];
          if (!visit) return state;
          
          return {
            activeVisits: {
              ...state.activeVisits,
              [outletId]: { ...visit, venteId }
            }
          };
        });
      },
      
      setMerchId: (outletId: string, merchId: string) => {
        set((state) => {
          const visit = state.activeVisits[outletId];
          if (!visit) return state;
          
          return {
            activeVisits: {
              ...state.activeVisits,
              [outletId]: { ...visit, merchId }
            }
          };
        });
      },
      
      setCheckInTime: (outletId: string, checkInTime: string) => {
        set((state) => {
          const visit = state.activeVisits[outletId];
          if (!visit) return state;
          
          return {
            activeVisits: {
              ...state.activeVisits,
              [outletId]: { ...visit, checkInTime }
            }
          };
        });
      },
      
      setCheckOutTime: (outletId: string, checkOutTime: string) => {
        set((state) => {
          const visit = state.activeVisits[outletId];
          if (!visit) return state;
          
          return {
            activeVisits: {
              ...state.activeVisits,
              [outletId]: { ...visit, checkOutTime }
            }
          };
        });
      },
      
      setSyncing: (syncing: boolean) => {
        set({ isSyncing: syncing });
      },
    }),
    {
      name: 'visits-storage', // Nom pour localStorage
      partialize: (state) => ({ 
        // Ne persister que les visites actives, pas l'état de sync
        activeVisits: state.activeVisits 
      }),
    }
  )
);
