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
    name: string;
    brand: string;
    category: string | null;
    photo: string | null;
    priceHt: number;
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
  sku: {
    id: string;
    name: string;
    brand: string;
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
  async addStock(data: AddStockDto): Promise<any> {
    const response = await api.post('/vendor-stock/add', data);
    return response.data;
  },

  /**
   * Récupérer le portefeuille stock du vendeur
   */
  async getMyPortfolio(): Promise<VendorStockItem[]> {
    const response = await api.get('/vendor-stock/my-portfolio');
    return response.data;
  },

  /**
   * Récupérer l'historique des mouvements
   */
  async getHistory(filters?: HistoryFilters): Promise<StockHistoryItem[]> {
    const response = await api.get('/vendor-stock/history', {
      params: filters,
    });
    return response.data;
  },

  /**
   * Récupérer le stock d'un produit spécifique
   */
  async getStockForSku(skuId: string): Promise<{ skuId: string; quantity: number }> {
    const response = await api.get(`/vendor-stock/stock/${skuId}`, {
      params: { skuId },
    });
    return response.data;
  },

  /**
   * Récupérer les produits avec stock faible
   */
  async getLowStockItems(threshold = 10): Promise<LowStockItem[]> {
    const response = await api.get('/vendor-stock/low-stock', {
      params: { threshold },
    });
    return response.data;
  },

  /**
   * Récupérer les statistiques du portefeuille
   */
  async getStats(): Promise<StockStats> {
    const response = await api.get('/vendor-stock/stats');
    return response.data;
  },
};
