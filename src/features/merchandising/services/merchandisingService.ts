import api from '@/core/api/api';

// Types pour le merchandising
export interface MerchCheckItem {
  skuId: string;
  isVisible: boolean;
  isPriceCorrect: boolean;
  isWellStocked: boolean;
  comment?: string;
}

export interface MerchPhoto {
  fileKey: string;
  lat?: number;
  lng?: number;
}

export interface CreateMerchandisingDto {
  visitId: string;
  items: MerchCheckItem[];
  photos?: MerchPhoto[];
  notes?: string;
}

export interface MerchCheckItemResponse {
  id: string;
  skuId: string;
  isVisible: boolean;
  isPriceCorrect: boolean;
  isWellStocked: boolean;
  comment: string | null;
  sku: {
    id: string;
    code: string;
    shortDescription: string;
    photo: string | null;
    priceTtc: number;
  };
}

export interface MerchPhotoResponse {
  id: string;
  fileKey: string;
  takenAt: string;
  lat: number | null;
  lng: number | null;
}

export interface MerchandisingResponse {
  id: string;
  visitId: string;
  score: number | null;
  notes: string | null;
  createdAt: string;
  merchItems: MerchCheckItemResponse[];
  merchPhotos: MerchPhotoResponse[];
  visit?: {
    outlet: {
      id: string;
      name: string;
    };
  };
}

export interface AvailableSKU {
  id: string;
  code: string;
  shortDescription: string;
  fullDescription: string;
  photo: string | null;
  priceTtc: number;
  quantity: number;
  packSize?: {
    name: string;
    packFormat?: {
      name: string;
      brand?: {
        name: string;
      };
    };
  };
}

export interface MerchStats {
  totalChecks: number;
  totalItems: number;
  averageScore: number;
  criteria: {
    visibility: number;
    priceCompliance: number;
    stockAvailability: number;
  };
}

export const merchandisingService = {
  /**
   * Creer un merchandising
   */
  async create(data: CreateMerchandisingDto): Promise<MerchandisingResponse> {
    console.log('[merchandisingService] Creation merchandising:', data);
    const response = await api.post('/merchandising', data);
    return response.data || response;
  },

  /**
   * Recuperer un merchandising par ID
   */
  async getById(id: string): Promise<MerchandisingResponse> {
    const response = await api.get(`/merchandising/${id}`);
    return response.data || response;
  },

  /**
   * Recuperer les merchandisings d'une visite
   */
  async getByVisit(visitId: string): Promise<MerchandisingResponse[]> {
    const response = await api.get(`/merchandising/visit/${visitId}`);
    const data = response.data || response;
    return Array.isArray(data) ? data : [];
  },

  /**
   * Mettre a jour un merchandising
   */
  async update(
    id: string,
    data: Partial<CreateMerchandisingDto>
  ): Promise<MerchandisingResponse> {
    const response = await api.put(`/merchandising/${id}`, data);
    return response.data || response;
  },

  /**
   * Supprimer un merchandising
   */
  async delete(id: string): Promise<void> {
    await api.delete(`/merchandising/${id}`);
  },

  /**
   * Uploader une photo pour le merchandising
   */
  async uploadPhoto(file: File): Promise<{ imageUrl: string; fileKey: string }> {
    console.log('[merchandisingService] Upload photo...');
    const formData = new FormData();
    formData.append('image', file);

    // @ts-expect-error - Axios config headers override
    const response = await api.post('/merchandising/upload-photo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    console.log('[merchandisingService] Photo uploadee:', response);
    return response.data || response;
  },

  /**
   * Ajouter des photos a un merchandising existant
   */
  async addPhotos(
    merchCheckId: string,
    photos: MerchPhoto[]
  ): Promise<MerchandisingResponse> {
    const response = await api.post(`/merchandising/${merchCheckId}/photos`, {
      photos,
    });
    return response.data || response;
  },

  /**
   * Supprimer une photo
   */
  async deletePhoto(merchCheckId: string, photoId: string): Promise<void> {
    await api.delete(`/merchandising/${merchCheckId}/photos/${photoId}`);
  },

  /**
   * Recuperer les statistiques
   */
  async getStats(startDate?: string, endDate?: string): Promise<MerchStats> {
    const response = await api.get('/merchandising/stats/me', {
      params: { startDate, endDate },
    });
    return response.data || response;
  },

  /**
   * Recuperer les SKUs disponibles (depuis le stock vendeur)
   */
  async getAvailableSKUs(): Promise<AvailableSKU[]> {
    const response = await api.get('/merchandising/skus/available');
    const data = response.data || response;
    return Array.isArray(data) ? data : [];
  },
};
