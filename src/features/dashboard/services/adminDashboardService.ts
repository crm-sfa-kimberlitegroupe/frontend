import { apiClient } from '@/core/api/client';
import { outletsService, OutletStats } from '@/features/pdv/services/outletsService';
import { usersService, User } from '@/features/users/services/usersService';
import { AdminDashboardStats, Activity, Alert } from '../stores/adminDashboardStore';

const api = apiClient;

interface VisitResponse {
  id: string;
  checkinAt: string;
  user?: {
    firstName: string;
    lastName: string;
  };
  outlet?: {
    name: string;
  };
}

function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return 'A l\'instant';
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffHours < 24) return `Il y a ${diffHours}h`;
  if (diffDays < 7) return `Il y a ${diffDays}j`;
  return date.toLocaleDateString('fr-FR');
}

export const adminDashboardService = {
  async getOutletStats(): Promise<OutletStats> {
    try {
      console.log('[AdminDashboardService] Chargement stats PDV...');
      return await outletsService.getStats();
    } catch (error) {
      console.error('[AdminDashboardService] Erreur getOutletStats:', error);
      return { total: 0, pending: 0, approved: 0, rejected: 0, inactive: 0 };
    }
  },

  async getActiveUsersCount(): Promise<{ active: number; total: number }> {
    try {
      console.log('[AdminDashboardService] Chargement utilisateurs...');
      const users = await usersService.getAll();
      const activeUsers = users.filter((u: User) => u.isActive || u.status === 'ACTIVE');
      return { active: activeUsers.length, total: users.length };
    } catch (error) {
      console.error('[AdminDashboardService] Erreur getActiveUsersCount:', error);
      return { active: 0, total: 0 };
    }
  },

  async getTodayVisitsCount(): Promise<number> {
    try {
      console.log('[AdminDashboardService] Chargement visites du jour...');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const params = new URLSearchParams({
        startDate: today.toISOString(),
        endDate: new Date().toISOString(),
      });
      
      // Utiliser l'endpoint admin qui récupère toutes les visites
      const response = await api.get(`/visits/all?${params.toString()}`);
      const visits = response?.data || response || [];
      const count = Array.isArray(visits) ? visits.length : 0;
      console.log('[AdminDashboardService] Visites du jour:', count);
      return count;
    } catch (error) {
      console.error('[AdminDashboardService] Erreur getTodayVisitsCount:', error);
      return 0;
    }
  },

  async getTodayOrdersCount(): Promise<number> {
    try {
      console.log('[AdminDashboardService] Chargement commandes du jour...');
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Récupérer tous les vendeurs REP
      const users = await usersService.getAll();
      const vendors = users.filter((u: User) => u.role === 'REP');
      
      let totalOrders = 0;
      
      // Pour chaque vendeur, récupérer ses commandes du jour
      for (const vendor of vendors) {
        try {
          const params = new URLSearchParams({
            startDate: today.toISOString(),
            endDate: new Date().toISOString(),
          });
          const response = await api.get(`/orders/vendor/${vendor.id}?${params.toString()}`);
          const orders = response || [];
          totalOrders += Array.isArray(orders) ? orders.length : 0;
        } catch (error) {
          console.error(`[AdminDashboardService] Erreur commandes vendeur ${vendor.id}:`, error);
        }
      }
      
      console.log('[AdminDashboardService] Commandes du jour:', totalOrders);
      return totalOrders;
    } catch (error) {
      console.error('[AdminDashboardService] Erreur getTodayOrdersCount:', error);
      return 0;
    }
  },

  async getRecentActivities(): Promise<Activity[]> {
    try {
      console.log('[AdminDashboardService] Chargement activités récentes...');
      const activities: Activity[] = [];
      
      // Récupérer toutes les visites récentes
      const visitsResponse = await api.get('/visits/all');
      const visits = visitsResponse?.data || visitsResponse || [];
      
      if (Array.isArray(visits)) {
        (visits as VisitResponse[]).slice(0, 10).forEach((visit) => {
          activities.push({
            id: visit.id,
            user: visit.user ? `${visit.user.firstName} ${visit.user.lastName}` : 'Utilisateur',
            action: 'a complete une visite',
            pdv: visit.outlet?.name || 'PDV',
            time: formatTimeAgo(new Date(visit.checkinAt)),
            timestamp: new Date(visit.checkinAt),
            type: 'visit',
          });
        });
      }

      activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      const result = activities.slice(0, 5);
      console.log('[AdminDashboardService] Activités récentes:', result.length);
      return result;
    } catch (error) {
      console.error('[AdminDashboardService] Erreur getRecentActivities:', error);
      return [];
    }
  },

  async getAlerts(): Promise<Alert[]> {
    try {
      console.log('[AdminDashboardService] Chargement alertes...');
      const alerts: Alert[] = [];
      const outletStats = await this.getOutletStats();

      if (outletStats.pending > 0) {
        alerts.push({
          id: '1',
          type: 'danger',
          message: `${outletStats.pending} PDV en attente de validation`,
          count: outletStats.pending,
          link: '/dashboard/pdv?status=PENDING',
        });
      }

      try {
        const users = await usersService.getAll();
        const inactiveUsers = users.filter((u: User) => !u.isActive || u.status === 'INACTIVE' || u.status === 'SUSPENDED');
        if (inactiveUsers.length > 0) {
          alerts.push({
            id: '2',
            type: 'warning',
            message: `${inactiveUsers.length} utilisateur(s) inactif(s)`,
            count: inactiveUsers.length,
            link: '/dashboard/users',
          });
        }
      } catch {
        // Ignorer les erreurs
      }

      console.log('[AdminDashboardService] Alertes:', alerts.length);
      return alerts;
    } catch (error) {
      console.error('[AdminDashboardService] Erreur getAlerts:', error);
      return [];
    }
  },

  async loadAllStats(): Promise<{
    stats: AdminDashboardStats;
    activities: Activity[];
    alerts: Alert[];
  }> {
    try {
      console.log('[AdminDashboardService] Chargement complet des stats admin...');
      
      const [outletStats, usersCount, todayVisits, todayOrders, activities, alerts] = await Promise.all([
        this.getOutletStats(),
        this.getActiveUsersCount(),
        this.getTodayVisitsCount(),
        this.getTodayOrdersCount(),
        this.getRecentActivities(),
        this.getAlerts(),
      ]);

      const stats: AdminDashboardStats = {
        activeUsers: usersCount.active,
        totalUsers: usersCount.total,
        totalPDV: outletStats.total,
        pendingPDV: outletStats.pending,
        approvedPDV: outletStats.approved,
        todayVisits,
        todayOrders,
        monthlySales: 0,
      };

      console.log('[AdminDashboardService] Stats chargées:', stats);
      
      return { stats, activities, alerts };
    } catch (error) {
      console.error('[AdminDashboardService] Erreur loadAllStats:', error);
      throw error;
    }
  },
};

export default adminDashboardService;
