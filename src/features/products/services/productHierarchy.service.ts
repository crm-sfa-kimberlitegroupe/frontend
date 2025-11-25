import api from '../../../core/api/api';

// Types pour la hiérarchie des produits
export interface Category {
  id: string;
  code: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  subCategories?: SubCategory[];
  _count?: {
    subCategories: number;
    skus: number;
  };
}

export interface SubCategory {
  id: string;
  code: string;
  name: string;
  description?: string;
  categoryId: string;
  active: boolean;
  category?: Category;
  brands?: Brand[];
  _count?: {
    brands: number;
    skus: number;
  };
}

export interface Brand {
  id: string;
  code: string;
  name: string;
  description?: string;
  subCategoryId: string;
  active: boolean;
  subCategory?: SubCategory;
  subBrands?: SubBrand[];
  _count?: {
    subBrands: number;
    skus: number;
  };
}

export interface SubBrand {
  id: string;
  code: string;
  name: string;
  description?: string;
  brandId: string;
  active: boolean;
  brand?: Brand;
  packFormats?: PackFormat[];
  _count?: {
    packFormats: number;
    skus: number;
  };
}

export interface PackFormat {
  id: string;
  code: string;
  name: string;
  displayName?: string;
  description?: string;
  brandId: string;
  active: boolean;
  brand?: Brand;
  packSizes?: PackSize[];
  _count?: {
    packSizes: number;
    skus: number;
  };
}

export interface PackSize {
  id: string;
  code: string;
  name: string;
  displayName?: string;
  description?: string;
  packFormatId: string;
  active: boolean;
  packFormat?: PackFormat;
  skus?: SKU[];
  _count?: {
    skus: number;
  };
}

export interface SKU {
  id: string;
  code: string;
  ean: string;
  shortDescription: string;
  fullDescription: string;
  packSizeId: string;
  photo?: string;
  priceHt: number | string; // Prisma Decimal retourné comme string
  priceTtc: number | string; // Prisma Decimal retourné comme string
  vatRate: number | string; // Prisma Decimal retourné comme string
  active: boolean;
  createdAt: string;
  updatedAt: string;
  packSize?: PackSize;
}

export interface HierarchyTree {
  categories: Category[];
  totalCategories: number;
  totalSubCategories: number;
  totalBrands: number;
  totalSubBrands: number;
  totalPackFormats: number;
  totalPackSizes: number;
  totalSKUs: number;
  activeSKUs: number;
}

export interface ProductStatistics {
  totalCategories: number;
  activeCategories: number;
  totalSubCategories: number;
  activeSubCategories: number;
  totalBrands: number;
  activeBrands: number;
  totalSubBrands: number;
  activeSubBrands: number;
  totalPackFormats: number;
  activePackFormats: number;
  totalPackSizes: number;
  activePackSizes: number;
  totalSKUs: number;
  activeSKUs: number;
  averageSKUsPerCategory: number;
  averageSKUsPerBrand: number;
}

class ProductHierarchyService {
  private baseUrl = '/admin/products';

  // Categories
  async getCategories(active?: boolean): Promise<Category[]> {
    try {
      const params: Record<string, any> = {};
      if (active !== undefined) params.active = active;
      const response = await api.get(`${this.baseUrl}/categories`, { params });
      
      // L'API retourne directement le tableau, pas dans response.data
      const categories = Array.isArray(response) ? response : response.data;
      
      return categories || [];
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur récupération catégories:', error);
      throw error;
    }
  }

