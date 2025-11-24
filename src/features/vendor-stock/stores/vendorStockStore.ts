/**
 * Store Zustand pour la gestion du stock vendeur
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
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
  
  // États de chargement
  isLoading: boolean;
  isLoadingStats: boolean;
  isLoadingMovements: boolean;
  isAddingStock: boolean;
  isUnloadingStock: boolean;
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
          // Utiliser des données simulées pour le développement
          const mockPortfolio: VendorStockItem[] = [
            {
              id: '1',
              skuId: 'coca-33cl',
              quantity: 24,
              sku: {
                id: 'coca-33cl',
                ean: '5449000000996',
                fullDescription: 'Coca-Cola Original 33cl Canette',
                shortDescription: 'Coca-Cola 33cl',
                photo: null,
                priceHt: 250,
                packSize: {
                  name: '33cl',
                  displayName: '33cl',
                  packFormat: {
                    name: 'canette',
                    displayName: 'Canette',
                    brand: {
                      name: 'coca-cola',
                      displayName: 'Coca-Cola',
                      subCategory: {
                        name: 'sodas',
                        displayName: 'Sodas',
                        category: {
                          name: 'boissons',
                          displayName: 'Boissons'
                        }
                      }
                    }
                  }
                }
              },
              updatedAt: new Date().toISOString()
            },
            {
              id: '2',
              skuId: 'castel-65cl',
              quantity: 18,
              sku: {
                id: 'castel-65cl',
                ean: '3760074580026',
                fullDescription: 'Castel Beer 65cl Bouteille',
                shortDescription: 'Castel Beer 65cl',
                photo: null,
                priceHt: 300,
                packSize: {
                  name: '65cl',
                  displayName: '65cl',
                  packFormat: {
                    name: 'bouteille',
                    displayName: 'Bouteille',
                    brand: {
                      name: 'castel',
                      displayName: 'Castel',
                      subCategory: {
                        name: 'bieres',
                        displayName: 'Bières',
                        category: {
                          name: 'boissons',
                          displayName: 'Boissons'
                        }
                      }
                    }
                  }
                }
              },
              updatedAt: new Date().toISOString()
            },
            {
              id: '3',
              skuId: 'fanta-33cl',
              quantity: 5, // Stock faible
              sku: {
                id: 'fanta-33cl',
                ean: '5449000017314',
                fullDescription: 'Fanta Orange 33cl Canette',
                shortDescription: 'Fanta Orange 33cl',
                photo: null,
                priceHt: 250,
                packSize: {
                  name: '33cl',
                  displayName: '33cl',
                  packFormat: {
                    name: 'canette',
                    displayName: 'Canette',
                    brand: {
                      name: 'fanta',
                      displayName: 'Fanta',
                      subCategory: {
                        name: 'sodas',
                        displayName: 'Sodas',
                        category: {
                          name: 'boissons',
                          displayName: 'Boissons'
                        }
                      }
                    }
                  }
                }
              },
              updatedAt: new Date().toISOString()
            },
            {
              id: '4',
              skuId: 'sprite-33cl',
              quantity: 2, // Stock très faible
              sku: {
                id: 'sprite-33cl',
                ean: '5449000017321',
                fullDescription: 'Sprite 33cl Canette',
                shortDescription: 'Sprite 33cl',
                photo: null,
                priceHt: 250,
                packSize: {
                  name: '33cl',
                  displayName: '33cl',
                  packFormat: {
                    name: 'canette',
                    displayName: 'Canette',
                    brand: {
                      name: 'sprite',
                      displayName: 'Sprite',
                      subCategory: {
                        name: 'sodas',
                        displayName: 'Sodas',
                        category: {
                          name: 'boissons',
                          displayName: 'Boissons'
                        }
                      }
                    }
                  }
                }
              },
              updatedAt: new Date().toISOString()
            }
          ];
          
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 300));
          
          set({ 
            portfolio: mockPortfolio, 
            filteredPortfolio: mockPortfolio,
            isLoading: false 
          });
          
          // Appliquer les filtres si ils existent
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
          // Utiliser des statistiques simulées
          const mockStats: StockStats = {
            totalProducts: 4,
            totalQuantity: 49,
            lowStockCount: 2,
            todayMovements: 8
          };
          
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 200));
          
          set({ 
            stats: mockStats,
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
      loadLowStockItems: async () => {
        set({ isLoading: true, error: null });
        try {
          // Utiliser des alertes simulées
          const mockLowStockItems: LowStockItem[] = [
            {
              id: '3',
              quantity: 5,
              alertThreshold: 10,
              skuId: 'fanta-33cl',
              userId: 'user-1',
              updatedAt: new Date().toISOString(),
              sku: {
                id: 'fanta-33cl',
                shortDescription: 'Fanta Orange 33cl',
                photo: null
              }
            },
            {
              id: '4',
              quantity: 2,
              alertThreshold: 10,
              skuId: 'sprite-33cl',
              userId: 'user-1',
              updatedAt: new Date().toISOString(),
              sku: {
                id: 'sprite-33cl',
                shortDescription: 'Sprite 33cl',
                photo: null
              }
            }
          ];
          
          // Simuler un délai réseau
          await new Promise(resolve => setTimeout(resolve, 250));
          
          set({ 
            lowStockItems: mockLowStockItems,
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

      // Décharger tout le stock
      unloadAllStock: async () => {
        set({ isUnloadingStock: true, error: null });
        try {
          await vendorStockService.unloadAllStock();
          
          // Recharger les données après déchargement
          await Promise.all([
            get().loadStock(),
            get().loadStats(),
            get().loadLowStockItems()
          ]);
          
          set({ isUnloadingStock: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du déchargement du stock',
            isUnloadingStock: false 
          });
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
    }
  )
);
