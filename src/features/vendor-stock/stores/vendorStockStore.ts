/**
 * Store Zustand pour la gestion du stock vendeur
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { vendorStockService, type VendorStockItem, type StockStats, type LowStockItem } from '../services/vendorStockService';

// Type pour les mouvements de stock (à définir selon vos besoins)
export interface StockMovement {
  id: string;
  type: 'ADD' | 'REMOVE' | 'SALE' | 'ADJUSTMENT';
  quantity: number;
  beforeQuantity: number;
  afterQuantity: number;
  skuId: string;
  userId: string;
  createdAt: string;
  reason?: string;
}

// Types pour les filtres
export interface StockFilters {
  search?: string;
  categoryId?: string;
  brandId?: string;
  lowStockOnly?: boolean;
  isActive?: boolean;
  sortBy?: 'name' | 'quantity' | 'price' | 'lastUpdated';
  sortOrder?: 'asc' | 'desc';
}

export interface StockMovementFilters {
  movementType?: string;
  skuId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

interface VendorStockState {
  // État des données
  portfolio: VendorStockItem[];
  filteredPortfolio: VendorStockItem[];
  lowStockItems: LowStockItem[];
  stockMovements: StockMovement[];
  stats: StockStats | null;
  selectedStockItem: VendorStockItem | null;
  
  // Etats de chargement
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingMovements: boolean;
  isAddingStock: boolean;
  isUnloadingStock: boolean;
  isRemovingProduct: boolean;
  error: string | null;
  
  // Filtres
  filters: StockFilters;
  movementFilters: StockMovementFilters;
  
  // Actions principales
  loadStock: () => Promise<void>;
  loadStats: () => Promise<void>;
  loadLowStockItems: (limit?: number) => Promise<void>;
  loadStockMovements: (filters?: StockMovementFilters) => Promise<void>;
  addStock: (skuId: string, quantity: number, unitPrice?: number) => Promise<void>;
  removeProduct: (skuId: string) => Promise<{ success: boolean; message: string }>;
  unloadAllStock: () => Promise<void>;
  updateStockItem: (id: string, data: Partial<VendorStockItem>) => Promise<void>;
  
  // Actions de filtrage
  setFilters: (filters: Partial<StockFilters>) => void;
  setMovementFilters: (filters: Partial<StockMovementFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  
  // Actions utilitaires
  setSelectedStockItem: (item: VendorStockItem | null) => void;
  clearStock: () => void;
  clearError: () => void;
  refreshData: () => Promise<void>;
}

export const useVendorStockStore = create<VendorStockState>()(
  devtools(
    persist(
      (set, get) => ({
      // État initial
      portfolio: [],
      filteredPortfolio: [],
      lowStockItems: [],
      stockMovements: [],
      stats: null,
      selectedStockItem: null,
      isLoading: false,
      isLoadingStats: false,
      isLoadingMovements: false,
      isAddingStock: false,
      isUnloadingStock: false,
      isRemovingProduct: false,
      error: null,
      filters: {
        sortBy: 'name',
        sortOrder: 'asc',
      },
      movementFilters: {
        limit: 50,
      },

      // Charger le portfolio complet
      loadStock: async () => {
        set({ isLoading: true, error: null });
        try {
          const portfolio = await vendorStockService.getMyPortfolio();
          
          set({ 
            portfolio, 
            filteredPortfolio: portfolio,
            isLoading: false 
          });
          
          get().applyFilters();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement du stock',
            isLoading: false 
          });
        }
      },

      // Charger les statistiques
      loadStats: async () => {
        set({ isLoadingStats: true, error: null });
        try {
          const stats = await vendorStockService.getStats();
          
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

      // Charger les alertes de stock faible
      loadLowStockItems: async (threshold = 10) => {
        set({ isLoading: true, error: null });
        try {
          const lowStockItems = await vendorStockService.getLowStockItems(threshold);
          
          set({ 
            lowStockItems,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des alertes de stock',
            isLoading: false 
          });
        }
      },

      // Charger l'historique des mouvements
      loadStockMovements: async (filters) => {
        set({ isLoadingMovements: true, error: null });
        try {
          // const movements = await vendorStockService.getHistory(filters || {});
          set({ 
            stockMovements: [], // movements,
            isLoadingMovements: false 
          });
          
          // Mettre à jour les filtres si fournis
          if (filters) {
            const currentFilters = get().movementFilters;
            set({ movementFilters: { ...currentFilters, ...filters } });
          }
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement de l\'historique',
            isLoadingMovements: false 
          });
        }
      },

      // Ajouter du stock
      addStock: async (_skuId: string, _quantity: number) => {
        set({ isAddingStock: true, error: null });
        try {
          // await vendorStockService.addStock({ skuId, quantity });
          
          // Recharger les données après ajout
          await Promise.all([
            get().loadStock(),
            get().loadStats(),
            get().loadLowStockItems()
          ]);
          
          set({ isAddingStock: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de l\'ajout de stock',
            isAddingStock: false 
          });
        }
      },

      // Supprimer un produit specifique du stock
      removeProduct: async (skuId: string) => {
        set({ isRemovingProduct: true, error: null });
        try {
          const result = await vendorStockService.removeProduct(skuId);
          
          if (result.success) {
            // Retirer le produit du portfolio local
            const currentPortfolio = get().portfolio;
            const updatedPortfolio = currentPortfolio.filter(item => item.skuId !== skuId);
            
            set({
              portfolio: updatedPortfolio,
              filteredPortfolio: updatedPortfolio,
              isRemovingProduct: false
            });
            
            // Recharger les stats et alertes
            await Promise.all([
              get().loadStats(),
              get().loadLowStockItems()
            ]);
          } else {
            set({ isRemovingProduct: false });
          }
          
          return { success: result.success, message: result.message };
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Erreur lors de la suppression';
          set({ 
            error: message,
            isRemovingProduct: false 
          });
          return { success: false, message };
        }
      },

      // Decharger tout le stock (mise a jour optimiste)
      unloadAllStock: async () => {
        console.log('[unloadAllStock] Debut du dechargement...');
        
        const currentPortfolio = get().portfolio;
        const currentLowStockItems = get().lowStockItems;
        const currentStats = get().stats;
        
        console.log('[unloadAllStock] Portfolio actuel:', currentPortfolio.length, 'produits');
        console.log('[unloadAllStock] Portfolio data:', currentPortfolio);
        
        // Verifier s'il y a du stock a decharger
        if (currentPortfolio.length === 0) {
          console.log('[unloadAllStock] Aucun produit dans le portfolio, annulation');
          return;
        }
        
        // Recuperer tous les skuIds
        const skuIds = currentPortfolio.map(item => item.skuId);
        console.log('[unloadAllStock] SKU IDs a supprimer:', skuIds);
        
        // Mise a jour optimiste : vider le store IMMEDIATEMENT
        console.log('[unloadAllStock] Mise a jour optimiste - vidage du store...');
        set({ 
          isUnloadingStock: true, 
          error: null,
          portfolio: [],
          filteredPortfolio: [],
          lowStockItems: [],
          stats: currentStats ? {
            ...currentStats,
            totalProducts: 0,
            totalQuantity: 0,
            lowStockCount: 0
          } : null
        });
        
        try {
          // Appeler l'API pour confirmer la suppression
          console.log('[unloadAllStock] Appel API removeMultipleProducts...');
          const result = await vendorStockService.removeMultipleProducts(skuIds);
          console.log('[unloadAllStock] Reponse API:', result);
          
          if (result.success) {
            console.log('[unloadAllStock] Succes! Nettoyage du cache...');
            // Nettoyer le cache localStorage
            localStorage.removeItem('lowStockAlerts');
            localStorage.removeItem('lowStockAlertsUpdatedAt');
            
            set({ isUnloadingStock: false });
            
            // Recharger les stats fraiches
            console.log('[unloadAllStock] Rechargement des stats...');
            await get().loadStats();
            console.log('[unloadAllStock] Termine avec succes!');
          } else {
            console.log('[unloadAllStock] Echec API:', result.message);
            // Rollback en cas d'echec : restaurer les donnees
            set({ 
              portfolio: currentPortfolio,
              filteredPortfolio: currentPortfolio,
              lowStockItems: currentLowStockItems,
              stats: currentStats,
              error: result.message,
              isUnloadingStock: false 
            });
            console.log('[unloadAllStock] Rollback effectue');
          }
        } catch (error) {
          console.error('[unloadAllStock] Erreur:', error);
          // Rollback en cas d'erreur : restaurer les donnees
          set({ 
            portfolio: currentPortfolio,
            filteredPortfolio: currentPortfolio,
            lowStockItems: currentLowStockItems,
            stats: currentStats,
            error: error instanceof Error ? error.message : 'Erreur lors du dechargement du stock',
            isUnloadingStock: false 
          });
          console.log('[unloadAllStock] Rollback effectue apres erreur');
        }
      },

      // Mettre à jour un élément de stock
      updateStockItem: async (id: string, data: Partial<VendorStockItem>) => {
        set({ isLoading: true, error: null });
        try {
          // Simuler la mise à jour (à remplacer par le vrai service)
          const currentPortfolio = get().portfolio;
          const updatedPortfolio = currentPortfolio.map(item => 
            item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item
          );
          
          set({ 
            portfolio: updatedPortfolio,
            filteredPortfolio: updatedPortfolio,
            isLoading: false 
          });
          
          // Appliquer les filtres
          get().applyFilters();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour',
            isLoading: false 
          });
        }
      },

      // Définir les filtres
      setFilters: (newFilters: Partial<StockFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
        get().applyFilters();
      },

      // Définir les filtres de mouvements
      setMovementFilters: (newFilters: Partial<StockMovementFilters>) => {
        const currentFilters = get().movementFilters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ movementFilters: updatedFilters });
      },

      // Appliquer les filtres
      applyFilters: () => {
        const { portfolio, filters } = get();
        let filtered = [...portfolio];

        // Filtre par recherche (description du produit)
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filtered = filtered.filter(item => 
            item.sku.shortDescription.toLowerCase().includes(searchTerm) ||
            item.sku.fullDescription?.toLowerCase().includes(searchTerm) ||
            item.sku.packSize?.packFormat?.brand?.name?.toLowerCase().includes(searchTerm)
          );
        }

        // Filtre par catégorie
        if (filters.categoryId) {
          filtered = filtered.filter(item => 
            item.sku.packSize?.packFormat?.brand?.subCategory?.category?.name === filters.categoryId
          );
        }

        // Filtre par marque
        if (filters.brandId) {
          filtered = filtered.filter(item => 
            item.sku.packSize?.packFormat?.brand?.name === filters.brandId
          );
        }

        // Filtre stock faible uniquement
        if (filters.lowStockOnly) {
          filtered = filtered.filter(item => 
            item.quantity <= 10 // Seuil par défaut
          );
        }

        // Filtre par statut actif (basé sur la quantité > 0)
        if (filters.isActive !== undefined) {
          filtered = filtered.filter(item => 
            filters.isActive ? item.quantity > 0 : item.quantity === 0
          );
        }

        // Tri
        if (filters.sortBy) {
          filtered.sort((a, b) => {
            let valueA: string | number, valueB: string | number;
            
            switch (filters.sortBy) {
              case 'name':
                valueA = a.sku.shortDescription.toLowerCase();
                valueB = b.sku.shortDescription.toLowerCase();
                break;
              case 'quantity':
                valueA = a.quantity;
                valueB = b.quantity;
                break;
              case 'price':
                valueA = a.sku.priceHt || 0;
                valueB = b.sku.priceHt || 0;
                break;
              case 'lastUpdated':
                valueA = new Date(a.updatedAt).getTime();
                valueB = new Date(b.updatedAt).getTime();
                break;
              default:
                return 0;
            }

            if (valueA < valueB) return filters.sortOrder === 'asc' ? -1 : 1;
            if (valueA > valueB) return filters.sortOrder === 'asc' ? 1 : -1;
            return 0;
          });
        }

        set({ filteredPortfolio: filtered });
      },

      // Effacer les filtres
      clearFilters: () => {
        const { portfolio } = get();
        set({ 
          filters: {
            sortBy: 'name',
            sortOrder: 'asc',
          },
          filteredPortfolio: portfolio 
        });
        get().applyFilters();
      },

      // Définir l'élément sélectionné
      setSelectedStockItem: (item: VendorStockItem | null) => {
        set({ selectedStockItem: item });
      },

      // Vider tout le stock
      clearStock: () => {
        set({
          portfolio: [],
          filteredPortfolio: [],
          lowStockItems: [],
          stockMovements: [],
          stats: null,
          selectedStockItem: null,
          filters: {
            sortBy: 'name',
            sortOrder: 'asc',
          },
          movementFilters: {
            limit: 50,
          },
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
          get().loadStock(),
          get().loadStats(),
          get().loadLowStockItems(),
          get().loadStockMovements(get().movementFilters)
        ]);
      },
      }),
      {
        name: 'vendor-stock-store',
        // Persister seulement les donnees, pas les etats de chargement
        partialize: (state) => ({
          portfolio: state.portfolio,
          filteredPortfolio: state.filteredPortfolio,
          lowStockItems: state.lowStockItems,
          stockMovements: state.stockMovements,
          stats: state.stats,
          filters: state.filters,
          movementFilters: state.movementFilters,
        }),
      }
    ),
    {
      name: 'vendor-stock-store',
    }
  )
);
