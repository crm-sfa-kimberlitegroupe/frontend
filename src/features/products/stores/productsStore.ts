/**
 * Store Zustand pour la gestion des produits
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types pour les produits
export interface Brand {
  id: string;
  name: string;
  logo?: string;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
  description?: string;
  isActive: boolean;
}

export interface SubCategory {
  id: string;
  name: string;
  displayName: string;
  categoryId: string;
  category?: Category;
  isActive: boolean;
}

export interface PackFormat {
  id: string;
  name: string;
  description?: string;
  brandId: string;
  brand?: Brand;
  subCategoryId: string;
  subCategory?: SubCategory;
  isActive: boolean;
}

export interface PackSize {
  id: string;
  size: string;
  unit: string;
  packFormatId: string;
  packFormat?: PackFormat;
  isActive: boolean;
}

export interface SKU {
  id: string;
  name: string;
  shortDescription: string;
  description?: string;
  barcode?: string;
  photo?: string;
  unitPrice: number;
  vatRate: number;
  packSizeId: string;
  packSize?: PackSize;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  brand: Brand;
  category: Category;
  subCategory: SubCategory;
  packFormats: PackFormat[];
  skus: SKU[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  search?: string;
  brandId?: string;
  categoryId?: string;
  subCategoryId?: string;
  isActive?: boolean;
  priceMin?: number;
  priceMax?: number;
}

export interface ProductStats {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
  totalSKUs: number;
  activeSKUs: number;
  byBrand: { [brandId: string]: number };
  byCategory: { [categoryId: string]: number };
  avgPrice: number;
  priceRange: { min: number; max: number };
}

interface ProductsState {
  // État des données
  products: Product[];
  filteredProducts: Product[];
  skus: SKU[];
  filteredSKUs: SKU[];
  brands: Brand[];
  categories: Category[];
  subCategories: SubCategory[];
  selectedProduct: Product | null;
  selectedSKU: SKU | null;
  stats: ProductStats | null;
  
  // États de chargement
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
  
  // Filtres
  filters: ProductFilters;
  
  // Actions
  loadProducts: () => Promise<void>;
  loadSKUs: () => Promise<void>;
  loadBrands: () => Promise<void>;
  loadCategories: () => Promise<void>;
  loadSubCategories: () => Promise<void>;
  loadProductById: (id: string) => Promise<void>;
  loadSKUById: (id: string) => Promise<void>;
  loadProductStats: () => Promise<void>;
  setFilters: (filters: Partial<ProductFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  setSelectedProduct: (product: Product | null) => void;
  setSelectedSKU: (sku: SKU | null) => void;
  clearProducts: () => void;
  clearError: () => void;
}

// Service API simulé (à remplacer par le vrai service)
const productsService = {
  async getBrands(): Promise<Brand[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', name: 'Coca-Cola', logo: 'https://via.placeholder.com/100x50?text=Coca-Cola', isActive: true },
          { id: '2', name: 'Pepsi', logo: 'https://via.placeholder.com/100x50?text=Pepsi', isActive: true },
          { id: '3', name: 'Fanta', logo: 'https://via.placeholder.com/100x50?text=Fanta', isActive: true },
          { id: '4', name: 'Sprite', logo: 'https://via.placeholder.com/100x50?text=Sprite', isActive: true },
          { id: '5', name: 'Castel', logo: 'https://via.placeholder.com/100x50?text=Castel', isActive: true },
        ]);
      }, 300);
    });
  },

  async getCategories(): Promise<Category[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', name: 'beverages', displayName: 'Boissons', description: 'Toutes les boissons', isActive: true },
          { id: '2', name: 'alcoholic', displayName: 'Boissons Alcoolisées', description: 'Bières, vins, spiritueux', isActive: true },
          { id: '3', name: 'snacks', displayName: 'Collations', description: 'Chips, biscuits, etc.', isActive: true },
        ]);
      }, 300);
    });
  },

  async getSubCategories(): Promise<SubCategory[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: '1', name: 'soft_drinks', displayName: 'Boissons Gazeuses', categoryId: '1', isActive: true },
          { id: '2', name: 'juices', displayName: 'Jus de Fruits', categoryId: '1', isActive: true },
          { id: '3', name: 'water', displayName: 'Eau', categoryId: '1', isActive: true },
          { id: '4', name: 'beer', displayName: 'Bières', categoryId: '2', isActive: true },
          { id: '5', name: 'wine', displayName: 'Vins', categoryId: '2', isActive: true },
        ]);
      }, 300);
    });
  },

  async getSKUs(): Promise<SKU[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'Coca-Cola 33cl',
            shortDescription: 'Coca-Cola 33cl',
            description: 'Boisson gazeuse Coca-Cola en canette de 33cl',
            barcode: '1234567890123',
            photo: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=200&fit=crop',
            unitPrice: 150,
            vatRate: 18,
            packSizeId: '1',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Coca-Cola 50cl',
            shortDescription: 'Coca-Cola 50cl',
            description: 'Boisson gazeuse Coca-Cola en bouteille de 50cl',
            barcode: '1234567890124',
            photo: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=200&h=200&fit=crop',
            unitPrice: 200,
            vatRate: 18,
            packSizeId: '2',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Fanta Orange 33cl',
            shortDescription: 'Fanta Orange 33cl',
            description: 'Boisson gazeuse Fanta Orange en canette de 33cl',
            barcode: '1234567890125',
            photo: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&h=200&fit=crop',
            unitPrice: 150,
            vatRate: 18,
            packSizeId: '3',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '4',
            name: 'Castel Beer 65cl',
            shortDescription: 'Castel 65cl',
            description: 'Bière Castel en bouteille de 65cl',
            barcode: '1234567890126',
            photo: 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=200&h=200&fit=crop',
            unitPrice: 300,
            vatRate: 18,
            packSizeId: '4',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '5',
            name: 'Sprite 33cl',
            shortDescription: 'Sprite 33cl',
            description: 'Boisson gazeuse Sprite en canette de 33cl',
            barcode: '1234567890127',
            photo: 'https://images.unsplash.com/photo-1625772299848-391b6a87d7b3?w=200&h=200&fit=crop',
            unitPrice: 150,
            vatRate: 18,
            packSizeId: '5',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }, 500);
    });
  },

  async getProducts(): Promise<Product[]> {
    // Simuler des produits avec relations complètes
    const brands = await this.getBrands();
    const categories = await this.getCategories();
    const subCategories = await this.getSubCategories();
    const skus = await this.getSKUs();

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: '1',
            name: 'Coca-Cola',
            description: 'La boisson gazeuse la plus populaire au monde',
            brand: brands[0],
            category: categories[0],
            subCategory: subCategories[0],
            packFormats: [],
            skus: skus.filter(sku => sku.name.includes('Coca-Cola')),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '2',
            name: 'Fanta Orange',
            description: 'Boisson gazeuse à l\'orange rafraîchissante',
            brand: brands[2],
            category: categories[0],
            subCategory: subCategories[0],
            packFormats: [],
            skus: skus.filter(sku => sku.name.includes('Fanta')),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: '3',
            name: 'Castel Beer',
            description: 'Bière premium de Côte d\'Ivoire',
            brand: brands[4],
            category: categories[1],
            subCategory: subCategories[3],
            packFormats: [],
            skus: skus.filter(sku => sku.name.includes('Castel')),
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }, 600);
    });
  },

  async getProductById(id: string): Promise<Product | null> {
    const products = await this.getProducts();
    return products.find(product => product.id === id) || null;
  },

  async getSKUById(id: string): Promise<SKU | null> {
    const skus = await this.getSKUs();
    return skus.find(sku => sku.id === id) || null;
  },

  async getStats(): Promise<ProductStats> {
    const products = await this.getProducts();
    const skus = await this.getSKUs();
    const activeProducts = products.filter(p => p.isActive);
    const activeSKUs = skus.filter(s => s.isActive);
    
    const byBrand: { [brandId: string]: number } = {};
    const byCategory: { [categoryId: string]: number } = {};
    
    products.forEach(product => {
      byBrand[product.brand.id] = (byBrand[product.brand.id] || 0) + 1;
      byCategory[product.category.id] = (byCategory[product.category.id] || 0) + 1;
    });

    const prices = activeSKUs.map(sku => sku.unitPrice);
    const avgPrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const priceRange = {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };

    return {
      totalProducts: products.length,
      activeProducts: activeProducts.length,
      inactiveProducts: products.length - activeProducts.length,
      totalSKUs: skus.length,
      activeSKUs: activeSKUs.length,
      byBrand,
      byCategory,
      avgPrice,
      priceRange,
    };
  },
};

export const useProductsStore = create<ProductsState>()(
  devtools(
    (set, get) => ({
      // État initial
      products: [],
      filteredProducts: [],
      skus: [],
      filteredSKUs: [],
      brands: [],
      categories: [],
      subCategories: [],
      selectedProduct: null,
      selectedSKU: null,
      stats: null,
      isLoading: false,
      isLoadingStats: false,
      error: null,
      filters: {},

      // Charger tous les produits
      loadProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const products = await productsService.getProducts();
          set({ 
            products, 
            filteredProducts: products,
            isLoading: false 
          });
          
          // Appliquer les filtres si ils existent
          get().applyFilters();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des produits',
            isLoading: false 
          });
        }
      },

      // Charger tous les SKUs
      loadSKUs: async () => {
        set({ isLoading: true, error: null });
        try {
          const skus = await productsService.getSKUs();
          set({ 
            skus, 
            filteredSKUs: skus,
            isLoading: false 
          });
          
          // Appliquer les filtres si ils existent
          get().applyFilters();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des SKUs',
            isLoading: false 
          });
        }
      },

      // Charger les marques
      loadBrands: async () => {
        set({ isLoading: true, error: null });
        try {
          const brands = await productsService.getBrands();
          set({ brands, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des marques',
            isLoading: false 
          });
        }
      },

      // Charger les catégories
      loadCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const [categories, subCategories] = await Promise.all([
            productsService.getCategories(),
            productsService.getSubCategories(),
          ]);
          set({ 
            categories, 
            subCategories,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des catégories',
            isLoading: false 
          });
        }
      },

      // Charger les sous-catégories
      loadSubCategories: async () => {
        set({ isLoading: true, error: null });
        try {
          const subCategories = await productsService.getSubCategories();
          set({ subCategories, isLoading: false });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des sous-catégories',
            isLoading: false 
          });
        }
      },

      // Charger un produit par ID
      loadProductById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const product = await productsService.getProductById(id);
          set({ 
            selectedProduct: product,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement du produit',
            isLoading: false 
          });
        }
      },

      // Charger un SKU par ID
      loadSKUById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const sku = await productsService.getSKUById(id);
          set({ 
            selectedSKU: sku,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement du SKU',
            isLoading: false 
          });
        }
      },

      // Charger les statistiques
      loadProductStats: async () => {
        set({ isLoadingStats: true, error: null });
        try {
          const stats = await productsService.getStats();
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

      // Définir les filtres
      setFilters: (newFilters: Partial<ProductFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
        get().applyFilters();
      },

      // Appliquer les filtres
      applyFilters: () => {
        const { products, skus, filters } = get();
        let filteredProducts = [...products];
        let filteredSKUs = [...skus];

        // Filtre par recherche (nom ou description)
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description?.toLowerCase().includes(searchTerm) ||
            product.brand.name.toLowerCase().includes(searchTerm)
          );
          
          filteredSKUs = filteredSKUs.filter(sku => 
            sku.name.toLowerCase().includes(searchTerm) ||
            sku.shortDescription.toLowerCase().includes(searchTerm) ||
            sku.description?.toLowerCase().includes(searchTerm)
          );
        }

        // Filtre par marque
        if (filters.brandId) {
          filteredProducts = filteredProducts.filter(product => product.brand.id === filters.brandId);
        }

        // Filtre par catégorie
        if (filters.categoryId) {
          filteredProducts = filteredProducts.filter(product => product.category.id === filters.categoryId);
        }

        // Filtre par sous-catégorie
        if (filters.subCategoryId) {
          filteredProducts = filteredProducts.filter(product => product.subCategory.id === filters.subCategoryId);
        }

        // Filtre par statut actif
        if (filters.isActive !== undefined) {
          filteredProducts = filteredProducts.filter(product => product.isActive === filters.isActive);
          filteredSKUs = filteredSKUs.filter(sku => sku.isActive === filters.isActive);
        }

        // Filtre par prix
        if (filters.priceMin !== undefined) {
          filteredSKUs = filteredSKUs.filter(sku => sku.unitPrice >= filters.priceMin!);
        }
        if (filters.priceMax !== undefined) {
          filteredSKUs = filteredSKUs.filter(sku => sku.unitPrice <= filters.priceMax!);
        }

        set({ filteredProducts, filteredSKUs });
      },

      // Effacer les filtres
      clearFilters: () => {
        const { products, skus } = get();
        set({ 
          filters: {},
          filteredProducts: products,
          filteredSKUs: skus
        });
      },

      // Définir le produit sélectionné
      setSelectedProduct: (product: Product | null) => {
        set({ selectedProduct: product });
      },

      // Définir le SKU sélectionné
      setSelectedSKU: (sku: SKU | null) => {
        set({ selectedSKU: sku });
      },

      // Vider tous les produits
      clearProducts: () => {
        set({
          products: [],
          filteredProducts: [],
          skus: [],
          filteredSKUs: [],
          brands: [],
          categories: [],
          subCategories: [],
          selectedProduct: null,
          selectedSKU: null,
          stats: null,
          filters: {},
          error: null,
        });
      },

      // Effacer l'erreur
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'products-store',
    }
  )
);
