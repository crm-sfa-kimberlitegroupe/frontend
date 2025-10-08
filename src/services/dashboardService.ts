import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backendsfa.onrender.com/api';

// Types
export interface DashboardStats {
  activeUsers: number;
  totalPDV: number;
  pendingPDV: number;
  todayVisits: number;
  todayOrders: number;
  monthlySales: number;
}

export interface Activity {
  id: string;
  user: string;
  action: string;
  pdv: string;
  time: string;
  timestamp: Date;
}

export interface VisitData {
  name: string;
  visites: number;
  commandes: number;
}

export interface SalesData {
  name: string;
  ventes: number;
}

export interface DashboardResponse {
  success: boolean;
  stats: DashboardStats;
  recentActivities: Activity[];
  visitsData: VisitData[];
  salesData: SalesData[];
}

// Axios instance
const api = axios.create({
  baseURL: `${API_URL}/dashboard`,
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
export const dashboardService = {
  // Récupérer les stats du dashboard ADMIN
  async getAdminStats(): Promise<DashboardResponse> {
    try {
      const response = await api.get<DashboardResponse>('/admin');
      return response.data;
    } catch (error) {
      console.error('Error fetching admin dashboard:', error);
      // Retourner des données mockées en cas d'erreur
      return this.getMockAdminData();
    }
  },

  // Récupérer les stats du dashboard SUP
  async getSupervisorStats(filters?: {
    period?: string;
    territory?: string;
  }): Promise<any> {
    try {
      const response = await api.get('/supervisor', { params: filters });
      return response.data;
    } catch (error) {
      console.error('Error fetching supervisor dashboard:', error);
      return this.getMockSupervisorData();
    }
  },

  // Mock data pour développement
  getMockAdminData(): DashboardResponse {
    return {
      success: true,
      stats: {
        activeUsers: 45,
        totalPDV: 234,
        pendingPDV: 8,
        todayVisits: 127,
        todayOrders: 89,
        monthlySales: 143000,
      },
      recentActivities: [
        {
          id: '1',
          user: 'Jean Kouassi',
          action: 'Nouvelle visite complétée',
          pdv: 'Supermarché Plateau',
          time: 'Il y a 5 min',
          timestamp: new Date(),
        },
        {
          id: '2',
          user: 'Marie Diallo',
          action: 'Commande créée',
          pdv: 'Boutique Cocody',
          time: 'Il y a 12 min',
          timestamp: new Date(),
        },
        {
          id: '3',
          user: 'Paul Bamba',
          action: 'PDV proposé',
          pdv: 'Kiosque Adjamé',
          time: 'Il y a 18 min',
          timestamp: new Date(),
        },
      ],
      visitsData: [
        { name: 'Lun', visites: 45, commandes: 32 },
        { name: 'Mar', visites: 52, commandes: 38 },
        { name: 'Mer', visites: 48, commandes: 35 },
        { name: 'Jeu', visites: 61, commandes: 42 },
        { name: 'Ven', visites: 55, commandes: 40 },
        { name: 'Sam', visites: 38, commandes: 28 },
      ],
      salesData: [
        { name: 'Jan', ventes: 45000 },
        { name: 'Fév', ventes: 52000 },
        { name: 'Mar', ventes: 48000 },
        { name: 'Avr', ventes: 61000 },
        { name: 'Mai', ventes: 55000 },
        { name: 'Juin', ventes: 67000 },
      ],
    };
  },

  getMockSupervisorData(): any {
    return {
      success: true,
      stats: {
        averageCoverage: 86.5,
        strikeRate: 73.8,
        activeReps: 24,
        totalReps: 28,
        monthlySales: 143000,
      },
      performanceData: [
        { name: 'Sem 1', couverture: 85, strikeRate: 72, objectif: 80 },
        { name: 'Sem 2', couverture: 88, strikeRate: 75, objectif: 80 },
        { name: 'Sem 3', couverture: 82, strikeRate: 70, objectif: 80 },
        { name: 'Sem 4', couverture: 91, strikeRate: 78, objectif: 80 },
      ],
      salesByTerritory: [
        { name: 'Plateau', value: 45000, color: '#38BDF8' },
        { name: 'Cocody', value: 38000, color: '#10B981' },
        { name: 'Adjamé', value: 32000, color: '#F59E0B' },
        { name: 'Yopougon', value: 28000, color: '#EF4444' },
      ],
      topPerformers: [
        { rank: 1, name: 'Jean Kouassi', visites: 127, commandes: 89, ca: 45000 },
        { rank: 2, name: 'Marie Diallo', visites: 118, commandes: 82, ca: 38000 },
        { rank: 3, name: 'Paul Bamba', visites: 105, commandes: 75, ca: 32000 },
        { rank: 4, name: 'Aïcha Traoré', visites: 98, commandes: 68, ca: 28000 },
      ],
    };
  },
};

export default dashboardService;
