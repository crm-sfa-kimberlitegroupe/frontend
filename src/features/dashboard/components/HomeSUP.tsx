import { useState, useEffect } from 'react';
import Card from '../../../core/ui/Card';
import KPICard from '../../../core/ui/KPICard';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { useAuthStore } from '../../../core/auth/authStore';
import { useManagerDashboardStore, isPeriodCacheValid, PeriodType } from '../stores/managerDashboardStore';
import { managerKpiService } from '../services/managerKpiService';
import { territoriesService } from '../../territories/services/territoriesService';

export default function HomeSUP() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('today');
  const [managerTerritories, setManagerTerritories] = useState<string[]>([]);
  const [loadingTerritories, setLoadingTerritories] = useState(true);
  
  // Récupérer le user connecté (manager SUP)
  const { user } = useAuthStore();
  const managerId = user?.id;

  // Store manager pour les KPIs
  const {
    caByPeriod,
    cacheTimestamps,
    territoryId: storedTerritoryId,
    isLoading,
    setCa,
    setLoading,
    setError,
    setTerritoryId,
  } = useManagerDashboardStore();

  // CA actuel selon la période sélectionnée
  const currentCA = caByPeriod[selectedPeriod];
  
  // Log pour debug - affiche le CA actuel à chaque rendu
  console.log('[HomeSUP] 📊 Rendu - currentCA:', currentCA);
  console.log('[HomeSUP] 📊 Rendu - isLoading:', isLoading);
  console.log('[HomeSUP] 📊 Rendu - caByPeriod:', caByPeriod);

  // Charger les territoires du manager au montage
  useEffect(() => {
    const loadManagerTerritories = async () => {
      if (!managerId) {
        console.log('[HomeSUP] ❌ Pas de managerId');
        setLoadingTerritories(false);
        return;
      }

      try {
        console.log('[HomeSUP] 🔄 Chargement des territoires du manager:', managerId);
        const territories = await territoriesService.getManagerTerritories(managerId);
        const territoryIds = territories.map(t => t.id);
        setManagerTerritories(territoryIds);
        console.log('[HomeSUP] ✅ Territoires chargés:', territoryIds);
      } catch (error) {
        console.error('[HomeSUP] ❌ Erreur chargement territoires:', error);
      } finally {
        setLoadingTerritories(false);
      }
    };

    loadManagerTerritories();
  }, [managerId]);

  // Charger le CA quand la période change ou les territoires sont chargés
  useEffect(() => {
    const loadCA = async () => {
      if (loadingTerritories) {
        console.log('[HomeSUP] ⏳ Attente du chargement des territoires...');
        return;
      }

      if (managerTerritories.length === 0) {
        console.log('[HomeSUP] ❌ Aucun territoire assigné au manager');
        return;
      }

      console.log('========== [HomeSUP] DÉBUT CHARGEMENT CA ==========');
      console.log('[HomeSUP] Période sélectionnée:', selectedPeriod);
      console.log('[HomeSUP] Territoires du manager:', managerTerritories);

      // Vérifier si le cache est valide pour cette période
      const cacheTimestamp = cacheTimestamps[selectedPeriod];
      const cacheKey = managerTerritories.join(',');
      
      if (isPeriodCacheValid(cacheTimestamp, cacheKey, storedTerritoryId)) {
        console.log(`[HomeSUP] ✅ Cache valide pour période: ${selectedPeriod}`);
        return;
      }

      try {
        console.log(`[HomeSUP] 🔄 Chargement CA pour ${managerTerritories.length} territoires`);
        setLoading(true);
        setTerritoryId(cacheKey);

        // Charger le CA pour chaque territoire en parallèle
        const caPromises = managerTerritories.map(territoryId =>
          managerKpiService.getCA(territoryId, selectedPeriod)
        );
        
        const caResults = await Promise.all(caPromises);
        
        // Agréger les résultats
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
        
        console.log('[HomeSUP] ✅ CA total calculé:', totalCA);
        setCa(selectedPeriod, totalCA);
      } catch (error) {
        console.error('[HomeSUP] ❌ Erreur chargement CA:', error);
        setError(error instanceof Error ? error.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
        console.log('========== [HomeSUP] FIN CHARGEMENT CA ==========');
      }
    };

    loadCA();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPeriod, managerTerritories, loadingTerritories]);

  // Formater les montants
  const formatCA = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '--';
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1);
    }
    return (value / 1000).toFixed(0);
  };

  // Unité selon le montant
  const getCAUnit = (value: number | undefined | null): string => {
    if (value === undefined || value === null) return '';
    if (value >= 1000000) return 'M FCFA';
    return 'K FCFA';
  };

  // Label du CA selon la période
  const getCALabel = (): string => {
    switch (selectedPeriod) {
      case 'today': return "CA du jour";
      case 'week': return "CA de la semaine";
      case 'month': return "CA du mois";
      case 'quarter': return "CA du trimestre";
      default: return "Chiffre d'Affaires";
    }
  };

  // KPIs mockés pour les autres indicateurs (à implémenter plus tard)
  const kpis = {
    coverage: 87.5,
    strikeRate: 72.3,
    todayVisits: 127,
  };

  const topPerformers = [
    { id: 1, name: 'Jean Kouassi', sales: 450000, visits: 18, rank: 1 },
    { id: 2, name: 'Marie Diallo', sales: 380000, visits: 15, rank: 2 },
    { id: 3, name: 'Paul Bamba', sales: 320000, visits: 14, rank: 3 },
  ];

  const lowPerformers = [
    { id: 1, name: 'Eric Toure', sales: 45000, visits: 3 },
    { id: 2, name: 'Sophie Kone', sales: 52000, visits: 4 },
  ];

  return (
    <div className="pb-20 px-4 pt-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          Dashboard Manager
          <Icon name="chartBar" size="lg" variant="primary" />
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Filtres rapides */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {(['today', 'week', 'month', 'quarter'] as PeriodType[]).map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedPeriod === period
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {period === 'today' && "Aujourd'hui"}
            {period === 'week' && 'Cette semaine'}
            {period === 'month' && 'Ce mois'}
            {period === 'quarter' && 'Ce trimestre'}
          </button>
        ))}
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <KPICard
          label="Taux de couverture"
          value={kpis.coverage}
          unit="%"
          icon="checkCircle"
          color="green"
          trend={5.2}
        />
        <KPICard
          label="Strike Rate"
          value={kpis.strikeRate}
          unit="%"
          icon="star"
          color="primary"
          trend={-2.1}
        />
        <KPICard
          label={getCALabel()}
          value={isLoading ? '--' : formatCA(currentCA?.value)}
          unit={isLoading ? '' : getCAUnit(currentCA?.value)}
          icon="cart"
          color="primary"
        />
        <KPICard
          label="Visites effectuées"
          value={kpis.todayVisits}
          icon="locationMarker"
          color="yellow"
          trend={8.3}
        />
      </div>

      {/* Graphique de performance (placeholder) */}
      <Card className="p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Évolution des ventes</h3>
        <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Icon name="chartBar" size="2xl" variant="primary" className="mb-2" />
            <p className="text-sm text-gray-600">Graphique interactif</p>
          </div>
        </div>
      </Card>

      {/* Top performers */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          Top Vendeurs
          <Icon name="star" size="md" variant="yellow" />
        </h3>
        <Card className="divide-y divide-gray-200">
          {topPerformers.map((performer, index) => (
            <div key={performer.id} className="p-4">
              <div className="flex items-center gap-3">
                <Icon 
                  name="star" 
                  size="xl" 
                  variant={performer.rank === 1 ? 'yellow' : performer.rank === 2 ? 'grey' : 'red'}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{performer.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {(performer.sales / 1000).toFixed(0)}K FCFA
                    </span>
                    <span className="text-sm text-gray-600">
                      {performer.visits} visites
                    </span>
                  </div>
                </div>
                <Badge variant="success">#{index + 1}</Badge>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Low performers */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          À surveiller
          <Icon name="warning" size="md" variant="yellow" />
        </h3>
        <Card className="divide-y divide-gray-200">
          {lowPerformers.map((performer) => (
            <div key={performer.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{performer.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {(performer.sales / 1000).toFixed(0)}K FCFA
                    </span>
                    <span className="text-sm text-gray-600">
                      {performer.visits} visites
                    </span>
                  </div>
                </div>
                <Badge variant="warning">Faible</Badge>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Bouton export */}
      <Card className="p-4">
        <button className="w-full flex items-center justify-center gap-2 text-primary font-medium">
          <Icon name="download" size="md" />
          Exporter les données (Excel)
        </button>
      </Card>
    </div>
  );
}
