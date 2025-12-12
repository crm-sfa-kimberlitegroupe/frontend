import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface AdminDashboardStats {
  activeUsers: number;
  totalUsers: number;
  totalPDV: number;
  pendingPDV: number;
  approvedPDV: number;
  todayVisits: number;
  todayOrders: number;
  monthlySales: number;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  pdv?: string;
  time: string;
  timestamp: Date;
  type: 'visit' | 'order' | 'pdv' | 'user';
}

export interface Alert {
  id: string;
  type: 'danger' | 'warning' | 'info';
  message: string;
  count: number;
  link?: string;
}

interface AdminDashboardState {
  stats: AdminDashboardStats | null;
  activities: Activity[];
  alerts: Alert[];
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  
  // Actions
  setStats: (stats: AdminDashboardStats) => void;
  setActivities: (activities: Activity[]) => void;
  setAlerts: (alerts: Alert[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearData: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useAdminDashboardStore = create<AdminDashboardState>()(
  persist(
    (set) => ({
      stats: null,
      activities: [],
      alerts: [],
      isLoading: false,
      error: null,
      lastUpdated: null,

      setStats: (stats) => set({ stats, lastUpdated: Date.now(), error: null }),
      
      setActivities: (activities) => set({ activities, error: null }),
      
      setAlerts: (alerts) => set({ alerts, error: null }),
      
      setLoading: (isLoading) => set({ isLoading }),
      
      setError: (error) => set({ error, isLoading: false }),
      
      clearData: () => set({
        stats: null,
        activities: [],
        alerts: [],
        isLoading: false,
        error: null,
        lastUpdated: null,
      }),
    }),
    {
      name: 'admin-dashboard-storage',
      partialize: (state) => ({
        stats: state.stats,
        activities: state.activities,
        alerts: state.alerts,
        lastUpdated: state.lastUpdated,
      }),
    }
  )
);

// Helper pour vérifier si le cache est valide
export const isCacheValid = (lastUpdated: number | null): boolean => {
  if (!lastUpdated) return false;
  return Date.now() - lastUpdated < CACHE_DURATION;
};
