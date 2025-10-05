import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

export default function RouteREP() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');

  const routeStops = [
    { id: 1, name: 'Supermarché Plateau', status: 'completed', time: '08:00', distance: '0 km' },
    { id: 2, name: 'Boutique Cocody', status: 'completed', time: '09:30', distance: '3.2 km' },
    { id: 3, name: 'Épicerie Marcory', status: 'in_progress', time: '11:00', distance: '5.1 km' },
    { id: 4, name: 'Mini-market Yopougon', status: 'planned', time: '13:00', distance: '7.8 km' },
    { id: 5, name: 'Superette Abobo', status: 'planned', time: '14:30', distance: '11.2 km' },
  ];

  const routeStats = {
    totalStops: 5,
    completed: 2,
    remaining: 3,
    totalDistance: '27.3 km',
    estimatedTime: '3h 15min',
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'warning';
      case 'planned':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Visité ✓';
      case 'in_progress':
        return 'En cours';
      case 'planned':
        return 'Planifié';
      default:
        return status;
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête avec toggle vue */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Ma Route 🗺️</h1>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('map')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                viewMode === 'map'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Carte
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                viewMode === 'list'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Liste
            </button>
          </div>
        </div>

        {/* Stats de la route */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              <span className="font-semibold text-gray-900">{routeStats.completed}</span>/{routeStats.totalStops} visités
            </span>
            <span className="text-gray-600">
              📏 {routeStats.totalDistance}
            </span>
            <span className="text-gray-600">
              ⏱️ {routeStats.estimatedTime}
            </span>
          </div>
        </div>
      </div>

      {viewMode === 'map' ? (
        <div className="p-4">
          {/* Carte interactive (placeholder) */}
          <Card className="mb-4 overflow-hidden">
            <div className="h-96 bg-gradient-to-br from-secondary/20 to-primary/20 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <p className="text-5xl mb-3">🗺️</p>
                  <p className="text-lg font-semibold text-gray-900">Carte Interactive</p>
                  <p className="text-sm text-gray-600 mt-1">OpenStreetMap</p>
                </div>
              </div>
              
              {/* Légende */}
              <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
                <p className="text-xs font-semibold text-gray-900 mb-2">Légende</p>
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span>Visité</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-warning" />
                    <span>En cours</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-3 h-3 rounded-full bg-gray-400" />
                    <span>Planifié</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Bouton visite hors routing */}
          <Button variant="outline" fullWidth className="mb-4">
            <span className="mr-2">➕</span>
            Visite hors routing
          </Button>

          {/* Arrêts à proximité */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">Arrêts à proximité</h3>
            <div className="space-y-2">
              {routeStops.filter(stop => stop.status !== 'completed').slice(0, 2).map((stop) => (
                <Card key={stop.id} className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{stop.name}</h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-600">⏰ {stop.time}</span>
                        <span className="text-xs text-gray-600">📏 {stop.distance}</span>
                      </div>
                    </div>
                    <Badge variant={getStatusColor(stop.status) } size="sm">
                      {getStatusLabel(stop.status)}
                    </Badge>
                  </div>
                  {stop.status === 'in_progress' && (
                    <Button variant="success" size="sm" fullWidth className="mt-3">
                      Commencer la visite
                    </Button>
                  )}
                </Card>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4">
          {/* Vue liste */}
          <div className="space-y-3">
            {routeStops.map((stop, index) => (
              <Card key={stop.id} className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    stop.status === 'completed' ? 'bg-success text-white' :
                    stop.status === 'in_progress' ? 'bg-warning text-white' :
                    'bg-gray-200 text-gray-600'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">{stop.name}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-600">⏰ {stop.time}</span>
                          <span className="text-xs text-gray-600">📏 {stop.distance}</span>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(stop.status) } size="sm">
                        {getStatusLabel(stop.status)}
                      </Badge>
                    </div>
                    {stop.status === 'in_progress' && (
                      <Button variant="success" size="sm" fullWidth className="mt-2">
                        Commencer la visite
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
