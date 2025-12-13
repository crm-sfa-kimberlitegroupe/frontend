import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../core/auth/authStore';
import { useManagerDashboardStore, isPeriodCacheValid, PeriodType } from '../stores/managerDashboardStore';
import { managerKpiService } from '../services/managerKpiService';
import { territoriesService } from '../../territories/services/territoriesService';

/**
 * Hook personnalisé pour gérer le chargement des KPIs du manager SUP
 * Centralise toute la logique de chargement, cache et agrégation des KPIs
 */
export function useManagerKpis(selectedPeriod: PeriodType) {
  const [managerTerritories, setManagerTerritories] = useState<string[]>([]);
  const [loadingTerritories, setLoadingTerritories] = useState(true);
  
  // Récupérer le user connecté (manager SUP)
  const { user } = useAuthStore();
  const managerId = user?.id;

  // Store manager pour les KPIs
  const {
    caByPeriod,
    lpcByPeriod,
    tauxCouvertureByPeriod,
    hitRateByPeriod,
    frequenceVisiteByPeriod,
    venteParVisiteByPeriod,
    cacheTimestamps,
    lpcCacheTimestamps,
    tauxCouvertureCacheTimestamps,
    hitRateCacheTimestamps,
    frequenceVisiteCacheTimestamps,
    venteParVisiteCacheTimestamps,
    territoryId: storedTerritoryId,
    isLoading,
    setCa,
    setLpc,
    setTauxCouverture,
    setHitRate,
    setFrequenceVisite,
    setVenteParVisite,
    setLoading,
    setError,
    setTerritoryId,
  } = useManagerDashboardStore();

  // KPIs actuels selon la période sélectionnée
  const currentCA = caByPeriod[selectedPeriod];
  const currentLPC = lpcByPeriod[selectedPeriod];
  const currentTauxCouverture = tauxCouvertureByPeriod[selectedPeriod];
  const currentHitRate = hitRateByPeriod[selectedPeriod];
  const currentFrequenceVisite = frequenceVisiteByPeriod[selectedPeriod];
  const currentVenteParVisite = venteParVisiteByPeriod[selectedPeriod];

  // Calcul du Dropsize (CA Total / Nombre de commandes)
  const dropsize = currentCA?.value && currentCA?.orderCount && currentCA.orderCount > 0
    ? currentCA.value / currentCA.orderCount
    : null;

  // Charger les territoires du manager au montage
  useEffect(() => {
    const loadManagerTerritories = async () => {
      if (!managerId) {
        setLoadingTerritories(false);
        return;
      }

      try {
        const territories = await territoriesService.getManagerTerritories(managerId);
        const territoryIds = territories.map(t => t.id);
        setManagerTerritories(territoryIds);
      } catch (error) {
        console.error('[useManagerKpis] Erreur chargement territoires:', error);
      } finally {
        setLoadingTerritories(false);
      }
    };

    loadManagerTerritories();
  }, [managerId]);

  // Charger le CA
  useEffect(() => {
    const loadCA = async () => {
      if (loadingTerritories || managerTerritories.length === 0) return;

      const cacheTimestamp = cacheTimestamps[selectedPeriod];
      const cacheKey = managerTerritories.join(',');
      
      if (isPeriodCacheValid(cacheTimestamp, cacheKey, storedTerritoryId)) return;

      try {
        setLoading(true);
        setTerritoryId(cacheKey);

        const caPromises = managerTerritories.map(territoryId =>
          managerKpiService.getCA(territoryId, selectedPeriod)
        );
        
        const caResults = await Promise.all(caPromises);
        
        const totalCA = caResults.reduce((acc, ca) => ({
          value: acc.value + ca.value,
          orderCount: acc.orderCount + ca.orderCount,
          totalHt: acc.totalHt + ca.totalHt,
          totalTtc: acc.totalTtc + ca.totalTtc,
          totalTax: acc.totalTax + ca.totalTax,
          period: ca.period,
          startDate: ca.startDate,
          endDate: ca.endDate,
        }), {
          value: 0,
          orderCount: 0,
          totalHt: 0,
          totalTtc: 0,
          totalTax: 0,
          period: selectedPeriod,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        });
        
        setCa(selectedPeriod, totalCA);
      } catch (error) {
        console.error('[useManagerKpis] Erreur chargement CA:', error);
        setError(error instanceof Error ? error.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    loadCA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, managerTerritories, loadingTerritories]);

  // Charger le LPC
  useEffect(() => {
    const loadLPC = async () => {
      if (loadingTerritories || managerTerritories.length === 0) return;

      const cacheTimestamp = lpcCacheTimestamps[selectedPeriod];
      const cacheKey = managerTerritories.join(',');
      
      if (isPeriodCacheValid(cacheTimestamp, cacheKey, storedTerritoryId)) return;

      try {
        const lpcPromises = managerTerritories.map(territoryId =>
          managerKpiService.getLPC(territoryId, selectedPeriod)
        );
        
        const lpcResults = await Promise.all(lpcPromises);
        
        const totalLPC = lpcResults.reduce((acc, lpc) => ({
          value: 0,
          totalLines: acc.totalLines + lpc.totalLines,
          orderCount: acc.orderCount + lpc.orderCount,
          linesPerOrder: 0,
          period: lpc.period,
          startDate: lpc.startDate,
          endDate: lpc.endDate,
        }), {
          value: 0,
          totalLines: 0,
          orderCount: 0,
          linesPerOrder: 0,
          period: selectedPeriod,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        });
        
        totalLPC.linesPerOrder = totalLPC.orderCount > 0 ? totalLPC.totalLines / totalLPC.orderCount : 0;
        totalLPC.value = totalLPC.linesPerOrder;
        
        setLpc(selectedPeriod, totalLPC);
      } catch (error) {
        console.error('[useManagerKpis] Erreur chargement LPC:', error);
      }
    };

    loadLPC();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, managerTerritories, loadingTerritories]);

  // Charger le Taux de Couverture
  useEffect(() => {
    const loadTauxCouverture = async () => {
      if (loadingTerritories || managerTerritories.length === 0) return;

      const cacheTimestamp = tauxCouvertureCacheTimestamps[selectedPeriod];
      const cacheKey = managerTerritories.join(',');
      
      if (isPeriodCacheValid(cacheTimestamp, cacheKey, storedTerritoryId)) return;

      try {
        const tauxPromises = managerTerritories.map(territoryId =>
          managerKpiService.getTauxCouverture(territoryId, selectedPeriod)
        );
        
        const tauxResults = await Promise.all(tauxPromises);
        
        const totalTaux = tauxResults.reduce((acc, taux) => ({
          value: 0,
          targetClients: acc.targetClients + taux.targetClients,
          visitedClients: acc.visitedClients + taux.visitedClients,
          coverageRate: 0,
          period: taux.period,
          startDate: taux.startDate,
          endDate: taux.endDate,
        }), {
          value: 0,
          targetClients: 0,
          visitedClients: 0,
          coverageRate: 0,
          period: selectedPeriod,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        });
        
        totalTaux.coverageRate = totalTaux.targetClients > 0 
          ? (totalTaux.visitedClients / totalTaux.targetClients) * 100 
          : 0;
        totalTaux.value = totalTaux.coverageRate;
        
        setTauxCouverture(selectedPeriod, totalTaux);
      } catch (error) {
        console.error('[useManagerKpis] Erreur chargement Taux Couverture:', error);
      }
    };

    loadTauxCouverture();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, managerTerritories, loadingTerritories]);

  // Charger le Hit Rate
  useEffect(() => {
    const loadHitRate = async () => {
      if (loadingTerritories || managerTerritories.length === 0) return;

      const cacheTimestamp = hitRateCacheTimestamps[selectedPeriod];
      const cacheKey = managerTerritories.join(',');
      
      if (isPeriodCacheValid(cacheTimestamp, cacheKey, storedTerritoryId)) return;

      try {
        const hitRatePromises = managerTerritories.map(territoryId =>
          managerKpiService.getHitRate(territoryId, selectedPeriod)
        );
        
        const hitRateResults = await Promise.all(hitRatePromises);
        
        const totalHitRate = hitRateResults.reduce((acc, hr) => ({
          value: 0,
          totalVisits: acc.totalVisits + hr.totalVisits,
          visitsWithSale: acc.visitsWithSale + hr.visitsWithSale,
          hitRate: 0,
          period: hr.period,
          startDate: hr.startDate,
          endDate: hr.endDate,
        }), {
          value: 0,
          totalVisits: 0,
          visitsWithSale: 0,
          hitRate: 0,
          period: selectedPeriod,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        });
        
        totalHitRate.hitRate = totalHitRate.totalVisits > 0 
          ? (totalHitRate.visitsWithSale / totalHitRate.totalVisits) * 100 
          : 0;
        totalHitRate.value = totalHitRate.hitRate;
        
        setHitRate(selectedPeriod, totalHitRate);
      } catch (error) {
        console.error('[useManagerKpis] Erreur chargement Hit Rate:', error);
      }
    };

    loadHitRate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, managerTerritories, loadingTerritories]);

  // Charger la Fréquence de Visite
  useEffect(() => {
    const loadFrequenceVisite = async () => {
      if (loadingTerritories || managerTerritories.length === 0) return;

      const cacheTimestamp = frequenceVisiteCacheTimestamps[selectedPeriod];
      const cacheKey = managerTerritories.join(',');
      
      if (isPeriodCacheValid(cacheTimestamp, cacheKey, storedTerritoryId)) return;

      try {
        const freqPromises = managerTerritories.map(territoryId =>
          managerKpiService.getFrequenceVisite(territoryId, selectedPeriod)
        );
        
        const freqResults = await Promise.all(freqPromises);
        
        const totalFreq = freqResults.reduce((acc, freq) => ({
          value: 0,
          totalVisits: acc.totalVisits + freq.totalVisits,
          uniqueClients: acc.uniqueClients + freq.uniqueClients,
          averageFrequency: 0,
          period: freq.period,
          startDate: freq.startDate,
          endDate: freq.endDate,
        }), {
          value: 0,
          totalVisits: 0,
          uniqueClients: 0,
          averageFrequency: 0,
          period: selectedPeriod,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        });
        
        totalFreq.averageFrequency = totalFreq.uniqueClients > 0 
          ? totalFreq.totalVisits / totalFreq.uniqueClients 
          : 0;
        totalFreq.value = totalFreq.averageFrequency;
        
        setFrequenceVisite(selectedPeriod, totalFreq);
      } catch (error) {
        console.error('[useManagerKpis] Erreur chargement Fréquence Visite:', error);
      }
    };

    loadFrequenceVisite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, managerTerritories, loadingTerritories]);

  // Charger la Vente par Visite
  useEffect(() => {
    const loadVenteParVisite = async () => {
      if (loadingTerritories || managerTerritories.length === 0) return;

      const cacheTimestamp = venteParVisiteCacheTimestamps[selectedPeriod];
      const cacheKey = managerTerritories.join(',');
      
      if (isPeriodCacheValid(cacheTimestamp, cacheKey, storedTerritoryId)) return;

      try {
        const ventePromises = managerTerritories.map(territoryId =>
          managerKpiService.getVenteParVisite(territoryId, selectedPeriod)
        );
        
        const venteResults = await Promise.all(ventePromises);
        
        const totalVente = venteResults.reduce((acc, vente) => ({
          value: 0,
          totalCA: acc.totalCA + vente.totalCA,
          totalVisits: acc.totalVisits + vente.totalVisits,
          averageCAPerVisit: 0,
          period: vente.period,
          startDate: vente.startDate,
          endDate: vente.endDate,
        }), {
          value: 0,
          totalCA: 0,
          totalVisits: 0,
          averageCAPerVisit: 0,
          period: selectedPeriod,
          startDate: new Date().toISOString(),
          endDate: new Date().toISOString(),
        });
        
        totalVente.averageCAPerVisit = totalVente.totalVisits > 0 
          ? totalVente.totalCA / totalVente.totalVisits 
          : 0;
        totalVente.value = totalVente.averageCAPerVisit;
        
        setVenteParVisite(selectedPeriod, totalVente);
      } catch (error) {
        console.error('[useManagerKpis] Erreur chargement Vente/Visite:', error);
      }
    };

    loadVenteParVisite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, managerTerritories, loadingTerritories]);

  return {
    // État de chargement
    isLoading,
    loadingTerritories,
    
    // KPIs
    currentCA,
    currentLPC,
    currentTauxCouverture,
    currentHitRate,
    currentFrequenceVisite,
    currentVenteParVisite,
    dropsize,
    
    // Infos manager
    managerTerritories,
    managerId,
  };
}
