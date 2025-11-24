/**
 * Store Zustand pour la gestion des routes
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import routesService, { type RoutePlan } from '../services/routesService';

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
  createRoute: (routeData: Partial<RoutePlan>) => Promise<void>;
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

// Service API simulé pour les statistiques (à compléter selon vos besoins)
const routeStatsService = {
  async getStats(): Promise<RouteStats> {
    // Simuler des statistiques
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalRoutes: 25,
          completedRoutes: 18,
          inProgressRoutes: 3,
          plannedRoutes: 4,
          cancelledRoutes: 0,
          totalStops: 125,
          completedStops: 89,
          avgStopsPerRoute: 5,
          completionRate: 72,
        });
      }, 300);
    });
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
          // Utiliser des données simulées pour le développement
          const mockTodayRoute: RoutePlan = {
            id: 'route-today-1',
            // name: 'Route du jour - Centre-ville',
            // description: 'Tournée quotidienne secteur centre-ville',
            date: new Date().toISOString().split('T')[0],
            status: 'IN_PROGRESS',
            userId: userId || 'user-1',
            isOffRoute: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            routeStops: [
              {
                id: 'stop-1',
                outletId: 'outlet-1',
                status: 'PLANNED',
                seq: 1,
                routePlanId: 'route-today-1'
              },
              {
                id: 'stop-2',
                outletId: 'outlet-2', 
                status: 'PLANNED',
                seq: 2,
                routePlanId: 'route-today-1'
              },
              {
                id: 'stop-3',
                outletId: 'outlet-3',
                status: 'VISITED',
                seq: 3,
                routePlanId: 'route-today-1'
              }
            ]
          };
          
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 200));
          
          set({ 
            todayRoute: mockTodayRoute,
            currentRoute: mockTodayRoute,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement de la route du jour',
            isLoading: false 
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
      createRoute: async (routeData: Partial<RoutePlan>) => {
        set({ isCreatingRoute: true, error: null });
        try {
          // TODO: Implémenter createRoute dans le service
          console.log('Création de route:', routeData);
          const newRoute = routeData as RoutePlan; // Temporaire
          const currentRoutes = get().routes;
          const updatedRoutes = [...currentRoutes, newRoute];
          
          set({ 
            routes: updatedRoutes,
            filteredRoutes: updatedRoutes,
            isCreatingRoute: false 
          });
          
          // Appliquer les filtres
          get().applyFilters();
        } catch (error) {
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
          // TODO: Implémenter updateRoute dans le service
          console.log('Mise à jour route:', id, routeData);
          const updatedRoute = { ...get().selectedRoute, ...routeData } as RoutePlan; // Temporaire
          const currentRoutes = get().routes;
          const updatedRoutes = currentRoutes.map(route => 
            route.id === id ? updatedRoute : route
          );
          
          set({ 
            routes: updatedRoutes,
            filteredRoutes: updatedRoutes,
            selectedRoute: updatedRoute,
            isUpdatingRoute: false 
          });
          
          // Mettre à jour la route courante si c'est celle-ci
          if (get().currentRoute?.id === id) {
            set({ currentRoute: updatedRoute });
          }
          
          // Mettre à jour la route du jour si c'est celle-ci
          if (get().todayRoute?.id === id) {
            set({ todayRoute: updatedRoute });
          }
          
          // Appliquer les filtres
          get().applyFilters();
        } catch (error) {
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
          // TODO: Implémenter deleteRoute dans le service
          console.log('Suppression route:', id);
          const currentRoutes = get().routes;
          const updatedRoutes = currentRoutes.filter(route => route.id !== id);
          
          set({ 
            routes: updatedRoutes,
            filteredRoutes: updatedRoutes,
            selectedRoute: null,
            isLoading: false 
          });
          
          // Nettoyer les références si c'était la route courante
          if (get().currentRoute?.id === id) {
            set({ currentRoute: null });
          }
          if (get().todayRoute?.id === id) {
            set({ todayRoute: null });
          }
          
          // Appliquer les filtres
          get().applyFilters();
        } catch (error) {
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
