import api from './api';

export type OutletStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'INACTIVE';

export const OutletStatusEnum = {
  PENDING: 'PENDING' as const,
  APPROVED: 'APPROVED' as const,
  REJECTED: 'REJECTED' as const,
  INACTIVE: 'INACTIVE' as const,
};

export interface CreateOutletData {
  code?: string;
  name: string;
  channel: string;
  segment?: string;
  address?: string;
  lat?: number;
  lng?: number;
  openHours?: {
    days?: string[];
    opening?: string;
    closing?: string;
  };
  status?: OutletStatus;
  territoryId: string;
  proposedBy?: string;
  validationComment?: string;
  osmPlaceId?: string;
  osmMetadata?: any;
}

export interface Outlet {
  id: string;
  code: string;
  name: string;
  channel: string;
  segment?: string;
  address?: string;
  lat?: number;
  lng?: number;
  openHours?: any;
  status: OutletStatus;
  territoryId: string;
  proposedBy?: string;
  validatedBy?: string;
  validatedAt?: string;
  validationComment?: string;
  osmPlaceId?: string;
  osmMetadata?: any;
  createdAt: string;
  updatedAt: string;
  territory?: any;
  proposer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  validator?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface OutletStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  inactive: number;
}

class OutletsService {
  /**
   * Créer un nouveau point de vente
   */
  async create(data: CreateOutletData): Promise<Outlet> {
    const response = await api.post('/outlets', data);
    return response.data;
  }

  /**
   * Récupérer tous les points de vente
   */
  async getAll(filters?: {
    status?: OutletStatus;
    territoryId?: string;
    channel?: string;
    proposedBy?: string;
  }): Promise<Outlet[]> {
    const params = new URLSearchParams();
    
    if (filters?.status) params.append('status', filters.status);
    if (filters?.territoryId) params.append('territoryId', filters.territoryId);
    if (filters?.channel) params.append('channel', filters.channel);
    if (filters?.proposedBy) params.append('proposedBy', filters.proposedBy);

    const response = await api.get(`/outlets?${params.toString()}`);
    return response.data;
  }

  /**
   * Récupérer un point de vente par ID
   */
  async getById(id: string): Promise<Outlet> {
    const response = await api.get(`/outlets/${id}`);
    return response.data;
  }

  /**
   * Mettre à jour un point de vente
   */
  async update(id: string, data: Partial<CreateOutletData>): Promise<Outlet> {
    const response = await api.patch(`/outlets/${id}`, data);
    return response.data;
  }

  /**
   * Approuver un point de vente (ADMIN/SUP uniquement)
   */
  async approve(id: string): Promise<Outlet> {
    const response = await api.patch(`/outlets/${id}/approve`);
    return response.data;
  }

  /**
   * Rejeter un point de vente (ADMIN/SUP uniquement)
   */
  async reject(id: string, reason?: string): Promise<Outlet> {
    const response = await api.patch(`/outlets/${id}/reject`, { reason });
    return response.data;
  }

  /**
   * Supprimer un point de vente (ADMIN uniquement)
   */
  async delete(id: string): Promise<{ message: string }> {
    const response = await api.delete(`/outlets/${id}`);
    return response.data;
  }

  /**
   * Obtenir les statistiques des PDV
   */
  async getStats(filters?: {
    territoryId?: string;
    proposedBy?: string;
  }): Promise<OutletStats> {
    const params = new URLSearchParams();
    
    if (filters?.territoryId) params.append('territoryId', filters.territoryId);
    if (filters?.proposedBy) params.append('proposedBy', filters.proposedBy);

    const response = await api.get(`/outlets/stats?${params.toString()}`);
    return response.data;
  }
}

export const outletsService = new OutletsService();
export default outletsService;
