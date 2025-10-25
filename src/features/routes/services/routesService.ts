import { apiClient } from '@/core/api/client';

const api = apiClient;

export interface RoutePlan {
  id: string;
  userId: string;
  date: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'DONE';
  isOffRoute: boolean;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  routeStops?: RouteStop[];
  createdAt: string;
  updatedAt: string;
}

export interface RouteStop {
  id: string;
  routePlanId: string;
  outletId: string;
  seq: number;
  eta?: string;
  durationPlanned?: number;
  status: 'PLANNED' | 'VISITED' | 'SKIPPED';
  reason?: string;
  outlet?: {
    id: string;
    name: string;
    code: string;
    address?: string;
    lat?: number;
    lng?: number;
  };
}

export interface CreateRoutePlanDto {
  userId: string;
  date: string;
  outletIds: string[];
}

export interface GenerateRouteDto {
  userId: string;
  date: string;
  outletIds?: string[];
  optimize?: boolean;
}

const routesService = {
  // Récupérer toutes les routes avec filtres
  async getAll(filters?: {
    userId?: string;
    date?: string;
    status?: string;
  }): Promise<RoutePlan[]> {
    const params = new URLSearchParams();
    if (filters?.userId) params.append('userId', filters.userId);
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/routes?${params.toString()}`);
    return response.data;
  },

  // Récupérer une route par ID
  async getById(id: string): Promise<RoutePlan> {
    const response = await api.get(`/routes/${id}`);
    return response.data;
  },

  // Créer une nouvelle route
  async create(data: CreateRoutePlanDto): Promise<RoutePlan> {
    const response = await api.post('/routes', data);
    return response.data;
  },

  // Mettre à jour une route
  async update(id: string, data: Partial<RoutePlan>): Promise<RoutePlan> {
    const response = await api.patch(`/routes/${id}`, data);
    return response.data;
  },

  // Supprimer une route
  async delete(id: string): Promise<void> {
    await api.delete(`/routes/${id}`);
  },

  // Démarrer une route
  async start(id: string): Promise<RoutePlan> {
    const response = await api.patch(`/routes/${id}/start`);
    return response.data;
  },

  // Terminer une route
  async complete(id: string): Promise<RoutePlan> {
    const response = await api.patch(`/routes/${id}/complete`);
    return response.data;
  },

  // Récupérer la route du jour pour l'utilisateur connecté
  async getTodayRoute(): Promise<RoutePlan | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/routes/my-routes?date=${today}`);
      // Retourne la première route du jour ou null
      return response.data && response.data.length > 0 ? response.data[0] : null;
    } catch (error) {
      console.error('Erreur lors de la récupération de la route du jour:', error);
      return null;
    }
  },

  // Récupérer mes routes
  async getMyRoutes(filters?: {
    date?: string;
    status?: string;
  }): Promise<RoutePlan[]> {
    const params = new URLSearchParams();
    if (filters?.date) params.append('date', filters.date);
    if (filters?.status) params.append('status', filters.status);

    const response = await api.get(`/routes/my-routes?${params.toString()}`);
    return response.data || [];
  },

  // Générer une route automatiquement avec optimisation
  async generateRoute(data: GenerateRouteDto): Promise<RoutePlan> {
    const response = await api.post('/routes/generate', data);
    return response.data;
  },

  // Récupérer les PDV du secteur du vendeur
  async getVendorSectorOutlets(vendorId: string): Promise<{
    user: { id: string; firstName: string; lastName: string };
    sector: { id: string; code: string; name: string };
    outlets: any[];
  }> {
    const response = await api.get(`/territories/vendors/${vendorId}/outlets`);
    return response.data;
  },
};

export default routesService;
