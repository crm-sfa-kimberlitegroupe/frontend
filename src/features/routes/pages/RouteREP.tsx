import { useState, useMemo } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import RouteMap from '../components/RouteMap';
import { useGeolocation } from '../hooks/useGeolocation';
import { useOutletsStore } from '../../outlets/store/outletsStore';
import { useRouteVisits } from '../../visits/hooks/useRouteVisits';
import NavigationCard from '../components/NavigationCard';
import RouteStatsCard from '../components/RouteStatsCard';
import PDVFormWizard from '../../visits/components/PDVFormWizard';
import {
  calculateDistanceToStop,
  calculateRouteStats,
} from '../utils/routeCalculations';

export default function RouteREP() {
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const [showPDVForm, setShowPDVForm] = useState(false);
  const { latitude, longitude, error: geoError, refresh: refreshLocation } = useGeolocation({ watch: true });
  
  // Utiliser le hook useRouteVisits qui contient la logique avancée
  const { 
    visits, 
    routePlan: todayRoute
  } = useRouteVisits();
  
  // Garder les outlets pour la carte
  const { outlets } = useOutletsStore();

  // Position actuelle du vendeur
  const userLocation = useMemo(() => {
    if (latitude && longitude) {
      return { latitude, longitude };
    }
    return null;
  }, [latitude, longitude]);

  // Convertir les visits du hook en format RouteStop pour la carte
  const routeStops = useMemo(() => {
    return visits.map((visit, index) => {
      const outlet = outlets.find(o => o.id === visit.outletId);
      const stopLat = outlet?.lat || 0;
      const stopLng = outlet?.lng || 0;
      
      // Calculer la distance reelle depuis la position du vendeur
      const { distance, time } = calculateDistanceToStop(
        userLocation,
        stopLat,
        stopLng
      );

      return {
        id: parseInt(visit.id) || (index + 1),
        name: visit.pdvName,
        address: visit.address || outlet?.address || '',
        latitude: stopLat,
        longitude: stopLng,
        lat: stopLat,
        lng: stopLng,
        status: visit.status === 'COMPLETED' ? 'completed' as const :
                visit.status === 'IN_PROGRESS' ? 'in_progress' as const : 'planned' as const,
        time: visit.scheduledTime,
        estimatedTime: visit.scheduledTime,
        actualTime: visit.checkOutTime,
        distance,
        travelTime: time,
        notes: ''
      };
    });
  }, [visits, outlets, userLocation]);
  
  const allOutlets = useMemo(() => {
    return outlets.map((outlet, index) => {
      // Chercher si ce PDV a une visite associee
      const associatedVisit = visits.find(visit => visit.outletId === outlet.id);
      
      // Determiner le statut base sur la visite
      let outletStatus: 'completed' | 'planned' | 'in_progress' | 'territory' = 'territory';
      
      if (associatedVisit) {
        if (associatedVisit.status === 'COMPLETED') {
          outletStatus = 'completed';
        } else if (associatedVisit.status === 'IN_PROGRESS') {
          outletStatus = 'in_progress';
        } else if (associatedVisit.status === 'PLANNED') {
          outletStatus = 'planned';
        }
      }

      // Calculer la distance reelle depuis la position du vendeur
      const { distance, time } = calculateDistanceToStop(
        userLocation,
        outlet.lat || 0,
        outlet.lng || 0
      );
      
      return {
        id: parseInt(outlet.id) || index + 1000,
        name: outlet.name,
        address: outlet.address,
        latitude: outlet.lat || 0,
        longitude: outlet.lng || 0,
        lat: outlet.lat || 0,
        lng: outlet.lng || 0,
        status: outletStatus,
        time: associatedVisit?.scheduledTime || '00:00',
        estimatedTime: associatedVisit?.scheduledTime || '00:00',
        actualTime: associatedVisit?.checkOutTime,
        distance,
        travelTime: time,
        notes: ''
      };
    });
  }, [outlets, visits, userLocation]);
  
  // Statistiques calculees en temps reel basees sur la position GPS
  const routeStats = useMemo(() => {
    const stats = calculateRouteStats(routeStops, userLocation);
    
    return {
      totalStops: routeStops.length,
      completed: routeStops.filter(stop => stop.status === 'completed').length,
      remaining: routeStops.filter(stop => stop.status !== 'completed').length,
      totalDistance: stats.totalDistanceFormatted,
      estimatedTime: stats.estimatedTimeFormatted,
      remainingDistance: stats.remainingDistanceFormatted,
      remainingTime: stats.remainingTimeFormatted,
    };
  }, [routeStops, userLocation]);
  
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
      
      {/* Données chargées depuis les stores préchargés */}


      {/* Contenu principal - Afficher même s'il y a une erreur du hook mais qu'il y a des outlets */}
      {allOutlets.length > 0 && (
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
                  // Verifier d'abord s'il y a une route planifiee
                  if (!todayRoute || routeStops.length === 0) {
                    // Pas de route planifiee pour aujourd'hui
                    return (
                      <Card className="p-4 bg-gradient-to-r from-gray-50 to-slate-50 border-gray-200">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Icon name="map" size="2xl" variant="grey" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">Aucune route planifiee</h3>
                          <p className="text-sm text-gray-600">Pas de route assignee pour aujourd'hui</p>
                        </div>
                      </Card>
                    );
                  }
                  
                  const nextStop = routeStops.find(s => s.status === 'planned');
                  return nextStop ? (
                    <NavigationCard
                      nextStop={{
                        name: nextStop.name,
                        distance: nextStop.distance,
                        time: nextStop.travelTime,
                        estimatedArrival: nextStop.time,
                        latitude: nextStop.latitude,
                        longitude: nextStop.longitude,
                      }}
                      onStartNavigation={() => {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${nextStop.latitude},${nextStop.longitude}`;
                        window.open(url, '_blank');
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
                  remainingDistance={routeStats.remainingDistance}
                  remainingTime={routeStats.remainingTime}
                  currentTime={new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                />
              </div>

              {/* Carte interactive */}
              <Card className="mb-4 overflow-hidden relative">
                {/* Géolocalisation déjà disponible depuis le préchargement */}
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
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 z-[1000] border border-gray-200">
                  <p className="text-xs font-semibold text-gray-900 mb-2">Légende</p>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 flex items-center justify-center text-red-500">📍</div>
                      <span>Votre position</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded-full bg-green-500 flex items-center justify-center text-white text-[8px] font-bold">✓</div>
                      <span>PDV visité</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded-full bg-orange-500 flex items-center justify-center text-white text-[8px] font-bold">●</div>
                      <span>Visite en cours</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center text-white text-[8px] font-bold">!</div>
                      <span>PDV planifié</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      <div className="w-4 h-4 rounded-full bg-gray-400 flex items-center justify-center text-white text-[8px] font-bold">○</div>
                      <span>PDV du territoire</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Formulaire d'enregistrement de PDV */}
              {showPDVForm && (
                <div className="mb-4">
                  <PDVFormWizard onClose={() => setShowPDVForm(false)} userRole="REP" />
                </div>
              )}

              {/* Actions rapides */}
              {!showPDVForm && (
                <div className="space-y-3 mb-4">
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" fullWidth>
                      <Icon name="plus" size="sm" className="mr-2" />
                      Visite hors route
                    </Button>
                    <Button variant="outline" fullWidth onClick={refreshLocation}>
                      <Icon name="refresh" size="sm" className="mr-2" />
                      Ma position
                    </Button>
                  </div>
                  <Button 
                    variant="primary" 
                    fullWidth
                    onClick={() => setShowPDVForm(true)}
                  >
                    <Icon name="plus" size="sm" className="mr-2" />
                    Enregistrer point de vente
                  </Button>
                </div>
              )}

              {/* Arrêts à proximité - Afficher seulement s'il y a des visites planifiées */}
              {!showPDVForm && routeStops.length > 0 && (
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
                            <span className="text-xs text-primary flex items-center gap-1">
                              <Icon name="clock" size="xs" variant="primary" />
                              {stop.travelTime}
                            </span>
                          </div>
                        </div>
                        <Badge variant={getStatusColor(stop.status)} size="sm">
                          {getStatusLabel(stop.status)}
                        </Badge>
                      </div>
                      {stop.status === 'planned' && (
                        <Button 
                          variant="outline" 
                          size="sm" 
                          fullWidth 
                          className="mt-3"
                          onClick={() => {
                            const url = `https://www.google.com/maps/dir/?api=1&destination=${stop.latitude},${stop.longitude}`;
                            // Ouvrir directement Google Maps dans une nouvelle fenêtre/onglet
                            window.open(url, '_blank');
                          }}
                        >
                          <Icon name="map" size="xs" className="mr-1" />
                          Voir l'itinéraire
                        </Button>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
              )}
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
                              <span className="text-xs text-primary flex items-center gap-1">
                                {stop.travelTime}
                              </span>
                            </div>
                          </div>
                          <Badge variant={getStatusColor(stop.status)} size="sm">
                            {getStatusLabel(stop.status)}
                          </Badge>
                        </div>
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
