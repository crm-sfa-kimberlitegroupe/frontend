import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types de période supportés
export type PeriodType = 'today' | 'week' | 'month' | 'quarter';

export interface ChiffreAffairesData {
  value: number;
  orderCount: number;
  totalHt: number;
  totalTtc: number;
  totalTax: number;
  period: string;
  startDate: string;
  endDate: string;
}

// Cache par période
export interface CaByPeriod {
  today: ChiffreAffairesData | null;
  week: ChiffreAffairesData | null;
  month: ChiffreAffairesData | null;
  quarter: ChiffreAffairesData | null;
}

interface ManagerDashboardState {
  // CA par période
  caByPeriod: CaByPeriod;
  // Période actuellement sélectionnée
  selectedPeriod: PeriodType;
  // État de chargement
  isLoading: boolean;
  error: string | null;
  // Cache par période avec timestamps
  cacheTimestamps: Record<PeriodType, number | null>;
  territoryId: string | null;

  // Actions
  setCa: (period: PeriodType, ca: ChiffreAffairesData) => void;
  setSelectedPeriod: (period: PeriodType) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setTerritoryId: (territoryId: string | null) => void;
  clearData: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useManagerDashboardStore = create<ManagerDashboardState>()(
  persist(
    (set) => ({
      caByPeriod: {
        today: null,
        week: null,
        month: null,
        quarter: null,
      },
      selectedPeriod: 'today',
      isLoading: false,
      error: null,
      cacheTimestamps: {
        today: null,
        week: null,
        month: null,
        quarter: null,
      },
      territoryId: null,

      setCa: (period, ca) =>
        set((state) => ({
          caByPeriod: { ...state.caByPeriod, [period]: ca },
          cacheTimestamps: { ...state.cacheTimestamps, [period]: Date.now() },
          error: null,
        })),

      setSelectedPeriod: (period) => set({ selectedPeriod: period }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      setTerritoryId: (territoryId) => set({ territoryId }),

      clearData: () =>
        set({
          caByPeriod: {
            today: null,
            week: null,
            month: null,
            quarter: null,
          },
          isLoading: false,
          error: null,
          cacheTimestamps: {
            today: null,
            week: null,
            month: null,
            quarter: null,
          },
          territoryId: null,
        }),
    }),
    {
      name: 'manager-dashboard-storage',
      partialize: (state) => ({
        caByPeriod: state.caByPeriod,
        cacheTimestamps: state.cacheTimestamps,
        territoryId: state.territoryId,
      }),
    }
  )
);

// Helper pour vérifier si le cache d'une période est valide
export const isPeriodCacheValid = (
  cacheTimestamp: number | null,
  currentTerritoryId: string | null,
  storedTerritoryId: string | null
): boolean => {
  if (!cacheTimestamp) return false;
  if (currentTerritoryId !== storedTerritoryId) return false;
  return Date.now() - cacheTimestamp < CACHE_DURATION;
};
