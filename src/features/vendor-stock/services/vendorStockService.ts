import api from '@/core/api/api';

export interface AddStockItemDto {
  skuId: string;
  quantity: number;
}

export interface AddStockDto {
  items: AddStockItemDto[];
  notes?: string;
}

export interface VendorStockItem {
  id: string;
  skuId: string;
  quantity: number;
  sku: {
    id: string;
    ean: string;
    fullDescription: string;
    shortDescription: string;
    photo: string | null;
    priceHt: number;
    packSize: {
      name: string;
      displayName: string;
      packFormat: {
        name: string;
        displayName: string;
        brand: {
          name: string;
          displayName: string;
          subCategory: {
            name: string;
            displayName: string;
            category: {
              name: string;
              displayName: string;
            };
          };
        };
      };
    };
  };
  updatedAt: string;
}

export interface StockHistoryItem {
  id: string;
  skuId: string;
  movementType: string;
  quantity: number;
  beforeQty: number;
  afterQty: number;
  notes: string | null;
  createdAt: string;
  sku: {
    name: string;
    brand: string;
  };
  order?: {
    id: string;
    outletId: string;
  } | null;
}

export interface StockStats {
  totalProducts: number;
  totalQuantity: number;
  lowStockCount: number;
  todayMovements: number;
}

export interface LowStockItem {
  id: string;
  quantity: number;
  alertThreshold: number;
  skuId: string;
  userId: string;
  updatedAt: string;
  sku: {
    id: string;
    shortDescription: string;
    photo: string | null;
  };
}

export interface HistoryFilters {
  movementType?: string;
  skuId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const vendorStockService = {
  /**
   * Ajouter du stock au portefeuille
   */
  async addStock(data: AddStockDto): Promise<{ message: string; items: VendorStockItem[] }> {
    const response = await api.post('/vendor-stock/add', data);
    return response;
  },

  /**
   * Récupérer le portefeuille stock du vendeur
   */
  async getMyPortfolio(): Promise<VendorStockItem[]> {
    const response = await api.get('/vendor-stock/my-portfolio');
    // api.get() retourne directement les données
    return Array.isArray(response) ? response : (response.data || response);
  },

  /**
   * Récupérer l'historique des mouvements
   */
  async getHistory(filters?: HistoryFilters): Promise<StockHistoryItem[]> {
    const response = await api.get('/vendor-stock/history', {
      params: filters,
    });
    return Array.isArray(response) ? response : (response.data || response);
  },

  /**
   * Récupérer le stock d'un produit spécifique
   */
  async getStockForSku(skuId: string): Promise<{ skuId: string; quantity: number }> {
    const response = await api.get(`/vendor-stock/stock/${skuId}`, {
      params: { skuId },
    });
    return response;
  },

  /**
   * Récupérer les produits avec stock faible
   */
  async getLowStockItems(threshold = 10): Promise<LowStockItem[]> {
    const response = await api.get('/vendor-stock/low-stock', {
      params: { threshold },
    });
    return Array.isArray(response) ? response : (response.data || response);
  },

  /**
   * Récupérer les statistiques du portefeuille
   */
  async getStats(): Promise<StockStats> {
    const response = await api.get('/vendor-stock/stats');
    return response;
  },

  /**
   * Decharger tout le stock (vider le portefeuille)
   */
  async unloadAllStock(): Promise<{ message: string; deletedCount: number }> {
    const response = await api.delete('/vendor-stock/unload-all');
    return response;
  },

  /**
   * Supprimer un produit specifique du stock
   */
  async removeProduct(skuId: string): Promise<{
    success: boolean;
    message: string;
    productName?: string;
    deletedQuantity?: number;
  }> {
    const response = await api.delete(`/vendor-stock/remove/${skuId}`);
    return response;
  },

  /**
   * Supprimer plusieurs produits du stock
   */
  async removeMultipleProducts(skuIds: string[]): Promise<{
    success: boolean;
    message: string;
    deletedCount: number;
  }> {
    console.log('[vendorStockService.removeMultipleProducts] Appel avec skuIds:', skuIds);
    console.log('[vendorStockService.removeMultipleProducts] Nombre de produits:', skuIds.length);
    
    try {
      const response = await api.post('/vendor-stock/remove-multiple', { skuIds });
      console.log('[vendorStockService.removeMultipleProducts] Reponse brute:', response);
      return response;
    } catch (error) {
      console.error('[vendorStockService.removeMultipleProducts] Erreur:', error);
      throw error;
    }
  },
};
