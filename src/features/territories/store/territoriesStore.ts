import { create } from 'zustand';
import { territoriesService, type Territory, type Manager } from '@/features/territories/services';

interface TerritoriesState {
  territories: Territory[];
  managers: Manager[];
  loading: boolean;
  
  // Actions
  fetchTerritories: () => Promise<void>;
  fetchManagers: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useTerritoriesStore = create<TerritoriesState>((set) => ({
  territories: [],
  managers: [],
  loading: false,

  fetchTerritories: async () => {
    try {
      set({ loading: true });
      const territories = await territoriesService.getAll();
      set({ territories, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchManagers: async () => {
    try {
      set({ loading: true });
      const managers = await territoriesService.getManagers();
      set({ managers, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchAll: async () => {
    try {
      set({ loading: true });
      const [territories, managers] = await Promise.all([
        territoriesService.getAll(),
        territoriesService.getManagers(),
      ]);
      set({ territories, managers, loading: false });
    } catch {
      set({ loading: false });
    }
  },
}));
