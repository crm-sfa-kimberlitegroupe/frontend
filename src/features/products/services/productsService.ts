import api from '@/core/api/api';

export interface SKU {
  id: string;
  ean: string;
  name: string;
  brand: string;
  category?: string;
  description?: string;
  photo?: string;
  priceHt: number;
  vatRate: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSKUData {
  ean: string;
  name: string;
  brand: string;
  category?: string;
  description?: string;
  photo?: string;
  priceHt: number;
  vatRate: number;
  active?: boolean;
}

export interface UpdateSKUData {
  ean?: string;
  name?: string;
  brand?: string;
  category?: string;
  description?: string;
  photo?: string;
  priceHt?: number;
  vatRate?: number;
  active?: boolean;
}

export interface SKUFilters {
  category?: string;
  brand?: string;
  active?: boolean;
  search?: string;
}

export interface SKUStats {
  total: number;
  active: number;
  inactive: number;
}

class SKUsService {
  private baseUrl = '/skus';

  /**
   * Récupérer tous les produits avec filtres optionnels
   */
  async getAll(filters?: SKUFilters): Promise<SKU[]> {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.brand) params.append('brand', filters.brand);
    if (filters?.active !== undefined) params.append('active', String(filters.active));
    if (filters?.search) params.append('search', filters.search);

    const queryString = params.toString();
    const url = queryString ? `${this.baseUrl}?${queryString}` : this.baseUrl;

    const response = await api.get(url);
    return response.data;
  }

  /**
   * Récupérer un produit par ID
   */
  async getById(id: string): Promise<SKU> {
    const response = await api.get(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Récupérer un produit par EAN
   */
  async getByEan(ean: string): Promise<SKU> {
    const response = await api.get(`${this.baseUrl}/ean/${ean}`);
    return response.data;
  }

  /**
   * Créer un nouveau produit
   */
  async create(data: CreateSKUData): Promise<SKU> {
    const response = await api.post(this.baseUrl, data);
    return response.data;
  }

  /**
   * Mettre à jour un produit
   */
  async update(id: string, data: UpdateSKUData): Promise<SKU> {
    const response = await api.put(`${this.baseUrl}/${id}`, data);
    return response.data;
  }

  /**
   * Activer/Désactiver un produit
   */
  async toggleActive(id: string): Promise<SKU> {
    const response = await api.put(`${this.baseUrl}/${id}/toggle-active`);
    return response.data;
  }

  /**
   * Supprimer un produit
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Obtenir les statistiques des produits
   */
  async getStats(): Promise<SKUStats> {
    const response = await api.get(`${this.baseUrl}/stats`);
    return response.data;
  }

  /**
   * Obtenir la liste des catégories
   */
  async getCategories(): Promise<string[]> {
    const response = await api.get(`${this.baseUrl}/categories`);
    return response.data;
  }

  async getBrands(): Promise<string[]> {
    const response = await api.get(`${this.baseUrl}/brands`);
    return response.data;
  }

  calculatePriceTTC(priceHt: number, vatRate: number): number {
    return Number((priceHt * (1 + vatRate / 100)).toFixed(2));
  }
}

export const skusService = new SKUsService();
