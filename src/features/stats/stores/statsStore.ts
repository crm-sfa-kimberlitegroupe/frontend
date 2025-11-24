/**
 * Store Zustand pour la gestion des statistiques
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types pour les statistiques
export interface DailyStats {
  date: string;
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  totalVisits: number;
  completedVisits: number;
  averageOrderValue: number;
  topProducts: Array<{
    skuId: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
  topOutlets: Array<{
    outletId: string;
    name: string;
    orders: number;
    revenue: number;
  }>;
}

export interface WeeklyStats {
  startDate: string;
  endDate: string;
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  totalVisits: number;
  completedVisits: number;
  averageOrderValue: number;
  dailyBreakdown: Array<{
    date: string;
    sales: number;
    revenue: number;
    orders: number;
    visits: number;
  }>;
  growthRate: number;
  topPerformingDays: string[];
}

export interface MonthlyStats {
  month: string;
  year: number;
  totalSales: number;
  totalRevenue: number;
  totalOrders: number;
  totalVisits: number;
  completedVisits: number;
  averageOrderValue: number;
  weeklyBreakdown: Array<{
    week: number;
    sales: number;
    revenue: number;
    orders: number;
    visits: number;
  }>;
  growthRate: number;
  targetAchievement: number;
  ranking: {
    position: number;
    totalVendors: number;
  };
}

export interface KPIStats {
  conversionRate: number;
  averageVisitDuration: number;
  customerSatisfaction: number;
  stockTurnover: number;
  routeEfficiency: number;
  targetCompletion: number;
}

export interface ComparisonStats {
  current: {
    period: string;
    value: number;
  };
  previous: {
    period: string;
    value: number;
  };
  change: {
    absolute: number;
    percentage: number;
    trend: 'up' | 'down' | 'stable';
  };
}

export interface StatsFilters {
  startDate?: string;
  endDate?: string;
  period?: 'day' | 'week' | 'month' | 'quarter' | 'year';
  userId?: string;
  outletId?: string;
  categoryId?: string;
  brandId?: string;
}

interface StatsState {
  // État des données
  dailyStats: DailyStats | null;
  weeklyStats: WeeklyStats | null;
  monthlyStats: MonthlyStats | null;
  kpiStats: KPIStats | null;
  comparisonStats: { [key: string]: ComparisonStats };
  
  // États de chargement
  isLoadingDaily: boolean;
  isLoadingWeekly: boolean;
  isLoadingMonthly: boolean;
  isLoadingKPI: boolean;
  isLoadingComparison: boolean;
  error: string | null;
  
  // Filtres
  filters: StatsFilters;
  
  // Actions principales
  loadDailyStats: (date?: string) => Promise<void>;
  loadWeeklyStats: (startDate?: string) => Promise<void>;
  loadMonthlyStats: (month?: string, year?: number) => Promise<void>;
  loadKPIStats: () => Promise<void>;
  loadComparisonStats: (metric: string, currentPeriod: string, previousPeriod: string) => Promise<void>;
  
  // Actions de filtrage
  setFilters: (filters: Partial<StatsFilters>) => void;
  clearFilters: () => void;
  
  // Actions utilitaires
  clearStats: () => void;
  clearError: () => void;
  refreshAllStats: () => Promise<void>;
}

// Service API simulé pour les statistiques
const statsService = {
  async getDailyStats(date?: string): Promise<DailyStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const targetDate = date || new Date().toISOString().split('T')[0];
        resolve({
          date: targetDate,
          totalSales: 15,
          totalRevenue: 2750000,
          totalOrders: 12,
          totalVisits: 8,
          completedVisits: 6,
          averageOrderValue: 229166,
          topProducts: [
            { skuId: '1', name: 'Coca-Cola 33cl', quantity: 24, revenue: 600000 },
            { skuId: '2', name: 'Castel Beer 65cl', quantity: 18, revenue: 540000 },
            { skuId: '3', name: 'Fanta Orange 33cl', quantity: 20, revenue: 500000 },
          ],
          topOutlets: [
            { outletId: '1', name: 'Boutique Central', orders: 4, revenue: 920000 },
            { outletId: '2', name: 'Supermarché Nord', orders: 3, revenue: 687000 },
            { outletId: '3', name: 'Épicerie Sud', orders: 2, revenue: 458000 },
          ],
        });
      }, 400);
    });
  },

  async getWeeklyStats(startDate?: string): Promise<WeeklyStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const start = startDate || new Date().toISOString().split('T')[0];
        const end = new Date(new Date(start).getTime() + 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
        
        resolve({
          startDate: start,
          endDate: end,
          totalSales: 89,
          totalRevenue: 15420000,
          totalOrders: 72,
          totalVisits: 45,
          completedVisits: 38,
          averageOrderValue: 214166,
          dailyBreakdown: [
            { date: start, sales: 15, revenue: 2750000, orders: 12, visits: 8 },
            { date: new Date(new Date(start).getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], sales: 12, revenue: 2100000, orders: 9, visits: 6 },
            { date: new Date(new Date(start).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], sales: 18, revenue: 3200000, orders: 14, visits: 9 },
            { date: new Date(new Date(start).getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], sales: 14, revenue: 2580000, orders: 11, visits: 7 },
            { date: new Date(new Date(start).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], sales: 16, revenue: 2890000, orders: 13, visits: 8 },
            { date: new Date(new Date(start).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], sales: 8, revenue: 1450000, orders: 7, visits: 4 },
            { date: end, sales: 6, revenue: 450000, orders: 6, visits: 3 },
          ],
          growthRate: 12.5,
          topPerformingDays: [
            new Date(new Date(start).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            new Date(new Date(start).getTime() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            start,
          ],
        });
      }, 500);
    });
  },

  async getMonthlyStats(month?: string, year?: number): Promise<MonthlyStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const targetMonth = month || (new Date().getMonth() + 1).toString().padStart(2, '0');
        const targetYear = year || new Date().getFullYear();
        
        resolve({
          month: targetMonth,
          year: targetYear,
          totalSales: 356,
          totalRevenue: 61680000,
          totalOrders: 289,
          totalVisits: 180,
          completedVisits: 152,
          averageOrderValue: 213425,
          weeklyBreakdown: [
            { week: 1, sales: 89, revenue: 15420000, orders: 72, visits: 45 },
            { week: 2, sales: 94, revenue: 16280000, orders: 76, visits: 48 },
            { week: 3, sales: 87, revenue: 15060000, orders: 70, visits: 44 },
            { week: 4, sales: 86, revenue: 14920000, orders: 71, visits: 43 },
          ],
          growthRate: 8.3,
          targetAchievement: 89.2,
          ranking: {
            position: 3,
            totalVendors: 25,
          },
        });
      }, 600);
    });
  },

  async getKPIStats(): Promise<KPIStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          conversionRate: 84.4,
          averageVisitDuration: 25.5,
          customerSatisfaction: 4.2,
          stockTurnover: 3.8,
          routeEfficiency: 92.1,
          targetCompletion: 89.2,
        });
      }, 300);
    });
  },

  async getComparisonStats(_metric: string, currentPeriod: string, previousPeriod: string): Promise<ComparisonStats> {
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simuler des données de comparaison
        const currentValue = Math.floor(Math.random() * 1000000) + 500000;
        const previousValue = Math.floor(Math.random() * 1000000) + 400000;
        const change = currentValue - previousValue;
        const percentage = (change / previousValue) * 100;
        
        resolve({
          current: {
            period: currentPeriod,
            value: currentValue,
          },
          previous: {
            period: previousPeriod,
            value: previousValue,
          },
          change: {
            absolute: change,
            percentage: Math.round(percentage * 100) / 100,
            trend: change > 0 ? 'up' : change < 0 ? 'down' : 'stable',
          },
        });
      }, 400);
    });
  },
};

export const useStatsStore = create<StatsState>()(
  devtools(
    (set, get) => ({
      // État initial
      dailyStats: null,
      weeklyStats: null,
      monthlyStats: null,
      kpiStats: null,
      comparisonStats: {},
      isLoadingDaily: false,
      isLoadingWeekly: false,
      isLoadingMonthly: false,
      isLoadingKPI: false,
      isLoadingComparison: false,
      error: null,
      filters: {},

      // Charger les statistiques du jour
      loadDailyStats: async (date) => {
        set({ isLoadingDaily: true, error: null });
        try {
          const dailyStats = await statsService.getDailyStats(date);
          set({ 
            dailyStats,
            isLoadingDaily: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques du jour',
            isLoadingDaily: false 
          });
        }
      },

      // Charger les statistiques de la semaine
      loadWeeklyStats: async (startDate) => {
        set({ isLoadingWeekly: true, error: null });
        try {
          const weeklyStats = await statsService.getWeeklyStats(startDate);
          set({ 
            weeklyStats,
            isLoadingWeekly: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques de la semaine',
            isLoadingWeekly: false 
          });
        }
      },

      // Charger les statistiques du mois
      loadMonthlyStats: async (month, year) => {
        set({ isLoadingMonthly: true, error: null });
        try {
          const monthlyStats = await statsService.getMonthlyStats(month, year);
          set({ 
            monthlyStats,
            isLoadingMonthly: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques du mois',
            isLoadingMonthly: false 
          });
        }
      },

      // Charger les KPI
      loadKPIStats: async () => {
        set({ isLoadingKPI: true, error: null });
        try {
          const kpiStats = await statsService.getKPIStats();
          set({ 
            kpiStats,
            isLoadingKPI: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des KPI',
            isLoadingKPI: false 
          });
        }
      },

      // Charger les statistiques de comparaison
      loadComparisonStats: async (metric: string, currentPeriod: string, previousPeriod: string) => {
        set({ isLoadingComparison: true, error: null });
        try {
          const comparisonStats = await statsService.getComparisonStats(metric, currentPeriod, previousPeriod);
          const currentComparisons = get().comparisonStats;
          
          set({ 
            comparisonStats: {
              ...currentComparisons,
              [metric]: comparisonStats
            },
            isLoadingComparison: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des comparaisons',
            isLoadingComparison: false 
          });
        }
      },

      // Définir les filtres
      setFilters: (newFilters: Partial<StatsFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
      },

      // Effacer les filtres
      clearFilters: () => {
        set({ filters: {} });
      },

      // Vider toutes les statistiques
      clearStats: () => {
        set({
          dailyStats: null,
          weeklyStats: null,
          monthlyStats: null,
          kpiStats: null,
          comparisonStats: {},
          filters: {},
          error: null,
        });
      },

      // Effacer l'erreur
      clearError: () => {
        set({ error: null });
      },

      // Rafraîchir toutes les statistiques
      refreshAllStats: async () => {
        const today = new Date().toISOString().split('T')[0];
        const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
        const currentYear = new Date().getFullYear();
        
        await Promise.all([
          get().loadDailyStats(today),
          get().loadWeeklyStats(today),
          get().loadMonthlyStats(currentMonth, currentYear),
          get().loadKPIStats()
        ]);
      },
    }),
    {
      name: 'stats-store',
    }
  )
);
