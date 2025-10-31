import { useState } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import RouteMap from '../components/RouteMap';
import { useGeolocation } from '../hooks/useGeolocation';
import { useRouteData } from '../hooks/useRouteData';
import NavigationCard from '../components/NavigationCard';
import RouteStatsCard from '../components/RouteStatsCard';

export default function RouteREP() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { latitude, longitude, error: geoError, loading: geoLoading, refresh: refreshLocation } = useGeolocation({ watch: true });
  const { routeStops, allOutlets, loading: routeLoading, error: routeError, refresh: refreshRoute, stats: routeStats } = useRouteData();

  const getStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray' => {
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
        return 'Visité';
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
      
      {/* Chargement */}
      {routeLoading && (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Chargement...</p>
        </div>
      </div>
      )}

      {/* Erreur */}
      {!routeLoading && routeError && (
        <div className="p-4">
          <Card className="p-6 text-center">
            <Icon name="warning" size="2xl" variant="red" className="mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune route planifiée</h3>
            <p className="text-gray-600 mb-4">{routeError}</p>
            <Button variant="primary" onClick={refreshRoute}>
              <Icon name="refresh" size="sm" className="mr-2" />
              Réessayer
            </Button>
          </Card>
        </div>
      )}

      {/* Contenu principal */}
      {!routeLoading && !routeError && (allOutlets.length > 0 || routeStops.length > 0) && (
        <>
          {/* En-tête avec toggle vue */}
          <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Ma Route
                <Icon name="map" size="lg" variant="primary" />
              </h1>
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
                <span className="text-gray-600 flex items-center gap-1">
                  <Icon name="truck" size="sm" variant="grey" />
                  {routeStats.totalDistance}
                </span>
                <span className="text-gray-600 flex items-center gap-1">
                  <Icon name="clock" size="sm" variant="grey" />
                  {routeStats.estimatedTime}
                </span>
              </div>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div className="p-4">
              {/* Carte de navigation */}
              <div className="mb-4">
                {(() => {
                  const nextStop = routeStops.find(s => s.status === 'in_progress' || s.status === 'planned');
                  return nextStop ? (
                    <NavigationCard
                      nextStop={{
                        name: nextStop.name,
                        distance: nextStop.distance,
                        time: '8 min',
                        estimatedArrival: nextStop.time,
                      }}
                      onStartNavigation={() => {
                        window.open(`https://www.google.com/maps/dir/?api=1&destination=${nextStop.latitude},${nextStop.longitude}`, '_blank');
                      }}
                    />
                  ) : (
                    <NavigationCard />
                  );
                })()}
              </div>

              {/* Statistiques de la route */}
              <div className="mb-4">
                <RouteStatsCard
                  totalStops={routeStats.totalStops}
                  completed={routeStats.completed}
                  remaining={routeStats.remaining}
                  totalDistance={routeStats.totalDistance}
                  estimatedTime={routeStats.estimatedTime}
                  currentTime={new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                />
              </div>

              {/* Carte interactive */}
              <Card className="mb-4 overflow-hidden relative">
                {geoLoading && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-white px-4 py-3 rounded-lg shadow-lg">
                    <div className="flex items-center gap-3">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      <p className="text-sm text-gray-600">Localisation en cours...</p>
                    </div>
                  </div>
                )}
                {geoError && (
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[1000] bg-red-50 px-4 py-2 rounded-lg shadow-lg">
                    <p className="text-sm text-red-600">{geoError}</p>
                    <button 
                      onClick={refreshLocation}
                      className="text-xs text-red-700 underline mt-1"
                    >
                      Réessayer
                    </button>
                  </div>
                )}
                <RouteMap
                  stops={routeStops}
                  allOutlets={allOutlets}
                  userLocation={latitude && longitude ? { latitude, longitude } : null}
                  height="400px"
                  showRoute={true}
                />
                
                {/* Légende */}
                <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 z-[1000]">
                  <p className="text-xs font-semibold text-gray-900 mb-2">Légende</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span>Votre position</span>
                    </div>
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
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                      <span>PDV du territoire</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Actions rapides */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <Button variant="outline" fullWidth>
                  <Icon name="plus" size="sm" className="mr-2" />
                  Visite hors route
                </Button>
                <Button variant="outline" fullWidth onClick={refreshLocation}>
                  <Icon name="refresh" size="sm" className="mr-2" />
                  Ma position
                </Button>
              </div>

              {/* Arrêts à proximité */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">Prochains arrêts</h3>
                <div className="space-y-2">
                  {routeStops.filter(stop => stop.status !== 'completed').map((stop) => (
                    <Card key={stop.id} className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1">
                          <h4 className="font-medium text-gray-900">{stop.name}</h4>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Icon name="clock" size="xs" variant="grey" />
                              {stop.time}
                            </span>
                            <span className="text-xs text-gray-600 flex items-center gap-1">
                              <Icon name="truck" size="xs" variant="grey" />
                              {stop.distance}
                            </span>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(stop.status)} size="sm">
                          {getStatusLabel(stop.status)}
                        </Badge>
                      </div>
                      {stop.status === 'in_progress' && (
                        <div className="flex gap-2 mt-3">
                          <Button variant="success" size="sm" fullWidth>
                            <Icon name="checkCircle" size="xs" className="mr-1" />
                            Commencer
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`, '_blank')}
                          >
                            <Icon name="map" size="xs" />
                          </Button>
                        </div>
                      )}
                      {stop.status === 'planned' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          fullWidth 
                          className="mt-3"
                          onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`, '_blank')}
                        >
                          <Icon name="map" size="xs" className="mr-1" />
                          Voir l'itinéraire
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
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <Icon name="clock" size="xs" variant="grey" />
                                {stop.time}
                              </span>
                              <span className="text-xs text-gray-600 flex items-center gap-1">
                                <Icon name="truck" size="xs" variant="grey" />
                                {stop.distance}
                              </span>
                            </div>
                          </div>
                          <Badge variant={getStatusColor(stop.status)} size="sm">
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
        </>
      )}
    </div>
  );
}
