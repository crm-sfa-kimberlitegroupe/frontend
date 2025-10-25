import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backendsfa.onrender.com/api';

export interface Territory {
  id: string;
  name: string;
  code: string;
  level?: string;
  parentId?: string | null;
  parent?: {
    id: string;
    code: string;
    name: string;
  };
  outletsSector?: Outlet[];
  assignedUsers?: User[];
  
  // Informations géographiques
  region?: string;
  commune?: string;
  ville?: string;
  quartier?: string;
  codePostal?: string;
  lat?: number;
  lng?: number;
  
  // Informations démographiques
  population?: number;
  superficie?: number;
  densitePopulation?: number;
  
  // Informations commerciales
  potentielCommercial?: string;
  categorieMarche?: string;
  typeZone?: string;
  nombrePDVEstime?: number;
  tauxPenetration?: number;
  
  // Métadonnées
  adminId?: string;
  createdBy?: string;
  notes?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Outlet {
  id: string;
  code: string;
  name: string;
  address?: string;
  lat?: number;
  lng?: number;
  status?: string;
  channel?: string;
  segment?: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface CreateSectorDto {
  code: string;
  name: string;
  level?: string;
  parentId?: string;
}

export interface AssignOutletsToSectorDto {
  sectorId: string;
  outletIds: string[];
}

export interface AssignSectorToVendorDto {
  vendorId: string;
  sectorId: string;
}

export interface AssignOutletsToVendorDto {
  vendorId: string;
  outletIds: string[];
}

export interface RemoveOutletsFromSectorDto {
  sectorId: string;
  outletIds: string[];
}

export interface VendorWithSector extends User {
  assignedSectorId?: string;
  territoryId?: string;
  territory?: {
    id: string;
    code: string;
    name: string;
  };
  assignedSector?: {
    id: string;
    code: string;
    name: string;
    outletsSector?: Outlet[];
  };
}

// Axios instance
const api = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Service
export const territoriesService = {
  // Récupérer tous les territoires
  async getAll(): Promise<Territory[]> {
    try {
      const response = await api.get<{ success: boolean; data: Territory[]; message: string }>('/territories');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching territories:', error);
      throw error;
    }
  },

  // Récupérer tous les managers (SUP et ADMIN)
  async getManagers(): Promise<Manager[]> {
    try {
      const response = await api.get<{ success: boolean; data: Manager[]; message: string }>('/users/managers/list');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching managers:', error);
      throw error;
    }
  },

  // Créer un nouveau secteur
  async createSector(data: CreateSectorDto): Promise<Territory> {
    const response = await api.post<{ success: boolean; data: Territory; message: string }>('/territories/sectors', data);
    return response.data.data;
  },

  // Récupérer tous les secteurs
  async getAllSectors(filters?: { level?: string }): Promise<Territory[]> {
    const params = new URLSearchParams();
    if (filters?.level) params.append('level', filters.level);
    
    const response = await api.get<{ success: boolean; data: Territory[]; message: string }>(`/territories/sectors?${params.toString()}`);
    return response.data.data || [];
  },

  // Récupérer un secteur par ID
  async getSectorById(id: string): Promise<Territory> {
    const response = await api.get<{ success: boolean; data: Territory; message: string }>(`/territories/sectors/${id}`);
    return response.data.data;
  },

  // Assigner des PDV à un secteur
  async assignOutletsToSector(data: AssignOutletsToSectorDto): Promise<Territory> {
    const response = await api.post<{ success: boolean; data: Territory; message: string }>('/territories/sectors/assign-outlets', data);
    return response.data.data;
  },

  // Assigner un secteur à un vendeur
  async assignSectorToVendor(data: AssignSectorToVendorDto): Promise<User> {
    const response = await api.post<{ success: boolean; data: User; message: string }>('/territories/sectors/assign-vendor', data);
    return response.data.data;
  },

  // Récupérer les PDV d'un vendeur via son secteur
  async getVendorOutlets(vendorId: string): Promise<{ vendor: User; sector: Territory | null; outlets: Outlet[] }> {
    const response = await api.get<{ success: boolean; data: { vendor: User; sector: Territory | null; outlets: Outlet[] }; message: string }>(`/territories/vendors/${vendorId}/outlets`);
    return response.data.data;
  },

  // Créer un nouveau territoire (ZONE)
  async create(data: Partial<Territory>): Promise<Territory> {
    const response = await api.post<{ success: boolean; data: Territory; message: string }>('/territories', data);
    return response.data.data;
  },

  // Mettre à jour un territoire
  async update(id: string, data: Partial<Territory>): Promise<Territory> {
    const response = await api.put<{ success: boolean; data: Territory; message: string }>(`/territories/${id}`, data);
    return response.data.data;
  },

  // Supprimer un territoire
  async delete(id: string): Promise<void> {
    await api.delete(`/territories/${id}`);
  },

  // Supprimer un secteur
  async deleteSector(id: string): Promise<void> {
    await api.delete(`/territories/sectors/${id}`);
  },

  // Retirer des PDV d'un secteur
  async removeOutletsFromSector(data: RemoveOutletsFromSectorDto): Promise<{ success: boolean; removedCount: number; message: string }> {
    const response = await api.post<{ success: boolean; data: { success: boolean; removedCount: number; message: string }; message: string }>('/territories/sectors/remove-outlets', data);
    return response.data.data;
  },

  // Assigner des PDV directement à un vendeur (via son secteur)
  async assignOutletsToVendor(data: AssignOutletsToVendorDto): Promise<{ success: boolean; assignedCount: number; vendor: { id: string; name: string }; sector: { id: string }; message: string }> {
    const response = await api.post<{ success: boolean; data: any; message: string }>('/territories/vendors/assign-outlets', data);
    return response.data.data;
  },

  // Retirer un vendeur de son secteur
  async removeSectorFromVendor(vendorId: string): Promise<{ success: boolean; message: string }> {
    const response = await api.delete<{ success: boolean; data: { success: boolean; message: string }; message: string }>(`/territories/vendors/${vendorId}/sector`);
    return response.data.data;
  },

  // Récupérer tous les vendeurs avec leurs secteurs assignés
  async getAllVendorsWithSectors(): Promise<VendorWithSector[]> {
    const response = await api.get<{ success: boolean; data: VendorWithSector[]; message: string }>('/territories/vendors/with-sectors');
    return response.data.data || [];
  },
};

export default territoriesService;
