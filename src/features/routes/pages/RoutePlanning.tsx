import { useState, useEffect } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import RoutePlanningModal from '../components/RoutePlanningModal';
import routesService, { type RoutePlan } from '../services/routesService';

export default function RoutePlanning() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'PLANNED' | 'IN_PROGRESS' | 'DONE'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]); 

  useEffect(() => {
    loadRoutes();
  }, [selectedDate, selectedFilter]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = {};
      
      if (selectedDate) {
        filters.date = selectedDate;
      }
      
      if (selectedFilter !== 'all') {
        filters.status = selectedFilter;
      }

      const data = await routesService.getAll(filters);
      setRoutes(data);
    } catch (err) {
      console.error('Erreur chargement routes:', err);
      setError('Impossible de charger les routes');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette route ?')) {
      return;
    }

    try {
      await routesService.delete(routeId);
      await loadRoutes();
    } catch (err) {
      console.error('Erreur suppression route:', err);
      alert('Erreur lors de la suppression de la route');
    }
  };

  const getStatusColor = (status: string): 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'gray' => {
    switch (status) {
      case 'DONE':
        return 'success';
      case 'IN_PROGRESS':
        return 'warning';
      case 'PLANNED':
        return 'primary';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'Terminée';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'PLANNED':
        return 'Planifiée';
      default:
        return status;
    }
  };

  const filteredRoutes = selectedFilter === 'all' 
    ? (routes || [])
    : (routes || []).filter(route => route.status === selectedFilter);

  const stats = {
    total: routes?.length || 0,
    planned: routes?.filter(r => r.status === 'PLANNED').length || 0,
    inProgress: routes?.filter(r => r.status === 'IN_PROGRESS').length || 0,
    done: routes?.filter(r => r.status === 'DONE').length || 0,
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Icon name="map" size="lg" variant="primary" />
            Planification des Routes
          </h1>
          <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
            <Icon name="plus" size="sm" className="mr-2" />
            Nouvelle route
          </Button>
        </div>

        {/* Sélecteur de date */}
        <div className="mb-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
          />
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <div className="bg-gray-50 rounded-lg p-2 text-center">
            <p className="text-xs text-gray-600">Total</p>
            <p className="text-lg font-bold text-gray-900">{stats.total}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-2 text-center">
            <p className="text-xs text-blue-600">Planifiées</p>
            <p className="text-lg font-bold text-blue-600">{stats.planned}</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-2 text-center">
            <p className="text-xs text-yellow-600">En cours</p>
            <p className="text-lg font-bold text-yellow-600">{stats.inProgress}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-2 text-center">
            <p className="text-xs text-green-600">Terminées</p>
            <p className="text-lg font-bold text-green-600">{stats.done}</p>
          </div>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[
            { key: 'all', label: 'Toutes', count: stats.total },
            { key: 'PLANNED', label: 'Planifiées', count: stats.planned },
            { key: 'IN_PROGRESS', label: 'En cours', count: stats.inProgress },
            { key: 'DONE', label: 'Terminées', count: stats.done },
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setSelectedFilter(filter.key as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {filter.label} ({filter.count})
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        {/* Chargement */}
        {loading && (
          <div className="text-center py-12">
            <Icon name="refresh" size="2xl" variant="primary" className="animate-spin mb-3" />
            <p className="text-gray-600">Chargement des routes...</p>
          </div>
        )}

        {/* Erreur */}
        {!loading && error && (
          <Card className="p-6 text-center">
            <Icon name="warning" size="2xl" variant="red" className="mb-3" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="primary" onClick={loadRoutes}>
              <Icon name="refresh" size="sm" className="mr-2" />
              Réessayer
            </Button>
          </Card>
        )}

        {/* Liste vide */}
        {!loading && !error && filteredRoutes.length === 0 && (
          <Card className="p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="map" size="2xl" variant="grey" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucune route trouvée
            </h3>
            <p className="text-gray-600 mb-4">
              Commencez par créer une nouvelle route pour vos représentants
            </p>
            <Button variant="primary" onClick={() => setIsModalOpen(true)}>
              <Icon name="plus" size="sm" className="mr-2" />
              Créer une route
            </Button>
          </Card>
        )}

        {/* Liste des routes */}
        {!loading && !error && filteredRoutes.length > 0 && (
          <div className="space-y-3">
            {filteredRoutes.map((route) => (
              <Card key={route.id} className="p-4">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name="map" size="lg" variant="primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          Route de {route.user?.firstName} {route.user?.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">{route.user?.email}</p>
                      </div>
                      <Badge variant={getStatusColor(route.status)} size="sm">
                        {getStatusLabel(route.status)}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Icon name="calendar" size="xs" variant="grey" />
                        {new Date(route.date).toLocaleDateString('fr-FR')}
                      </span>
                      <span className="flex items-center gap-1">
                        <Icon name="map" size="xs" variant="grey" />
                        {route.routeStops?.length || 0} arrêts
                      </span>
                      {route.isOffRoute && (
                        <Badge variant="warning" size="sm">
                          Hors route
                        </Badge>
                      )}
                    </div>

                    {/* Liste des arrêts */}
                    {route.routeStops && route.routeStops.length > 0 && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Points de vente ({route.routeStops.length})
                        </p>
                        <div className="space-y-1">
                          {route.routeStops.slice(0, 3).map((stop, index) => (
                            <div key={stop.id} className="flex items-center gap-2 text-sm">
                              <span className="w-5 h-5 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs font-medium">
                                {index + 1}
                              </span>
                              <span className="text-gray-700">{stop.outlet?.name}</span>
                              {stop.status === 'VISITED' && (
                                <Icon name="checkCircle" size="xs" variant="success" />
                              )}
                            </div>
                          ))}
                          {route.routeStops.length > 3 && (
                            <p className="text-xs text-gray-500 ml-7">
                              +{route.routeStops.length - 3} autres...
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" fullWidth>
                        <Icon name="eye" size="xs" className="mr-1" />
                        Voir détails
                      </Button>
                      {route.status === 'PLANNED' && (
                        <>
                          <Button variant="outline" size="sm" fullWidth>
                            <Icon name="edit" size="xs" className="mr-1" />
                            Modifier
                          </Button>
                          <Button 
                            variant="danger" 
                            size="sm"
                            onClick={() => handleDeleteRoute(route.id)}
                          >
                            <Icon name="trash" size="xs" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modal de planification */}
      <RoutePlanningModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={loadRoutes}
      />
    </div>
  );
}
