import { apiClient } from '@/core/api/client';
import { ChiffreAffairesData, LpcData, TauxCouvertureData, HitRateData, FrequenceVisiteData, VenteParVisiteData, PeriodType } from '../stores/managerDashboardStore';

const api = apiClient;

// Mapping des périodes frontend vers les périodes backend
const periodMapping: Record<PeriodType, string> = {
  today: 'day',
  week: 'week',
  month: 'month',
  quarter: 'quarter',
};

export const managerKpiService = {
  /**
   * Récupère le CA pour une période et un territoire donnés
   */
  async getCA(territoryId: string, period: PeriodType): Promise<ChiffreAffairesData> {
    try {
      const backendPeriod = periodMapping[period];
      console.log(`[ManagerKpiService] Chargement CA ${period} (${backendPeriod}) pour territoire:`, territoryId);
      
      const response = await api.get(`/kpis/chiffres-affaires?period=${backendPeriod}&territoryId=${territoryId}`);
      console.log(`[ManagerKpiService] CA ${period}:`, response);
      
      return {
        value: response.value || 0,
        orderCount: response.orderCount || 0,
        totalHt: response.totalHt || 0,
        totalTtc: response.totalTtc || 0,
        totalTax: response.totalTax || 0,
        period: response.period || backendPeriod,
        startDate: response.startDate || new Date().toISOString(),
        endDate: response.endDate || new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[ManagerKpiService] Erreur getCA ${period}:`, error);
      throw error;
    }
  },

  /**
   * Récupère le LPC (Lignes Par Commande) pour une période et un territoire donnés
   */
  async getLPC(territoryId: string, period: PeriodType): Promise<LpcData> {
    try {
      const backendPeriod = periodMapping[period];
      console.log(`[ManagerKpiService] Chargement LPC ${period} (${backendPeriod}) pour territoire:`, territoryId);
      
      const response = await api.get(`/kpis/lpc?period=${backendPeriod}&territoryId=${territoryId}`);
      console.log(`[ManagerKpiService] LPC ${period}:`, response);
      
      return {
        value: response.value || 0,
        totalLines: response.totalLines || 0,
        orderCount: response.orderCount || 0,
        linesPerOrder: response.linesPerOrder || 0,
        period: response.period || backendPeriod,
        startDate: response.startDate || new Date().toISOString(),
        endDate: response.endDate || new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[ManagerKpiService] Erreur getLPC ${period}:`, error);
      throw error;
    }
  },

  /**
   * Récupère le Taux de Couverture pour une période et un territoire donnés
   */
  async getTauxCouverture(territoryId: string, period: PeriodType): Promise<TauxCouvertureData> {
    try {
      const backendPeriod = periodMapping[period];
      console.log(`[ManagerKpiService] Chargement Taux Couverture ${period} (${backendPeriod}) pour territoire:`, territoryId);
      
      const response = await api.get(`/kpis/taux-couverture?period=${backendPeriod}&territoryId=${territoryId}`);
      console.log(`[ManagerKpiService] Taux Couverture ${period}:`, response);
      
      return {
        value: response.value || 0,
        targetClients: response.targetClients || 0,
        visitedClients: response.visitedClients || 0,
        coverageRate: response.coverageRate || 0,
        period: response.period || backendPeriod,
        startDate: response.startDate || new Date().toISOString(),
        endDate: response.endDate || new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[ManagerKpiService] Erreur getTauxCouverture ${period}:`, error);
      throw error;
    }
  },

  /**
   * Récupère le Hit Rate (% visites avec vente) pour une période et un territoire donnés
   */
  async getHitRate(territoryId: string, period: PeriodType): Promise<HitRateData> {
    try {
      const backendPeriod = periodMapping[period];
      console.log(`[ManagerKpiService] Chargement Hit Rate ${period} (${backendPeriod}) pour territoire:`, territoryId);
      
      const response = await api.get(`/kpis/hit-rate?period=${backendPeriod}&territoryId=${territoryId}`);
      console.log(`[ManagerKpiService] Hit Rate ${period}:`, response);
      
      return {
        value: response.value || 0,
        totalVisits: response.totalVisits || 0,
        visitsWithSale: response.visitsWithSale || 0,
        hitRate: response.hitRate || 0,
        period: response.period || backendPeriod,
        startDate: response.startDate || new Date().toISOString(),
        endDate: response.endDate || new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[ManagerKpiService] Erreur getHitRate ${period}:`, error);
      throw error;
    }
  },

  /**
   * Récupère la Fréquence de Visite (visites par client) pour une période et un territoire donnés
   */
  async getFrequenceVisite(territoryId: string, period: PeriodType): Promise<FrequenceVisiteData> {
    try {
      const backendPeriod = periodMapping[period];
      console.log(`[ManagerKpiService] Chargement Fréquence Visite ${period} (${backendPeriod}) pour territoire:`, territoryId);
      
      const response = await api.get(`/kpis/frequence-visite?period=${backendPeriod}&territoryId=${territoryId}`);
      console.log(`[ManagerKpiService] Fréquence Visite ${period}:`, response);
      
      return {
        value: response.value || 0,
        totalVisits: response.totalVisits || 0,
        uniqueClients: response.uniqueClients || 0,
        averageFrequency: response.averageFrequency || 0,
        period: response.period || backendPeriod,
        startDate: response.startDate || new Date().toISOString(),
        endDate: response.endDate || new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[ManagerKpiService] Erreur getFrequenceVisite ${period}:`, error);
      throw error;
    }
  },

  /**
   * Récupère la Vente par Visite (CA moyen par visite) pour une période et un territoire donnés
   */
  async getVenteParVisite(territoryId: string, period: PeriodType): Promise<VenteParVisiteData> {
    try {
      const backendPeriod = periodMapping[period];
      console.log(`[ManagerKpiService] Chargement Vente/Visite ${period} (${backendPeriod}) pour territoire:`, territoryId);
      
      const response = await api.get(`/kpis/vente-par-visite?period=${backendPeriod}&territoryId=${territoryId}`);
      console.log(`[ManagerKpiService] Vente/Visite ${period}:`, response);
      
      return {
        value: response.value || 0,
        totalCA: response.totalCA || 0,
        totalVisits: response.totalVisits || 0,
        averageCAPerVisit: response.averageCAPerVisit || 0,
        period: response.period || backendPeriod,
        startDate: response.startDate || new Date().toISOString(),
        endDate: response.endDate || new Date().toISOString(),
      };
    } catch (error) {
      console.error(`[ManagerKpiService] Erreur getVenteParVisite ${period}:`, error);
      throw error;
    }
  },

  /**
   * Récupère les performances de l'équipe (top performers et vendeurs à surveiller)
   */
  async getTeamPerformance(territoryId: string, period: PeriodType) {
    try {
      const backendPeriod = periodMapping[period];
      console.log(`[ManagerKpiService] Chargement performances équipe ${period} (${backendPeriod}) pour territoire:`, territoryId);
      
      const response = await api.get(`/kpis/team-performance?period=${backendPeriod}&territoryId=${territoryId}`);
      console.log(`[ManagerKpiService] Performances équipe ${period}:`, response);
      
      return response;
    } catch (error) {
      console.error(`[ManagerKpiService] Erreur getTeamPerformance ${period}:`, error);
      throw error;
    }
  },
};

export default managerKpiService;
