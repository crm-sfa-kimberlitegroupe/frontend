/**
 * Store Zustand pour la gestion des routes
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { apiClient } from '@/core/api/client';
import routesService, { type RoutePlan, type CreateRoutePlanDto } from '../services/routesService';

// Types pour les filtres
export interface RouteFilters {
  date?: string;
  status?: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  userId?: string;
  sectorId?: string;
}

export interface RouteStats {
  totalRoutes: number;
  completedRoutes: number;
  inProgressRoutes: number;
  plannedRoutes: number;
  cancelledRoutes: number;
  totalStops: number;
  completedStops: number;
  avgStopsPerRoute: number;
  completionRate: number;
}

interface RoutesState {
  // État des données
  routes: RoutePlan[];
  filteredRoutes: RoutePlan[];
  currentRoute: RoutePlan | null;
  todayRoute: RoutePlan | null;
  selectedRoute: RoutePlan | null;
  stats: RouteStats | null;
  
  // États de chargement
  isLoading: boolean;
  isLoadingStats: boolean;
  isCreatingRoute: boolean;
  isUpdatingRoute: boolean;
  error: string | null;
  
  // Filtres
  filters: RouteFilters;
  
  // Actions principales
  loadRoutes: (filters?: RouteFilters) => Promise<void>;
  loadTodayRoute: (userId?: string) => Promise<void>;
  loadRouteById: (id: string) => Promise<void>;
  loadRouteStats: () => Promise<void>;
  createRoute: (routeData: CreateRoutePlanDto) => Promise<void>;
  updateRoute: (id: string, routeData: Partial<RoutePlan>) => Promise<void>;
  updateRouteStop: (routeId: string, stopId: string, status: string) => Promise<void>;
  deleteRoute: (id: string) => Promise<void>;
  
  // Actions de filtrage
  setFilters: (filters: Partial<RouteFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  
  // Actions utilitaires
  setCurrentRoute: (route: RoutePlan | null) => void;
  setSelectedRoute: (route: RoutePlan | null) => void;
  clearRoute: () => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

// Service API pour les statistiques de routes
const routeStatsService = {
  async getStats(): Promise<RouteStats> {
    try {
      console.log('🚀 [RouteStatsService] Chargement des statistiques...');
      
      // Appeler l'API pour récupérer les vraies statistiques
      const response = await apiClient.get('/routes/stats');
      
      console.log('✅ [RouteStatsService] Statistiques chargées:', response);
      return response;
    } catch (error) {
      console.error('❌ [RouteStatsService] Erreur chargement statistiques:', error);
      
      // Fallback avec des statistiques par défaut en cas d'erreur
      return {
        totalRoutes: 0,
        completedRoutes: 0,
        inProgressRoutes: 0,
        plannedRoutes: 0,
        cancelledRoutes: 0,
        totalStops: 0,
        completedStops: 0,
        avgStopsPerRoute: 0,
        completionRate: 0,
      };
    }
  },
};

export const useRoutesStore = create<RoutesState>()(
  devtools(
    (set, get) => ({
      // État initial
      routes: [],
      filteredRoutes: [],
      currentRoute: null,
      todayRoute: null,
      selectedRoute: null,
      stats: null,
      isLoading: false,
      isLoadingStats: false,
      isCreatingRoute: false,
      isUpdatingRoute: false,
      error: null,
      filters: {},

      // Charger toutes les routes
      loadRoutes: async (filters) => {
        set({ isLoading: true, error: null });
        try {
          // Charger toutes les routes avec les filtres
          const routes = await routesService.getAll(filters);
          
          set({ 
            routes, 
            filteredRoutes: routes,
            isLoading: false 
          });
          
          // Mettre à jour les filtres si fournis
          if (filters) {
            set({ filters: { ...get().filters, ...filters } });
          }
          
          // Appliquer les filtres
          get().applyFilters();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des routes',
            isLoading: false 
          });
        }
      },

      // Charger la route du jour
      loadTodayRoute: async (userId) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🚀 [RoutesStore] Chargement route du jour pour userId:', userId);
          
          // Utiliser le service API pour récupérer la vraie route du jour
          // getTodayRoute() utilise l'utilisateur connecté automatiquement
          const todayRoute = await routesService.getTodayRoute();
          
          console.log('✅ [RoutesStore] Route du jour chargée:', {
            routeId: todayRoute?.id,
            status: todayRoute?.status,
            stopsCount: todayRoute?.routeStops?.length || 0,
            date: todayRoute?.date
          });
          
          set({ 
            todayRoute,
            currentRoute: todayRoute,
            isLoading: false 
          });
        } catch (error) {
          console.error('❌ [RoutesStore] Erreur chargement route du jour:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement de la route du jour',
            isLoading: false,
            todayRoute: null,
            currentRoute: null
          });
        }
      },

      // Charger une route par ID
      loadRouteById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const route = await routesService.getById(id);
          set({ 
            selectedRoute: route,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement de la route',
            isLoading: false 
          });
        }
      },

      // Charger les statistiques
      loadRouteStats: async () => {
        set({ isLoadingStats: true, error: null });
        try {
          const stats = await routeStatsService.getStats();
          set({ 
            stats,
            isLoadingStats: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques',
            isLoadingStats: false 
          });
        }
      },

      // Créer une nouvelle route
      createRoute: async (routeData: CreateRoutePlanDto) => {
        set({ isCreatingRoute: true, error: null });
        try {
          console.log('🚀 [RoutesStore] Création de route:', routeData);
          
          // Utiliser le service API pour créer la route
          const newRoute = await routesService.create(routeData);
          
          console.log('✅ [RoutesStore] Route créée:', newRoute);
          
          // Recharger toutes les routes pour avoir les données à jour
          await get().loadRoutes();
          
          set({ isCreatingRoute: false });
        } catch (error) {
          console.error('❌ [RoutesStore] Erreur création route:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la création de la route',
            isCreatingRoute: false 
          });
        }
      },

      // Mettre à jour une route
      updateRoute: async (id: string, routeData: Partial<RoutePlan>) => {
        set({ isUpdatingRoute: true, error: null });
        try {
          console.log('🚀 [RoutesStore] Mise à jour route:', id, routeData);
          
          // Utiliser le service API pour mettre à jour la route
          const updatedRoute = await routesService.update(id, routeData);
          
          console.log('✅ [RoutesStore] Route mise à jour:', updatedRoute);
          
          // Recharger toutes les routes pour avoir les données à jour
          await get().loadRoutes();
          
          // Mettre à jour la route sélectionnée si c'est celle-ci
          if (get().selectedRoute?.id === id) {
            set({ selectedRoute: updatedRoute });
          }
          
          // Mettre à jour la route courante si c'est celle-ci
          if (get().currentRoute?.id === id) {
            set({ currentRoute: updatedRoute });
          }
          
          // Mettre à jour la route du jour si c'est celle-ci
          if (get().todayRoute?.id === id) {
            set({ todayRoute: updatedRoute });
          }
          
          set({ isUpdatingRoute: false });
        } catch (error) {
          console.error('❌ [RoutesStore] Erreur mise à jour route:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de la route',
            isUpdatingRoute: false 
          });
        }
      },

      // Mettre à jour le statut d'un arrêt
      updateRouteStop: async (routeId: string, stopId: string, status: string) => {
        set({ isUpdatingRoute: true, error: null });
        try {
          await routesService.updateRouteStopStatus(routeId, stopId, status as 'PLANNED' | 'IN_PROGRESS' | 'VISITED');
          
          // Recharger la route mise à jour
          await get().loadRouteById(routeId);
          
          // Si c'est la route du jour, la recharger aussi
          if (get().todayRoute?.id === routeId) {
            await get().loadTodayRoute();
          }
          
          set({ isUpdatingRoute: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'arrêt',
            isUpdatingRoute: false 
          });
        }
      },

      // Supprimer une route
      deleteRoute: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          console.log('🚀 [RoutesStore] Suppression route:', id);
          
          // Utiliser le service API pour supprimer la route
          await routesService.delete(id);
          
          console.log('✅ [RoutesStore] Route supprimée:', id);
          
          // Recharger toutes les routes pour avoir les données à jour
          await get().loadRoutes();
          
          // Nettoyer les références si c'était la route courante
          if (get().currentRoute?.id === id) {
            set({ currentRoute: null });
          }
          if (get().todayRoute?.id === id) {
            set({ todayRoute: null });
          }
          if (get().selectedRoute?.id === id) {
            set({ selectedRoute: null });
          }
          
          set({ isLoading: false });
        } catch (error) {
          console.error('❌ [RoutesStore] Erreur suppression route:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression de la route',
            isLoading: false 
          });
        }
      },

      // Définir les filtres
      setFilters: (newFilters: Partial<RouteFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
        get().applyFilters();
      },

      // Appliquer les filtres
      applyFilters: () => {
        const { routes, filters } = get();
        let filtered = [...routes];

        // Filtre par date
        if (filters.date) {
          filtered = filtered.filter(route => 
            route.date === filters.date
          );
        }

        // Filtre par statut
        if (filters.status) {
          filtered = filtered.filter(route => 
            route.status === filters.status
          );
        }

        // Filtre par utilisateur
        if (filters.userId) {
          filtered = filtered.filter(route => 
            route.userId === filters.userId
          );
        }

        // Filtre par secteur (TODO: ajouter sectorId au type RoutePlan si nécessaire)
        if (filters.sectorId) {
          filtered = filtered.filter(route => 
            (route as any).sectorId === filters.sectorId
          );
        }

        set({ filteredRoutes: filtered });
      },

      // Effacer les filtres
      clearFilters: () => {
        const { routes } = get();
        set({ 
          filters: {},
          filteredRoutes: routes 
        });
      },

      // Définir la route courante
      setCurrentRoute: (route: RoutePlan | null) => {
        set({ currentRoute: route });
      },

      // Définir la route sélectionnée
      setSelectedRoute: (route: RoutePlan | null) => {
        set({ selectedRoute: route });
      },

      // Vider toutes les routes
      clearRoute: () => {
        set({
          routes: [],
          filteredRoutes: [],
          currentRoute: null,
          todayRoute: null,
          selectedRoute: null,
          stats: null,
          filters: {},
          error: null,
        });
      },

      // Effacer l'erreur
      clearError: () => {
        set({ error: null });
      },

      // Rafraîchir toutes les données
      refreshData: async () => {
        await Promise.all([
          get().loadRoutes(),
          get().loadTodayRoute(),
          get().loadRouteStats()
        ]);
      },
    }),
    {
      name: 'routes-store',
    }
  )
);
