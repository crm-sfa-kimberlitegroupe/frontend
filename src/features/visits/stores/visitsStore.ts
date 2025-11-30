import { create } from 'zustand';
import { persist } from 'zustand/middleware';









interface ActiveVisit {
  // IDs principaux
  outletId: string;
  visitId: string;          // ID de la visite créée par le BACKEND (important!)
  routeStopId: string;      // ID du RouteStop dans la route (différent de visitId)
  userId?: string;          // ID de l'utilisateur (du backend)
  
  // Informations du PDV
  pdvName: string;
  address?: string;
  
  // Données temporelles
  createdAt: string;        // Timestamp de création dans le store
  checkinAt?: string;       // Timestamp du check-in (du backend)
  checkoutAt?: string;      // Timestamp du check-out (du backend)
  scheduledTime?: string;   // Heure prévue dans la route
  
  // Données GPS du check-in (du backend)
  checkinLat?: number;
  checkinLng?: number;
  
  // Données de route
  sequence: number;         // Ordre dans la route
  routePlanId?: string;     // ID du plan de route
  
  // Statut et actions
  status: 'IN_PROGRESS' | 'COMPLETED';
  venteIds?: string[];      // IDs des ventes associées (array)
  merchIds?: string[];      // IDs des merchandising associés (array)
  
  // Notes et score
  notes?: string;
  score?: number;
}

export interface VisitData {
  // IDs principaux
  outletId: string;
  visitId: string;          // ID de la visite créée par le BACKEND
  routeStopId: string;      // ID du RouteStop (différent!)
  userId?: string;          // ID de l'utilisateur (du backend)
  
  // Informations du PDV
  pdvName: string;
  address?: string;
  
  // Données temporelles (du backend)
  createdAt?: string;
  checkinAt?: string;       // Timestamp du check-in
  checkoutAt?: string;      // Timestamp du check-out
  scheduledTime?: string;   // Heure prévue dans la route
  
  // Données GPS du check-in (du backend)
  checkinLat?: number;
  checkinLng?: number;
  
  // Données de route
  sequence: number;
  routePlanId?: string;
  
  // Statut et actions
  status?: 'IN_PROGRESS' | 'COMPLETED';
  
  // Notes et score
  notes?: string;
  score?: number;
}

interface VisitsStore {
  // Visites actives indexées par outletId
  activeVisits: Record<string, ActiveVisit>;
  
  // Métadonnées de persistance
  _persistedAt?: string;
  _version?: number;
  
  // Actions
  startVisit: (visitData: VisitData) => void;
  completeVisit: (outletId: string) => void;
  getActiveVisit: (outletId: string) => ActiveVisit | undefined;
  clearVisit: (outletId: string) => void;
  clearAllVisits: () => void;
  clearCompletedVisits: () => void;
  cleanupExpiredVisits: () => void;
  
  // Actions pour vente et merchandising
  addVenteId: (outletId: string, venteId: string) => void;
  updateVisitAddVenteId: (visitId: string, venteId: string) => void;  // Update visite par visitId
  removeVenteId: (outletId: string, venteId: string) => void;
  getVenteIds: (outletId: string) => string[];
  
  addMerchId: (outletId: string, merchId: string) => void;
  updateVisitAddMerchId: (visitId: string, merchId: string) => void;  // Update visite par visitId
  removeMerchId: (outletId: string, merchId: string) => void;
  getMerchIds: (outletId: string) => string[];
  setCheckInTime: (outletId: string, checkInTime: string) => void;
  setCheckOutTime: (outletId: string, checkOutTime: string) => void;
  
  // Recherche - retourne VisitData
  findVisitByPdvName: (pdvName: string) => VisitData | undefined;
  findVisitByVisitId: (visitId: string) => VisitData | undefined;
  getAllActiveVisits: () => VisitData[];
  
  // État de synchronisation
  isSyncing: boolean;
  setSyncing: (syncing: boolean) => void;
}

