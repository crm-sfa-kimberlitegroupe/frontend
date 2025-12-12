import { apiClient } from '@/core/api/client';
import { ChiffreAffairesData, PeriodType } from '../stores/managerDashboardStore';

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
};

export default managerKpiService;
