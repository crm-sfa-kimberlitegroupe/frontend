import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../core/auth/authStore';
import { managerKpiService } from '../../dashboard/services/managerKpiService';
import { territoriesService } from '../../territories/services/territoriesService';
import { PeriodType } from '../../dashboard/stores/managerDashboardStore';

interface VendorPosition {
  id: string;
  name: string;
  territory: string;
  status: 'active' | 'inactive';
  visits: number;
  sales: number;
  lat?: number;
  lng?: number;
}

interface TerritoryHotspot {
  territoryName: string;
  visits: number;
  sales: number;
}

/**
 * Hook pour charger les données analytics de la carte pour les managers SUP
 */
export function useRouteAnalytics(selectedPeriod: PeriodType, selectedTerritory: string) {
  const [managerTerritories, setManagerTerritories] = useState<string[]>([]);
  const [loadingTerritories, setLoadingTerritories] = useState(true);
  const [totalVisits, setTotalVisits] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [vendorPositions, setVendorPositions] = useState<VendorPosition[]>([]);
  const [hotspots, setHotspots] = useState<TerritoryHotspot[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { user } = useAuthStore();
  const managerId = user?.id;

  // Map pour stocker les noms des territoires
  const [territoryNames, setTerritoryNames] = useState<Map<string, string>>(new Map());

  // Charger les territoires du manager
  useEffect(() => {
    const loadManagerTerritories = async () => {
      if (!managerId) {
        setLoadingTerritories(false);
        return;
      }

      try {
        const territories = await territoriesService.getManagerTerritories(managerId);
        const territoryIds = territories.map(t => t.id);
        
        // Créer une map des IDs vers les noms
        const namesMap = new Map<string, string>();
        territories.forEach(t => {
          namesMap.set(t.id, t.name || t.id);
        });
        
        setManagerTerritories(territoryIds);
        setTerritoryNames(namesMap);
      } catch (error) {
        console.error('[useRouteAnalytics] Erreur chargement territoires:', error);
      } finally {
        setLoadingTerritories(false);
      }
    };

    loadManagerTerritories();
  }, [managerId]);

  // Charger les données analytics
  useEffect(() => {
    const loadAnalytics = async () => {
      if (loadingTerritories || managerTerritories.length === 0) return;

      try {
        setIsLoading(true);

        // Filtrer les territoires selon la sélection
        const territoriesIds = selectedTerritory === 'all' 
          ? managerTerritories 
          : managerTerritories.filter(id => id === selectedTerritory);

        // Charger les KPIs pour chaque territoire
        const analyticsPromises = territoriesIds.map(async (territoryId) => {
          const [ca, frequenceVisite, teamPerformance] = await Promise.all([
            managerKpiService.getCA(territoryId, selectedPeriod),
            managerKpiService.getFrequenceVisite(territoryId, selectedPeriod),
            managerKpiService.getTeamPerformance(territoryId, selectedPeriod),
          ]);

          return {
            territoryId,
            ca: ca.value,
            visits: frequenceVisite.totalVisits,
            teamPerformance,
          };
        });

        const analyticsResults = await Promise.all(analyticsPromises);

        // Agréger les totaux
        let totalV = 0;
        let totalS = 0;
        const hotspotsData: TerritoryHotspot[] = [];
        const allVendors: VendorPosition[] = [];

        analyticsResults.forEach((result) => {
          totalV += result.visits;
          totalS += result.ca;

          // Récupérer le nom du territoire
          const territoryName = territoryNames.get(result.territoryId) || result.territoryId;
          
          // Ajouter aux hotspots
          hotspotsData.push({
            territoryName,
            visits: result.visits,
            sales: result.ca,
          });

          // Ajouter les vendeurs
          if (result.teamPerformance?.topPerformers) {
            result.teamPerformance.topPerformers.forEach((vendor: any) => {
              allVendors.push({
                id: vendor.id,
                name: vendor.name,
                territory: territoryName,
                status: vendor.visits > 0 ? 'active' : 'inactive',
                visits: vendor.visits,
                sales: vendor.sales,
              });
            });
          }
        });

        // Trier les hotspots par nombre de visites
        hotspotsData.sort((a, b) => b.visits - a.visits);

        setTotalVisits(totalV);
        setTotalSales(totalS);
        setHotspots(hotspotsData.slice(0, 3)); // Top 3
        setVendorPositions(allVendors);
      } catch (error) {
        console.error('[useRouteAnalytics] Erreur chargement analytics:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, selectedTerritory, managerTerritories, loadingTerritories]);

  // Créer les options de territoires avec ID et nom
  const territoryOptions = managerTerritories.map(id => ({
    id,
    name: territoryNames.get(id) || id,
  }));

  return {
    totalVisits,
    totalSales,
    vendorPositions,
    hotspots,
    isLoading: isLoading || loadingTerritories,
    managerTerritories,
    territoryOptions,
  };
}
