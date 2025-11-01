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
  maxOutlets?: number;
  maxDistance?: number;
}

export interface RouteMetrics {
  routeId?: string;
  totalDistance: number;
  estimatedTime: number;
  numberOfOutlets: number;
  numberOfVisited?: number;
}

export interface GenerateMultiDayDto {
  userId: string;
  startDate: string;
  numberOfDays: number;
  outletsPerDay?: number;
  optimize?: boolean;
}

const routesService = {
  // Récupérer toutes les routes avec filtres
  async getAll(filters?: {
    userId?: string;
    date?: string;
    status?: string;
  }): Promise<RoutePlan[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.userId) params.append('userId', filters.userId);
      if (filters?.date) params.append('date', filters.date);
      if (filters?.status) params.append('status', filters.status);

      console.log('Appel API routes avec params:', params.toString());
      const response = await api.get(`/routes?${params.toString()}`);
      console.log('Réponse API routes:', response);
      console.log('Type de response:', typeof response, Array.isArray(response));
      
      // apiClient.get retourne directement les données parsées, pas un objet { data: ... }
      return Array.isArray(response) ? response : [];
    } catch (error) {
      console.error('Erreur lors de la récupération des routes:', error);
      return [];
    }
  },

  // Récupérer une route par ID
  async getById(id: string): Promise<RoutePlan> {
    const response = await api.get(`/routes/${id}`);
    return response;
  },

  // Créer une nouvelle route
  async create(data: CreateRoutePlanDto): Promise<RoutePlan> {
    const response = await api.post('/routes', data);
    return response;
  },

  // Mettre à jour une route
  async update(id: string, data: Partial<RoutePlan>): Promise<RoutePlan> {
    const response = await api.patch(`/routes/${id}`, data);
    return response;
  },

  // Supprimer une route
  async delete(id: string): Promise<void> {
    await api.delete(`/routes/${id}`);
  },

  // Démarrer une route
  async start(id: string): Promise<RoutePlan> {
    const response = await api.patch(`/routes/${id}/start`);
    return response;
  },

  // Terminer une route
  async complete(id: string): Promise<RoutePlan> {
    const response = await api.patch(`/routes/${id}/complete`);
    return response;
  },

  // Récupérer la route du jour pour l'utilisateur connecté
  async getTodayRoute(): Promise<RoutePlan | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await api.get(`/routes/my-routes?date=${today}`);
      // Retourne la première route du jour ou null
      return Array.isArray(response) && response.length > 0 ? response[0] : null;
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
    return Array.isArray(response) ? response : [];
  },

  // Générer une route automatiquement avec optimisation
  async generateRoute(data: GenerateRouteDto): Promise<RoutePlan> {
    const response = await api.post('/routes/generate', data);
    return response;
  },

  // Récupérer les PDV du secteur du vendeur
  async getVendorSectorOutlets(vendorId: string): Promise<{
    user: { id: string; firstName: string; lastName: string };
    sector: { id: string; code: string; name: string };
    outlets: any[];
  }> {
    const response = await api.get(`/territories/vendors/${vendorId}/outlets`);
    return response;
  },

  // Générer des routes pour plusieurs jours
  async generateMultiDayRoutes(data: GenerateMultiDayDto): Promise<{
    routes: RoutePlan[];
    summary: {
      totalRoutes: number;
      totalOutlets: number;
      totalDistance: number;
      totalEstimatedTime: number;
    };
  }> {
    const response = await api.post('/routes/generate-multi-day', data);
    return response;
  },

  // Récupérer les métriques d'une route
  async getRouteMetrics(routeId: string): Promise<RouteMetrics> {
    const response = await api.get(`/routes/${routeId}/metrics`);
    return response;
  },

  // Optimiser une route existante
  async optimizeRoute(routeId: string): Promise<RoutePlan> {
    const response = await api.post(`/routes/${routeId}/optimize`);
    return response;
  },
};

export default routesService;
