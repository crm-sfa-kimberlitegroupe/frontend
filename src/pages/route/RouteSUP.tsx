import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function RouteSUP() {
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  const [selectedDate, setSelectedDate] = useState('today');

  const territories = ['all', 'Plateau', 'Cocody', 'Marcory', 'Yopougon', 'Abobo'];

  const salesRepPositions = [
    { id: 1, name: 'Jean Kouassi', territory: 'Plateau', status: 'active', visits: 5, lat: 5.316667, lng: -4.033333 },
    { id: 2, name: 'Marie Diallo', territory: 'Cocody', status: 'active', visits: 4, lat: 5.35, lng: -3.983333 },
    { id: 3, name: 'Paul Bamba', territory: 'Marcory', status: 'inactive', visits: 2, lat: 5.283333, lng: -3.983333 },
  ];

  const heatmapData = {
    totalVisits: 127,
    totalSales: 1250000,
    hotspots: ['Plateau (45 visites)', 'Cocody (38 visites)', 'Marcory (24 visites)'],
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Carte Analytics 🗺️</h1>
        
        {/* Filtres */}
        <div className="space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {territories.map((territory) => (
              <button
                key={territory}
                onClick={() => setSelectedTerritory(territory)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedTerritory === territory
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {territory === 'all' ? 'Tous les territoires' : territory}
              </button>
            ))}
          </div>
          
          <div className="flex gap-2">
            {['today', 'week', 'month'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedDate(period)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                  selectedDate === period
                    ? 'bg-accent text-white'
                    : 'bg-gray-100 text-gray-700'
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
        {/* Carte avec heatmap */}
        <Card className="mb-4 overflow-hidden">
          <div className="h-80 bg-gradient-to-br from-danger/20 via-warning/20 to-success/20 relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <p className="text-5xl mb-3">🔥</p>
                <p className="text-lg font-semibold text-gray-900">Heatmap des visites</p>
                <p className="text-sm text-gray-600 mt-1">Densité des activités par zone</p>
              </div>
            </div>
            
            {/* Légende heatmap */}
            <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
              <p className="text-xs font-semibold text-gray-900 mb-2">Intensité</p>
              <div className="flex items-center gap-2">
                <div className="w-8 h-3 bg-gradient-to-r from-success via-warning to-danger rounded" />
                <div className="flex justify-between w-full text-xs text-gray-600">
                  <span>Faible</span>
                  <span>Élevée</span>
                </div>
              </div>
            </div>

            {/* Bouton export */}
            <div className="absolute top-4 right-4">
              <Button variant="outline" size="sm" className="bg-white">
                📥 Exporter
              </Button>
            </div>
          </div>
        </Card>

        {/* Stats heatmap */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">Visites totales</p>
            <p className="text-2xl font-bold text-gray-900">{heatmapData.totalVisits}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-1">CA généré</p>
            <p className="text-2xl font-bold text-gray-900">
              {(heatmapData.totalSales / 1000000).toFixed(1)}M
            </p>
          </Card>
        </div>

        {/* Zones chaudes */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">Zones les plus actives 🔥</h3>
          <Card className="divide-y divide-gray-200">
            {heatmapData.hotspots.map((hotspot, index) => (
              <div key={index} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant={index === 0 ? 'danger' : index === 1 ? 'warning' : 'success'}>
                    #{index + 1}
                  </Badge>
                  <span className="text-sm text-gray-900">{hotspot}</span>
                </div>
                <span className="text-xl">
                  {index === 0 ? '🔥' : index === 1 ? '⚡' : '✨'}
                </span>
              </div>
            ))}
          </Card>
        </div>

        {/* Positions vendeurs en temps réel */}
        <div>
          <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">
            Vendeurs actifs ({salesRepPositions.filter(r => r.status === 'active').length})
          </h3>
          <div className="space-y-2">
            {salesRepPositions.map((rep) => (
              <Card key={rep.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      rep.status === 'active' ? 'bg-success/20' : 'bg-gray-200'
                    }`}>
                      <span className="text-xl">👤</span>
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
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
