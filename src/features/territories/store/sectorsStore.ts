import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import territoriesService, { type Territory } from '../services/territoriesService';

interface SectorsState {
  sectors: Territory[];
  territories: Territory[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  loadSectors: () => Promise<void>;
  refreshSectors: () => Promise<void>;
  clearSectors: () => void;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useSectorsStore = create<SectorsState>()(
  persist(
    (set, get) => ({
  sectors: [],
  territories: [],
  loading: false,
  refreshing: false,
  error: null,
  lastFetch: null,

  loadSectors: async () => {
    const state = get();
    const now = Date.now();
    
    console.log('[SectorsStore] Début du chargement');
    console.trace('[SectorsStore] Call stack de loadSectors');
    console.log('[SectorsStore] État actuel:', {
      sectorsCount: state.sectors.length,
      territoriesCount: state.territories.length,
      lastFetch: state.lastFetch,
      loading: state.loading,
      refreshing: state.refreshing,
      error: state.error
    });
    
    // Vérifier le cache
    if (state.lastFetch && now - state.lastFetch < CACHE_DURATION && state.sectors.length > 0) {
      const cacheAge = Math.floor((now - state.lastFetch) / 1000);
      console.log(`[SectorsStore] Données en cache utilisées (${cacheAge}s / ${CACHE_DURATION/1000}s)`);
      console.log(`[SectorsStore] Cache contient: ${state.sectors.length} secteurs, ${state.territories.length} territoires`);
      return;
    }

    // Premier chargement ou cache expiré
    const isFirstLoad = !state.lastFetch;
    console.log(`[SectorsStore] ${isFirstLoad ? 'Premier chargement' : 'Cache expiré - rechargement'}`);
    
    set({ 
      loading: isFirstLoad, 
      refreshing: !isFirstLoad, 
      error: null 
    });
    
    try {
      console.log('[SectorsStore] Appel API en cours...');
      const [sectorsData, territoriesData] = await Promise.all([
        territoriesService.getAllSectors({ level: 'SECTEUR' }),
        territoriesService.getAll(),
      ]);
      
      console.log('[SectorsStore] Données reçues:', {
        sectorsCount: sectorsData.length,
        territoriesCount: territoriesData.length,
        sectorsData: sectorsData.map(s => ({ id: s.id, name: s.name, code: s.code })),
        territoriesData: territoriesData.map(t => ({ id: t.id, name: t.name, code: t.code }))
      });
      
      set({
        sectors: sectorsData,
        territories: territoriesData,
        loading: false,
        refreshing: false,
        lastFetch: now,
        error: null,
      });
      
      console.log('[SectorsStore] Chargement terminé avec succès');
      console.log(`[SectorsStore] Store mis à jour: ${sectorsData.length} secteurs, ${territoriesData.length} territoires`);
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des secteurs';
      console.error('[SectorsStore] Erreur de chargement:', error);
      console.error('[SectorsStore] Message d\'erreur:', errorMessage);
      
      set({
        loading: false,
        refreshing: false,
        error: errorMessage,
      });
    }
  },

  refreshSectors: async () => {
    console.log('[SectorsStore] Rafraîchissement forcé demandé');
    console.log('[SectorsStore] refreshSectors appelé depuis:');
    console.trace();
    set({ lastFetch: null });
    await get().loadSectors();
  },

  clearSectors: () => {
    console.log('[SectorsStore] Nettoyage du store');
    const state = get();
    console.log('[SectorsStore] Données supprimées:', {
      sectorsCount: state.sectors.length,
      territoriesCount: state.territories.length
    });
    
    set({
      sectors: [],
      territories: [],
      loading: false,
      refreshing: false,
      error: null,
      lastFetch: null,
    });
    
    console.log('[SectorsStore] Store vidé avec succès');
  },
}),
    {
      name: 'sectors-storage', // Nom unique pour le localStorage
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        sectors: state.sectors,
        territories: state.territories,
        lastFetch: state.lastFetch,
        // Ne pas persister loading, refreshing, error
      }),
    }
  )
);
