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

export interface LpcData {
  value: number;
  totalLines: number;
  orderCount: number;
  linesPerOrder: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface TauxCouvertureData {
  value: number;
  targetClients: number;
  visitedClients: number;
  coverageRate: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface HitRateData {
  value: number;
  totalVisits: number;
  visitsWithSale: number;
  hitRate: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface FrequenceVisiteData {
  value: number;
  totalVisits: number;
  uniqueClients: number;
  averageFrequency: number;
  period: string;
  startDate: string;
  endDate: string;
}

export interface VenteParVisiteData {
  value: number;
  totalCA: number;
  totalVisits: number;
  averageCAPerVisit: number;
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

export interface LpcByPeriod {
  today: LpcData | null;
  week: LpcData | null;
  month: LpcData | null;
  quarter: LpcData | null;
}

export interface TauxCouvertureByPeriod {
  today: TauxCouvertureData | null;
  week: TauxCouvertureData | null;
  month: TauxCouvertureData | null;
  quarter: TauxCouvertureData | null;
}

export interface HitRateByPeriod {
  today: HitRateData | null;
  week: HitRateData | null;
  month: HitRateData | null;
  quarter: HitRateData | null;
}

export interface FrequenceVisiteByPeriod {
  today: FrequenceVisiteData | null;
  week: FrequenceVisiteData | null;
  month: FrequenceVisiteData | null;
  quarter: FrequenceVisiteData | null;
}

export interface VenteParVisiteByPeriod {
  today: VenteParVisiteData | null;
  week: VenteParVisiteData | null;
  month: VenteParVisiteData | null;
  quarter: VenteParVisiteData | null;
}

interface ManagerDashboardState {
  // CA par période
  caByPeriod: CaByPeriod;
  // LPC par période
  lpcByPeriod: LpcByPeriod;
  // Taux de couverture par période
  tauxCouvertureByPeriod: TauxCouvertureByPeriod;
  // Hit Rate par période
  hitRateByPeriod: HitRateByPeriod;
  // Fréquence de Visite par période
  frequenceVisiteByPeriod: FrequenceVisiteByPeriod;
  // Vente par Visite par période
  venteParVisiteByPeriod: VenteParVisiteByPeriod;
  // Période actuellement sélectionnée
  selectedPeriod: PeriodType;
  // État de chargement
  isLoading: boolean;
  error: string | null;
  // Cache par période avec timestamps
  cacheTimestamps: Record<PeriodType, number | null>;
  lpcCacheTimestamps: Record<PeriodType, number | null>;
  tauxCouvertureCacheTimestamps: Record<PeriodType, number | null>;
  hitRateCacheTimestamps: Record<PeriodType, number | null>;
  frequenceVisiteCacheTimestamps: Record<PeriodType, number | null>;
  venteParVisiteCacheTimestamps: Record<PeriodType, number | null>;
  territoryId: string | null;

  // Actions
  setCa: (period: PeriodType, ca: ChiffreAffairesData) => void;
  setLpc: (period: PeriodType, lpc: LpcData) => void;
  setTauxCouverture: (period: PeriodType, data: TauxCouvertureData) => void;
  setHitRate: (period: PeriodType, data: HitRateData) => void;
  setFrequenceVisite: (period: PeriodType, data: FrequenceVisiteData) => void;
  setVenteParVisite: (period: PeriodType, data: VenteParVisiteData) => void;
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
      lpcByPeriod: {
        today: null,
        week: null,
        month: null,
        quarter: null,
      },
      tauxCouvertureByPeriod: {
        today: null,
        week: null,
        month: null,
        quarter: null,
      },
      hitRateByPeriod: {
        today: null,
        week: null,
        month: null,
        quarter: null,
      },
      frequenceVisiteByPeriod: {
        today: null,
        week: null,
        month: null,
        quarter: null,
      },
      venteParVisiteByPeriod: {
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
      lpcCacheTimestamps: {
        today: null,
        week: null,
        month: null,
        quarter: null,
      },
      tauxCouvertureCacheTimestamps: {
        today: null,
        week: null,
        month: null,
        quarter: null,
      },
      hitRateCacheTimestamps: {
        today: null,
        week: null,
        month: null,
        quarter: null,
      },
      frequenceVisiteCacheTimestamps: {
        today: null,
        week: null,
        month: null,
        quarter: null,
      },
      venteParVisiteCacheTimestamps: {
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

      setLpc: (period, lpc) =>
        set((state) => ({
          lpcByPeriod: { ...state.lpcByPeriod, [period]: lpc },
          lpcCacheTimestamps: { ...state.lpcCacheTimestamps, [period]: Date.now() },
          error: null,
        })),

      setTauxCouverture: (period, data) =>
        set((state) => ({
          tauxCouvertureByPeriod: { ...state.tauxCouvertureByPeriod, [period]: data },
          tauxCouvertureCacheTimestamps: { ...state.tauxCouvertureCacheTimestamps, [period]: Date.now() },
          error: null,
        })),

      setHitRate: (period, data) =>
        set((state) => ({
          hitRateByPeriod: { ...state.hitRateByPeriod, [period]: data },
          hitRateCacheTimestamps: { ...state.hitRateCacheTimestamps, [period]: Date.now() },
          error: null,
        })),

      setFrequenceVisite: (period, data) =>
        set((state) => ({
          frequenceVisiteByPeriod: { ...state.frequenceVisiteByPeriod, [period]: data },
          frequenceVisiteCacheTimestamps: { ...state.frequenceVisiteCacheTimestamps, [period]: Date.now() },
          error: null,
        })),

      setVenteParVisite: (period, data) =>
        set((state) => ({
          venteParVisiteByPeriod: { ...state.venteParVisiteByPeriod, [period]: data },
          venteParVisiteCacheTimestamps: { ...state.venteParVisiteCacheTimestamps, [period]: Date.now() },
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
          lpcByPeriod: {
            today: null,
            week: null,
            month: null,
            quarter: null,
          },
          tauxCouvertureByPeriod: {
            today: null,
            week: null,
            month: null,
            quarter: null,
          },
          hitRateByPeriod: {
            today: null,
            week: null,
            month: null,
            quarter: null,
          },
          frequenceVisiteByPeriod: {
            today: null,
            week: null,
            month: null,
            quarter: null,
          },
          venteParVisiteByPeriod: {
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
          lpcCacheTimestamps: {
            today: null,
            week: null,
            month: null,
            quarter: null,
          },
          tauxCouvertureCacheTimestamps: {
            today: null,
            week: null,
            month: null,
            quarter: null,
          },
          hitRateCacheTimestamps: {
            today: null,
            week: null,
            month: null,
            quarter: null,
          },
          frequenceVisiteCacheTimestamps: {
            today: null,
            week: null,
            month: null,
            quarter: null,
          },
          venteParVisiteCacheTimestamps: {
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
        lpcByPeriod: state.lpcByPeriod,
        tauxCouvertureByPeriod: state.tauxCouvertureByPeriod,
        hitRateByPeriod: state.hitRateByPeriod,
        frequenceVisiteByPeriod: state.frequenceVisiteByPeriod,
        venteParVisiteByPeriod: state.venteParVisiteByPeriod,
        cacheTimestamps: state.cacheTimestamps,
        lpcCacheTimestamps: state.lpcCacheTimestamps,
        tauxCouvertureCacheTimestamps: state.tauxCouvertureCacheTimestamps,
        hitRateCacheTimestamps: state.hitRateCacheTimestamps,
        frequenceVisiteCacheTimestamps: state.frequenceVisiteCacheTimestamps,
        venteParVisiteCacheTimestamps: state.venteParVisiteCacheTimestamps,
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