export const useVisitsStore = create<VisitsStore>()(
  persist(
    (set, get) => ({
      activeVisits: {},
      isSyncing: false,
      _persistedAt: new Date().toISOString(),
      _version: 1,
      
      startVisit: (visitData: VisitData) => {
        set((state) => ({
          activeVisits: {
            ...state.activeVisits,
            [visitData.outletId]: {
              // IDs principaux (visitId vient du BACKEND!)
              outletId: visitData.outletId,
              visitId: visitData.visitId,           // ID généré par le backend
              routeStopId: visitData.routeStopId,   // ID du routeStop (différent!)
              userId: visitData.userId,
              
              // Infos PDV
              pdvName: visitData.pdvName,
              address: visitData.address,
              
              // Données temporelles du backend
              createdAt: new Date().toISOString(),
              checkinAt: visitData.checkinAt,       // Timestamp du backend
              scheduledTime: visitData.scheduledTime,
              
              // Coordonnées GPS du check-in
              checkinLat: visitData.checkinLat,
              checkinLng: visitData.checkinLng,
              
              // Route
              sequence: visitData.sequence,
              routePlanId: visitData.routePlanId,
              
              // Statut
              status: 'IN_PROGRESS',
              venteIds: [],
              merchIds: [],
              
              // Notes
              notes: visitData.notes,
            },
          },
          _persistedAt: new Date().toISOString(),
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
        console.log('[VisitsStore] Suppression visite:', outletId);
        set((state) => {
          const newActiveVisits = { ...state.activeVisits };
          delete newActiveVisits[outletId];
          return { 
            activeVisits: newActiveVisits,
            _persistedAt: new Date().toISOString()
          };
        });
      },
      
      clearAllVisits: () => {
        console.warn('[VisitsStore] Suppression TOUTES les visites - Utilisez clearCompletedVisits() à la place');
        set({ 
          activeVisits: {},
          _persistedAt: new Date().toISOString()
        });
      },
      
      // Nouvelle méthode : Supprimer uniquement les visites terminées
      clearCompletedVisits: () => {
        console.log('[VisitsStore] Nettoyage des visites terminées');
        set((state) => {
          const activeVisits = Object.entries(state.activeVisits)
            .filter(([, visit]) => visit.status === 'IN_PROGRESS')
            .reduce((acc, [key, visit]) => ({ ...acc, [key]: visit }), {});
          
          return { 
            activeVisits,
            _persistedAt: new Date().toISOString()
          };
        });
      },
      
      // Nouvelle méthode : Nettoyer les visites expirées (> 24h)
      cleanupExpiredVisits: () => {
        console.log('[VisitsStore] Nettoyage des visites expirées');
        set((state) => {
          const now = new Date().getTime();
          const maxAge = 24 * 60 * 60 * 1000; // 24 heures
          
          const activeVisits = Object.entries(state.activeVisits)
            .filter(([, visit]) => {
              const createdAt = new Date(visit.createdAt).getTime();
              const age = now - createdAt;
              return age < maxAge; // Garder seulement si < 24h
            })
            .reduce((acc, [key, visit]) => ({ ...acc, [key]: visit }), {});
          
          const removedCount = Object.keys(state.activeVisits).length - Object.keys(activeVisits).length;
          if (removedCount > 0) {
            console.log(`[VisitsStore] ${removedCount} visite(s) expirée(s) supprimée(s)`);
          }
          
          return { 
            activeVisits,
            _persistedAt: new Date().toISOString()
          };
        });
      },
      
      // Ajouter une vente à la visite (par outletId)
      addVenteId: (outletId: string, venteId: string) => {
        set((state) => {
          const visit = state.activeVisits[outletId];
          if (!visit) return state;
          
          const currentVenteIds = visit.venteIds || [];
          // Éviter les doublons
          if (currentVenteIds.includes(venteId)) return state;
          
          return {
            activeVisits: {
              ...state.activeVisits,
              [outletId]: { 
                ...visit, 
                venteIds: [...currentVenteIds, venteId]
              }
            }
          };
        });
      },















      
      //Mettre à jour une visite existante : ajouter une vente (par visitId)
      updateVisitAddVenteId: (visitId: string, venteId: string) => {
        console.log('🔄 [updateVisitAddVenteId] DÉBUT - Paramètres reçus:', { visitId, venteId });
        
        set((state) => {
          console.log('🔍 [updateVisitAddVenteId] Visites dans le store:', Object.keys(state.activeVisits));
          console.log('🔍 [updateVisitAddVenteId] Détail des visites:', 
            Object.entries(state.activeVisits).map(([key, v]) => ({ 
              outletId: key, 
              visitId: v.visitId,
              pdvName: v.pdvName 
            }))
          );
          
          // Chercher la visite par son visitId
          const entry = Object.entries(state.activeVisits).find(
            ([, visit]) => visit.visitId === visitId
          );
          
          if (!entry) {
            console.error(`[updateVisitAddVenteId] ÉCHEC - Visite NON TROUVÉE avec visitId: ${visitId}`);
            console.error('[updateVisitAddVenteId] visitIds disponibles:', 
              Object.values(state.activeVisits).map(v => v.visitId)
            );
            return state;
          }
          
          const [outletId, visit] = entry;
          const currentVenteIds = visit.venteIds || [];
          
          // Éviter les doublons
          if (currentVenteIds.includes(venteId)) {
            console.warn(`[updateVisitAddVenteId] Doublon détecté - venteId ${venteId} déjà présent`);
            return state;
          }
          
          
          return {
            activeVisits: {
              ...state.activeVisits,
              [outletId]: { 
                ...visit, 
                venteIds: [...currentVenteIds, venteId]
              }
            }
          };
        });
        
      },
      
















      // Supprimer une vente de la visite
      removeVenteId: (outletId: string, venteId: string) => {
        set((state) => {
          const visit = state.activeVisits[outletId];
          if (!visit) return state;
          
          const currentVenteIds = visit.venteIds || [];
          
          return {
            activeVisits: {
              ...state.activeVisits,
              [outletId]: { 
                ...visit, 
                venteIds: currentVenteIds.filter(id => id !== venteId)
              }
            }
          };
        });
      },

      
      
      // Récupérer les IDs des ventes
      getVenteIds: (outletId: string) => {
        const visit = get().activeVisits[outletId];
        return visit?.venteIds || [];
      },
      
      // Ajouter un merchandising à la visite (par outletId)
      addMerchId: (outletId: string, merchId: string) => {
        set((state) => {
          const visit = state.activeVisits[outletId];
          if (!visit) return state;
          
          const currentMerchIds = visit.merchIds || [];
          // Éviter les doublons
          if (currentMerchIds.includes(merchId)) return state;
          
          return {
            activeVisits: {
              ...state.activeVisits,
              [outletId]: { 
                ...visit, 
                merchIds: [...currentMerchIds, merchId]
              }
            }
          };
        });
      },
      
      //Mettre à jour une visite existante : ajouter un merchandising (par visitId)
      updateVisitAddMerchId: (visitId: string, merchId: string) => {
        set((state) => {
          // Chercher la visite par son visitId
          const entry = Object.entries(state.activeVisits).find(
            ([, visit]) => visit.visitId === visitId
          );
          
          if (!entry) {
            console.warn(`⚠️ [VisitsStore] Visite non trouvée avec visitId: ${visitId}`);
            return state;
          }
          
          const [outletId, visit] = entry;
          const currentMerchIds = visit.merchIds || [];
          
          // Éviter les doublons
          if (currentMerchIds.includes(merchId)) return state;
          
          console.log(`[VisitsStore] Ajout merchandising ${merchId} à la visite ${visitId} (outlet: ${outletId})`);
          
          return {
            activeVisits: {
              ...state.activeVisits,
              [outletId]: { 
                ...visit, 
                merchIds: [...currentMerchIds, merchId]
              }
            }
          };
        });
      },
      
      // Supprimer un merchandising de la visite
      removeMerchId: (outletId: string, merchId: string) => {
        set((state) => {
          const visit = state.activeVisits[outletId];
          if (!visit) return state;
          
          const currentMerchIds = visit.merchIds || [];
          
          return {
            activeVisits: {
              ...state.activeVisits,
              [outletId]: { 
                ...visit, 
                merchIds: currentMerchIds.filter(id => id !== merchId)
              }
            }
          };
        });
      },
      
      // Récupérer les IDs des merchandising
      getMerchIds: (outletId: string) => {
        const visit = get().activeVisits[outletId];
        return visit?.merchIds || [];
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
      
      // Rechercher une visite par nom de PDV
      findVisitByPdvName: (pdvName: string) => {
        const state = get();
        const visits = Object.values(state.activeVisits);
        return visits.find(visit => 
          visit.pdvName.toLowerCase().trim() === pdvName.toLowerCase().trim()
        );
      },
      
      //Rechercher une visite par visitId
      findVisitByVisitId: (visitId: string) => {
        const state = get();
        const visits = Object.values(state.activeVisits);
        return visits.find(visit => visit.visitId === visitId);
      },
      
      // Récupérer toutes les visites actives
      getAllActiveVisits: () => {
        const state = get();
        return Object.values(state.activeVisits);
      },
    }),
    {
      name: 'visits-storage', // Nom pour localStorage
      partialize: (state) => ({ 
        // Persister les visites actives ET les métadonnées
        activeVisits: state.activeVisits,
        _persistedAt: state._persistedAt,
        _version: state._version
      }),
      // Fonction appelée lors de la réhydratation depuis localStorage
      onRehydrateStorage: () => (state) => {
        if (state) {
          console.log('💾 [VisitsStore] Réhydratation depuis localStorage:', {
            visites: Object.keys(state.activeVisits).length,
            persistedAt: state._persistedAt
          });
          
          // Nettoyer automatiquement les visites expirées au chargement
          state.cleanupExpiredVisits();
        }
      },
    }
  )
);
