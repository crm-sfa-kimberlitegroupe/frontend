import { useState } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { PeriodType } from '../../dashboard/stores/managerDashboardStore';
import { useRouteAnalytics } from '../hooks/useRouteAnalytics';
import VisitHeatmap from '../components/VisitHeatmap';

export default function RouteSUP() {
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  const [selectedDate, setSelectedDate] = useState<PeriodType>('today');

  // Charger les données réelles depuis la base de données
  const {
    totalVisits,
    totalSales,
    vendorPositions,
    hotspots,
    isLoading,
    territoryOptions,
  } = useRouteAnalytics(selectedDate, selectedTerritory);

  // Liste des territoires pour les filtres
  const territories = [{ id: 'all', name: 'Tous les territoires' }, ...territoryOptions];

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Carte Analytics</h1>
        
        {/* Filtres */}
        <div className="space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {territories.map((territory) => (
              <button
                key={territory.id}
                onClick={() => setSelectedTerritory(territory.id)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedTerritory === territory.id
                    ? 'bg-[#38BDF8] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {territory.name}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            {(['today', 'week', 'month'] as PeriodType[]).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedDate(period)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  selectedDate === period
                    ? 'bg-[#38BDF8] text-white shadow-md'
                    : 'bg-white text-gray-700 border border-gray-200'
                }`}
              >
                {period === 'today' && "Aujourd'hui"}
                {period === 'week' && 'Cette semaine'}
                {period === 'month' && 'Ce mois'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* Heatmap des visites */}
        <Card className="mb-4 p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Heatmap des visites</h3>
              <p className="text-sm text-gray-600">Densité des activités par zone</p>
            </div>
            <Button variant="outline" size="sm">
              Exporter
            </Button>
          </div>
          <VisitHeatmap 
            data={hotspots.map(h => ({ name: h.territoryName, visits: h.visits, sales: h.sales }))}
            isLoading={isLoading}
          />
        </Card>

        {/* Stats heatmap */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Visites totales</p>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '--' : totalVisits}
            </p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">CA généré</p>
            <p className="text-2xl font-bold text-gray-900">
              {isLoading ? '--' : (totalSales / 1000000).toFixed(1)}M
            </p>
          </Card>
        </div>

        {/* Zones chaudes */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">Zones les plus actives</h3>
          <Card className="divide-y divide-gray-200">
            {isLoading ? (
              <div className="p-4 text-center text-gray-500">Chargement...</div>
            ) : hotspots.length === 0 ? (
              <div className="p-4 text-center text-gray-500">Aucune donnée disponible</div>
            ) : (
              hotspots.map((hotspot, index) => (
                <div key={index} className="p-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant={index === 0 ? 'danger' : index === 1 ? 'warning' : 'success'}>
                      #{index + 1}
                    </Badge>
                    <span className="text-sm text-gray-900">
                      {hotspot.territoryName} ({hotspot.visits} visites)
                    </span>
                  </div>
                </div>
              ))
            )}
          </Card>
        </div>

        {/* Positions vendeurs en temps réel */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">
            Vendeurs actifs ({isLoading ? '--' : vendorPositions.filter(r => r.status === 'active').length})
          </h3>
          <div className="space-y-2">
            {isLoading ? (
              <Card className="p-4 text-center text-gray-500">Chargement...</Card>
            ) : vendorPositions.length === 0 ? (
              <Card className="p-4 text-center text-gray-500">Aucun vendeur actif</Card>
            ) : (
              vendorPositions.map((rep) => (
              <Card key={rep.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      rep.status === 'active' ? 'bg-success/20' : 'bg-gray-200'
                    }`}>
                      <span className="text-sm font-bold text-gray-600">V</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{rep.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="gray" size="sm">{rep.territory}</Badge>
                        <span className="text-xs text-gray-600">{rep.visits} visites</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${
                      rep.status === 'active' ? 'bg-success animate-pulse' : 'bg-gray-400'
                    }`} />
                    <span className="text-xs text-gray-600">
                      {rep.status === 'active' ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                </div>
              </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
