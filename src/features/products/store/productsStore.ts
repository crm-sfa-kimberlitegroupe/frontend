import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { productsService, type Product, type ProductFilters, type ProductStats } from '../services/productsService';

interface ProductsState {
  // Data
  products: Product[];
  stats: ProductStats | null;
  categories: string[];
  
  // Loading states
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  
  // Last fetch timestamp
  lastFetch: number | null;
  
  // Actions
  fetchProducts: (filters?: ProductFilters, force?: boolean) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  createProduct: (data: any) => Promise<Product>;
  updateProduct: (id: string, data: any) => Promise<Product>;
  deleteProduct: (id: string) => Promise<void>;
  toggleProductStatus: (id: string) => Promise<Product>;
  updateProductStock: (id: string, quantity: number) => Promise<Product>;
  clearCache: () => void;
  reset: () => void;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const initialState = {
  products: [],
  stats: null,
  categories: [],
  loading: false,
  refreshing: false,
  error: null,
  lastFetch: null,
};

export const useProductsStore = create<ProductsState>()(
  persist(
    (set, get) => ({
      ...initialState,

      /**
       * Récupérer tous les produits avec cache
       */
      fetchProducts: async (filters?: ProductFilters, force = false) => {
        const state = get();
        const now = Date.now();

        // Utiliser le cache si disponible et récent (sauf si force = true)
        if (
          !force &&
          state.products.length > 0 &&
          state.lastFetch &&
          now - state.lastFetch < CACHE_DURATION
        ) {
          console.log('📦 [ProductsStore] Utilisation du cache');
          return;
        }

        try {
          const isInitialLoad = state.products.length === 0;
          set({ 
            loading: isInitialLoad, 
            refreshing: !isInitialLoad,
            error: null 
          });

          console.log('🔄 [ProductsStore] Chargement des produits depuis l\'API...');
          const products = await productsService.getAll(filters);

          set({
            products,
            loading: false,
            refreshing: false,
            lastFetch: now,
            error: null,
          });

          console.log(`✅ [ProductsStore] ${products.length} produits chargés`);
        } catch (error: any) {
          console.error('❌ [ProductsStore] Erreur lors du chargement:', error);
          set({
            loading: false,
            refreshing: false,
            error: error.message || 'Erreur lors du chargement des produits',
          });
          throw error;
        }
      },

      /**
       * Récupérer les statistiques
       */
      fetchStats: async () => {
        try {
          console.log('📊 [ProductsStore] Chargement des statistiques...');
          const stats = await productsService.getStats();
          set({ stats });
          console.log('✅ [ProductsStore] Statistiques chargées:', stats);
        } catch (error: any) {
          console.error('❌ [ProductsStore] Erreur stats:', error);
          throw error;
        }
      },

      /**
       * Récupérer les catégories
       */
      fetchCategories: async () => {
        try {
          console.log('📂 [ProductsStore] Chargement des catégories...');
          const categories = await productsService.getCategories();
          set({ categories });
          console.log(`✅ [ProductsStore] ${categories.length} catégories chargées`);
        } catch (error: any) {
          console.error('❌ [ProductsStore] Erreur catégories:', error);
          throw error;
        }
      },

      /**
       * Créer un nouveau produit
       */
      createProduct: async (data: any) => {
        try {
          console.log('➕ [ProductsStore] Création d\'un produit...');
          const newProduct = await productsService.create(data);
          
          // Ajouter le produit au début de la liste
          set((state) => ({
            products: [newProduct, ...state.products],
          }));

          console.log('✅ [ProductsStore] Produit créé:', newProduct.name);
          
          // Rafraîchir les stats
          get().fetchStats();
          
          return newProduct;
        } catch (error: any) {
          console.error('❌ [ProductsStore] Erreur création:', error);
          throw error;
        }
      },

      /**
       * Mettre à jour un produit
       */
      updateProduct: async (id: string, data: any) => {
        try {
          console.log(`✏️ [ProductsStore] Mise à jour du produit ${id}...`);
          const updatedProduct = await productsService.update(id, data);
          
          // Mettre à jour le produit dans la liste
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? updatedProduct : p
            ),
          }));

          console.log('✅ [ProductsStore] Produit mis à jour:', updatedProduct.name);
          
          return updatedProduct;
        } catch (error: any) {
          console.error('❌ [ProductsStore] Erreur mise à jour:', error);
          throw error;
        }
      },

      /**
       * Supprimer un produit
       */
      deleteProduct: async (id: string) => {
        try {
          console.log(`🗑️ [ProductsStore] Suppression du produit ${id}...`);
          await productsService.delete(id);
          
          // Retirer le produit de la liste
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
          }));

          console.log('✅ [ProductsStore] Produit supprimé');
          
          // Rafraîchir les stats
          get().fetchStats();
        } catch (error: any) {
          console.error('❌ [ProductsStore] Erreur suppression:', error);
          throw error;
        }
      },

      /**
       * Activer/Désactiver un produit
       */
      toggleProductStatus: async (id: string) => {
        try {
          console.log(`🔄 [ProductsStore] Toggle status du produit ${id}...`);
          const updatedProduct = await productsService.toggleStatus(id);
          
          // Mettre à jour le produit dans la liste
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? updatedProduct : p
            ),
          }));

          console.log('✅ [ProductsStore] Statut modifié:', updatedProduct.status);
          
          // Rafraîchir les stats
          get().fetchStats();
          
          return updatedProduct;
        } catch (error: any) {
          console.error('❌ [ProductsStore] Erreur toggle status:', error);
          throw error;
        }
      },

      /**
       * Mettre à jour le stock d'un produit
       */
      updateProductStock: async (id: string, quantity: number) => {
        try {
          console.log(`📦 [ProductsStore] Mise à jour stock du produit ${id}...`);
          const updatedProduct = await productsService.updateStock(id, quantity);
          
          // Mettre à jour le produit dans la liste
          set((state) => ({
            products: state.products.map((p) =>
              p.id === id ? updatedProduct : p
            ),
          }));

          console.log('✅ [ProductsStore] Stock mis à jour:', updatedProduct.stock);
          
          // Rafraîchir les stats
          get().fetchStats();
          
          return updatedProduct;
        } catch (error: any) {
          console.error('❌ [ProductsStore] Erreur mise à jour stock:', error);
          throw error;
        }
      },

      /**
       * Vider le cache
       */
      clearCache: () => {
        console.log('🧹 [ProductsStore] Nettoyage du cache');
        set({ lastFetch: null });
      },

      /**
       * Réinitialiser le store
       */
      reset: () => {
        console.log('🔄 [ProductsStore] Réinitialisation du store');
        set(initialState);
      },
    }),
    {
      name: 'products-storage',
      // Ne persister que les données, pas les états de chargement
      partialize: (state) => ({
        products: state.products,
        stats: state.stats,
        categories: state.categories,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
