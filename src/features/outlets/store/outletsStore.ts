import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import outletsService, { type Outlet } from '../../pdv/services/outletsService';

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
      const allOutlets = await outletsService.getAll();
      
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
    }
  )
);
