import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { type Outlet, type OutletStatus } from '../../pdv/services/outletsService';
import routesService from '@/features/routes/services/routesService';
import { useAuthStore } from '@/core/auth';

// Type pour les données brutes de l'API
interface RawOutletFromAPI {
  id: string;
  name: string;
  code: string;
  address?: string;
  lat?: number;
  lng?: number;
  status?: string;
  channel?: string;
  segment?: string;
  sector_id?: string;
  sectorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

interface OutletsState {
  outlets: Outlet[];
  pendingOutlets: Outlet[];
  validatedOutlets: Outlet[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  loadOutlets: () => Promise<void>;
  refreshOutlets: () => Promise<void>;
  clearOutlets: () => void;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useOutletsStore = create<OutletsState>()(
  persist(
    (set, get) => ({
  outlets: [],
  pendingOutlets: [],
  validatedOutlets: [],
  loading: false,
  refreshing: false,
  error: null,
  lastFetch: null,

  loadOutlets: async () => {
    const state = get();
    const now = Date.now();
    
    
    // Vérifier le cache
    if (state.lastFetch && now - state.lastFetch < CACHE_DURATION && state.outlets.length > 0) {
      console.log('[OutletsStore] Utilisation du cache existant');
      return;
    }

    // Premier chargement ou cache expiré
    const isFirstLoad = !state.lastFetch;
    console.log(`[OutletsStore] ${isFirstLoad ? 'Premier chargement' : 'Rafraîchissement du cache'}`);
    
    set({ 
      loading: isFirstLoad, 
      refreshing: !isFirstLoad, 
      error: null 
    });
    
    try {
      // Récupérer l'userId depuis le store auth
      const userId = useAuthStore.getState().user?.id;
      
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }
      
      console.log('[OutletsStore] Appel API getVendorSectorOutlets pour userId:', userId);
      
      // Log avant l'appel API
      console.log('[OutletsStore] Début de l\'appel API...');
      const response = await routesService.getVendorSectorOutlets(userId);
      console.log('[OutletsStore] Appel API terminé');

      // Log détaillé de la réponse
      console.log('[OutletsStore] Réponse complète de l\'API:');
      console.log('Type de response:', typeof response);
      console.log('Response brute:', JSON.stringify(response, null, 2));
      
      // Le backend retourne { success, data, message }
      // Les données réelles sont dans response.data
      const actualData = response?.data || response;
      
      console.log('actualData:', actualData);
      console.log('actualData.vendor:', actualData?.vendor);
      console.log('actualData.sector:', actualData?.sector);
      console.log('actualData.outlets:', actualData?.outlets);
      console.log('Nombre d\'outlets:', actualData?.outlets?.length || 0);
      console.log('Premier outlet:', actualData?.outlets?.[0]);

      const rawOutlets = actualData?.outlets || [];
      
      console.log('[OutletsStore] Données brutes reçues:', {
        totalOutlets: rawOutlets.length,
        outlets: rawOutlets
      });
      
      // Transformer les données de l'API vers le format Outlet attendu
      const allOutlets: Outlet[] = rawOutlets.map((outlet: RawOutletFromAPI) => ({
        id: outlet.id,
        code: outlet.code || '',
        name: outlet.name || '',
        channel: outlet.channel || 'UNKNOWN',
        segment: outlet.segment,
        address: outlet.address,
        lat: outlet.lat,
        lng: outlet.lng,
        status: (outlet.status as OutletStatus) || 'APPROVED', // Par défaut APPROVED si pas de statut
        territoryId: outlet.sector_id || outlet.sectorId || '', // Mapping sector_id vers territoryId
        createdAt: outlet.createdAt || new Date().toISOString(),
        updatedAt: outlet.updatedAt || new Date().toISOString(),
      }));
      
      console.log('[OutletsStore] Données transformées:', {
        totalOutlets: allOutlets.length,
        firstOutlet: allOutlets[0],
        outlets: allOutlets
      });
      
      // Séparer les PDV en attente et validés
      const pending = allOutlets.filter((outlet: Outlet) => outlet.status === 'PENDING');
      const validated = allOutlets.filter((outlet: Outlet) => outlet.status === 'APPROVED');
      
      console.log('[OutletsStore] Outlets filtrés:', {
        pending: pending.length,
        validated: validated.length
      });
      
      set({
        outlets: allOutlets,
        pendingOutlets: pending,
        validatedOutlets: validated,
        loading: false,
        refreshing: false,
        lastFetch: now,
        error: null,
      });
      
      console.log('[OutletsStore] Store mis à jour avec succès');
    } catch (error) {
      console.error('[OutletsStore] Erreur lors du chargement:');
      console.error('Error object:', error);
      console.error('Error message:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
      
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des PDV';
      set({
        loading: false,
        refreshing: false,
        error: errorMessage,
      });
    }
  },

  refreshOutlets: async () => {
    console.log('[OutletsStore] refreshOutlets appelé - invalidation du cache');
    set({ lastFetch: null });
    await get().loadOutlets();
  },

  clearOutlets: () => {
    console.log('[OutletsStore] clearOutlets appelé - nettoyage du store');
    set({
      outlets: [],
      pendingOutlets: [],
      validatedOutlets: [],
      loading: false,
      refreshing: false,
      error: null,
      lastFetch: null,
    });
  },
}),
    {
      name: 'outlets-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        outlets: state.outlets,
        pendingOutlets: state.pendingOutlets,
        validatedOutlets: state.validatedOutlets,
        lastFetch: state.lastFetch,
      }),
      onRehydrateStorage: () => (state) => {
        console.log('💧 [OutletsStore] Réhydratation depuis localStorage:', {
          outletsCount: state?.outlets.length || 0,
          pendingCount: state?.pendingOutlets.length || 0,
          validatedCount: state?.validatedOutlets.length || 0,
          lastFetch: state?.lastFetch
        });
      },
    }
  )
);