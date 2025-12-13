import { PeriodType } from '../stores/managerDashboardStore';

/**
 * Fonctions utilitaires pour le formatage des KPIs
 */

// Formater les montants (CA, Dropsize, Vente/Visite)
export const formatAmount = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '--';
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1);
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0);
  }
  return value.toFixed(0);
};

// Unité selon le montant
export const getAmountUnit = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  if (value >= 1000000) return 'M FCFA';
  if (value >= 1000) return 'K FCFA';
  return 'FCFA';
};

// Formater le CA (toujours en K ou M)
export const formatCA = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '--';
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1);
  }
  return (value / 1000).toFixed(0);
};

// Unité du CA
export const getCAUnit = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  if (value >= 1000000) return 'M FCFA';
  return 'K FCFA';
};

// Label du CA selon la période
export const getCALabel = (period: PeriodType): string => {
  switch (period) {
    case 'today': return "CA du jour";
    case 'week': return "CA de la semaine";
    case 'month': return "CA du mois";
    case 'quarter': return "CA du trimestre";
    default: return "Chiffre d'Affaires";
  }
};

// Formater un pourcentage (Taux de Couverture, Hit Rate)
export const formatPercentage = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '--';
  return value.toFixed(1);
};

// Alias pour le Taux de Couverture
export const formatTauxCouverture = formatPercentage;

// Alias pour le Hit Rate
export const formatHitRate = formatPercentage;

// Formater le LPC
export const formatLPC = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '--';
  return value.toFixed(1);
};

// Formater la Fréquence de Visite
export const formatFrequency = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '--';
  return value.toFixed(1);
};

// Alias pour la Fréquence de Visite
export const formatFrequenceVisite = formatFrequency;

// Formater le Dropsize
export const formatDropsize = (value: number | null): string => {
  if (value === null) return '--';
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1);
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0);
  }
  return value.toFixed(0);
};

// Unité du Dropsize
export const getDropsizeUnit = (value: number | null): string => {
  if (value === null) return '';
  if (value >= 1000000) return 'M FCFA';
  if (value >= 1000) return 'K FCFA';
  return 'FCFA';
};

// Formater la Vente par Visite (CA moyen)
export const formatVenteParVisite = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '--';
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1);
  }
  if (value >= 1000) {
    return (value / 1000).toFixed(0);
  }
  return value.toFixed(0);
};

// Unité de la Vente par Visite
export const getVenteParVisiteUnit = (value: number | undefined | null): string => {
  if (value === undefined || value === null) return '';
  if (value >= 1000000) return 'M FCFA';
  if (value >= 1000) return 'K FCFA';
  return 'FCFA';
};