  async getCategory(id: string): Promise<Category> {
    try {
      const response = await api.get(`${this.baseUrl}/categories/${id}`);
      return response.data;
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur récupération catégorie:', error);
      throw error;
    }
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    try {
      const response = await api.post(`${this.baseUrl}/categories`, data);
      // L'API retourne directement l'objet
      const category = Array.isArray(response) ? response[0] : response.data || response;
      return category;
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur création catégorie:', {
        error: error,
        errorMessage: (error as Error)?.message,
        errorResponse: (error as { response?: { data?: unknown } })?.response?.data
      });
      throw error;
    }
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    try {
      const response = await api.put(`${this.baseUrl}/categories/${id}`, data);
      // L'API retourne directement l'objet
      const category = Array.isArray(response) ? response[0] : response.data || response;
      return category;
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur mise à jour catégorie:', {
        error: error,
        errorMessage: (error as Error)?.message,
        errorResponse: (error as { response?: { data?: unknown } })?.response?.data
      });
      throw error;
    }
  }

  async deleteCategory(id: string): Promise<void> {
    try {
      await api.delete(`${this.baseUrl}/categories/${id}`);
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur suppression catégorie:', error);
      throw error;
    }
  }

  async toggleCategoryStatus(id: string): Promise<Category> {
    const response = await api.patch(`${this.baseUrl}/categories/${id}/toggle-status`);
    return response.data;
  }

  // Sub-Categories
  async getSubCategories(categoryId?: string, active?: boolean): Promise<SubCategory[]> {
    const params: Record<string, any> = {};
    if (categoryId) params.categoryId = categoryId;
    if (active !== undefined) params.active = active;
    const response = await api.get(`${this.baseUrl}/sub-categories`, { params });
    // L'API retourne directement le tableau
    return Array.isArray(response) ? response : response.data || [];
  }

  async createSubCategory(data: Partial<SubCategory>): Promise<SubCategory> {
    try {
      const response = await api.post(`${this.baseUrl}/sub-categories`, data);
      const subCategory = Array.isArray(response) ? response[0] : response.data || response;
      return subCategory;
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur création sous-catégorie:', {
        error: error,
        errorMessage: (error as Error)?.message,
        errorResponse: (error as { response?: { data?: unknown } })?.response?.data,
        dataSent: data
      });
      throw error;
    }
  }

  async updateSubCategory(id: string, data: Partial<SubCategory>): Promise<SubCategory> {
    const response = await api.put(`${this.baseUrl}/sub-categories/${id}`, data);
    return Array.isArray(response) ? response[0] : response.data || response;
  }

  // Brands
  async getBrands(subCategoryId?: string, active?: boolean): Promise<Brand[]> {
    const params: Record<string, any> = {};
    if (subCategoryId) params.subCategoryId = subCategoryId;
    if (active !== undefined) params.active = active;
    const response = await api.get(`${this.baseUrl}/brands`, { params });
    // L'API retourne directement le tableau
    return Array.isArray(response) ? response : response.data || [];
  }

  async createBrand(data: Partial<Brand>): Promise<Brand> {
    try {
      const response = await api.post(`${this.baseUrl}/brands`, data);
      const brand = Array.isArray(response) ? response[0] : response.data || response;
      return brand;
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur création marque:', {
        error: error,
        errorMessage: (error as Error)?.message,
        errorResponse: (error as { response?: { data?: unknown } })?.response?.data,
        dataSent: data
      });
      throw error;
    }
  }

  async updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
    try {
      const response = await api.put(`${this.baseUrl}/brands/${id}`, data);
      const brand = Array.isArray(response) ? response[0] : response.data || response;
      return brand;
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur mise à jour marque:', {
        error: error,
        errorMessage: (error as Error)?.message,
        errorResponse: (error as { response?: { data?: unknown } })?.response?.data
      });
      throw error;
    }
  }

  // Sub-Brands
  async createSubBrand(data: Partial<SubBrand>): Promise<SubBrand> {
    const response = await api.post(`${this.baseUrl}/sub-brands`, data);
    return response.data;
  }

  // Pack Formats
  async getPackFormats(brandId?: string, active?: boolean): Promise<PackFormat[]> {
    const params: Record<string, any> = {};
    if (brandId) params.brandId = brandId;
    if (active !== undefined) params.active = active;
    const response = await api.get(`${this.baseUrl}/pack-formats`, { params });
    return Array.isArray(response) ? response : response.data || [];
  }

  async createPackFormat(data: Partial<PackFormat>): Promise<PackFormat> {
    try {
      const response = await api.post(`${this.baseUrl}/pack-formats`, data);
      const format = Array.isArray(response) ? response[0] : response.data || response;
      return format;
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur création format:', error);
      throw error;
    }
  }

  // Pack Sizes
  async getPackSizes(packFormatId?: string, active?: boolean): Promise<PackSize[]> {
    const params: Record<string, any> = {};
    if (packFormatId) params.packFormatId = packFormatId;
    if (active !== undefined) params.active = active;
    const response = await api.get(`${this.baseUrl}/pack-sizes`, { params });
    return Array.isArray(response) ? response : response.data || [];
  }

  async createPackSize(data: Partial<PackSize>): Promise<PackSize> {
    try {
      const response = await api.post(`${this.baseUrl}/pack-sizes`, data);
      const size = Array.isArray(response) ? response[0] : response.data || response;
      return size;
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur création taille:', error);
      throw error;
    }
  }

  // SKUs
  async getSKUs(): Promise<{ skus: SKU[]; total: number }> {
    try {
      const response = await api.get(`${this.baseUrl}/skus`);
      
      // Le backend retourne { items, total } mais on veut { skus, total }
      const data = response.data || response;
      const result = {
        skus: data.items || [],
        total: data.total || 0
      };
      
      return result;
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur récupération SKUs:', error);
      throw error;
    }
  }

  async getSKU(id: string): Promise<SKU> {
    const response = await api.get(`${this.baseUrl}/skus/${id}`);
    return response.data;
  }

  async createSKU(data: Partial<SKU>): Promise<SKU> {
    const response = await api.post(`${this.baseUrl}/skus`, data);
    return response.data;
  }

  async updateSKU(id: string, data: Partial<SKU>): Promise<SKU> {
    const response = await api.put(`${this.baseUrl}/skus/${id}`, data);
    return response.data;
  }

  async deleteSKU(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/skus/${id}`);
  }

  async toggleSKUStatus(id: string): Promise<SKU> {
    const response = await api.patch(`${this.baseUrl}/skus/${id}/toggle-status`);
    return response.data;
  }

  async uploadSKUImage(file: File): Promise<{ success: boolean; imageUrl: string; message: string }> {
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await api.post(`${this.baseUrl}/skus/upload-image`, formData);
      // L'API retourne directement l'objet, pas dans response.data
      return response;
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur upload image:', error);
      throw error;
    }
  }

  // Utilities
  async getFullHierarchyTree(): Promise<HierarchyTree> {
    const response = await api.get(`${this.baseUrl}/hierarchy/tree`);
    return response.data;
  }

  async getStatistics(): Promise<ProductStatistics> {
    try {
      const response = await api.get(`${this.baseUrl}/statistics`);
      // L'API retourne directement l'objet de statistiques
      const stats = response;
      return stats;
    } catch (error) {
      console.error('[ProductHierarchyService] Erreur récupération statistiques:', {
        error: error,
        errorMessage: (error as Error)?.message,
        errorResponse: (error as { response?: { data?: unknown } })?.response?.data
      });
      throw error;
    }
  }
}

export const productHierarchyService = new ProductHierarchyService();
