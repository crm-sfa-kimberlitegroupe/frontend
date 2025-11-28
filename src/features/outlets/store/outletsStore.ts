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
      return;
    }

    // Premier chargement ou cache expiré
    const isFirstLoad = !state.lastFetch;
    
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
      
      const response = await routesService.getVendorSectorOutlets(userId);
      
      // Le backend retourne { success, data, message }
      const actualData = response?.data || response;
      const rawOutlets = actualData?.outlets || [];
      
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
      
      // Séparer les PDV en attente et validés
      const pending = allOutlets.filter((outlet: Outlet) => outlet.status === 'PENDING');
      const validated = allOutlets.filter((outlet: Outlet) => outlet.status === 'APPROVED');
      
      set({
        outlets: allOutlets,
        pendingOutlets: pending,
        validatedOutlets: validated,
        loading: false,
        refreshing: false,
        lastFetch: now,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des PDV';
      set({
        loading: false,
        refreshing: false,
        error: errorMessage,
      });
    }
  },

  refreshOutlets: async () => {
    set({ lastFetch: null });
    await get().loadOutlets();
  },

  clearOutlets: () => {
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
      onRehydrateStorage: () => () => {
        // Rehydratation silencieuse
      },
    }
  )
);