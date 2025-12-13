import { useState, useEffect } from 'react';
import Card from '../../../core/ui/Card';
import KPICard from '../../../core/ui/KPICard';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { PeriodType } from '../stores/managerDashboardStore';
import { useManagerKpis } from '../hooks/useManagerKpis';
import { managerKpiService } from '../services/managerKpiService';
import { 
  formatCA, 
  getCAUnit, 
  getCALabel, 
  formatTauxCouverture, 
  formatHitRate, 
  formatLPC, 
  formatFrequenceVisite, 
  formatDropsize, 
  getDropsizeUnit, 
  formatVenteParVisite, 
  getVenteParVisiteUnit 
} from '../utils/kpiFormatters';

interface VendorPerformance {
  id: string;
  name: string;
  sales: number;
  visits: number;
  rank?: number;
}

export default function HomeSUP() {
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('today');
  const [topPerformers, setTopPerformers] = useState<VendorPerformance[]>([]);
  const [lowPerformers, setLowPerformers] = useState<VendorPerformance[]>([]);

  // Utiliser le hook personnalisé pour charger tous les KPIs
  const {
    isLoading,
    currentCA,
    currentLPC,
    currentTauxCouverture,
    currentHitRate,
    currentFrequenceVisite,
    currentVenteParVisite,
    dropsize,
    managerTerritories,
  } = useManagerKpis(selectedPeriod);

  // Charger les performances de l'équipe
  useEffect(() => {
    const loadTeamPerformance = async () => {
      if (managerTerritories.length === 0) return;

      try {
        
        // Charger les performances pour chaque territoire et agréger
        const performancePromises = managerTerritories.map(territoryId =>
          managerKpiService.getTeamPerformance(territoryId, selectedPeriod)
        );
        
        const performanceResults = await Promise.all(performancePromises);
        
        // Agréger les performances de tous les territoires
        const allVendors = new Map<string, VendorPerformance>();
        
        performanceResults.forEach(result => {
          result.topPerformers?.forEach((vendor: VendorPerformance) => {
            const existing = allVendors.get(vendor.id);
            if (existing) {
              existing.sales += vendor.sales;
              existing.visits += vendor.visits;
            } else {
              allVendors.set(vendor.id, { ...vendor });
            }
          });
          
          result.lowPerformers?.forEach((vendor: VendorPerformance) => {
            const existing = allVendors.get(vendor.id);
            if (existing) {
              existing.sales += vendor.sales;
              existing.visits += vendor.visits;
            } else {
              allVendors.set(vendor.id, { ...vendor });
            }
          });
        });
        
        // Convertir en tableau et trier
        const allPerformances = Array.from(allVendors.values());
        allPerformances.sort((a, b) => b.sales - a.sales);
        
        // Top 3
        const top = allPerformances.slice(0, 3).map((perf, index) => ({
          ...perf,
          rank: index + 1,
        }));
        
        // Bottom 2
        const low = allPerformances.slice(-2).reverse();
        
        setTopPerformers(top);
        setLowPerformers(low);
      } catch (error) {
        console.error('[HomeSUP] Erreur chargement performances équipe:', error);
      }
    };

    loadTeamPerformance();
  }, [selectedPeriod, managerTerritories]);

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
                ? 'bg-[#38BDF8] text-white shadow-md'
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
          value={isLoading ? '--' : formatTauxCouverture(currentTauxCouverture?.coverageRate)}
          unit="%"
          icon="checkCircle"
          color="green"
        />
        <KPICard
          label="Hit Rate"
          value={isLoading ? '--' : formatHitRate(currentHitRate?.hitRate)}
          unit="%"
          icon="star"
          color="primary"
        />
        <KPICard
          label={getCALabel(selectedPeriod)}
          value={isLoading ? '--' : formatCA(currentCA?.value)}
          unit={isLoading ? '' : getCAUnit(currentCA?.value)}
          icon="cart"
          color="primary"
        />
        <KPICard
          label="Dropsize"
          value={isLoading ? '--' : formatDropsize(dropsize)}
          unit={isLoading ? '' : getDropsizeUnit(dropsize)}
          icon="package"
          color="green"
        />
        <KPICard
          label="LPC"
          value={isLoading ? '--' : formatLPC(currentLPC?.linesPerOrder)}
          unit="lignes"
          icon="cube"
          color="primary"
        />
        <KPICard
          label="Fréquence Visite"
          value={isLoading ? '--' : formatFrequenceVisite(currentFrequenceVisite?.averageFrequency)}
          unit="visites/client"
          icon="locationMarker"
          color="yellow"
        />
        <KPICard
          label="CA/Visite"
          value={isLoading ? '--' : formatVenteParVisite(currentVenteParVisite?.averageCAPerVisit)}
          unit={isLoading ? '' : getVenteParVisiteUnit(currentVenteParVisite?.averageCAPerVisit)}
          icon="cart"
          color="green"
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
