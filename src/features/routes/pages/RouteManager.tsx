import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Plus, Filter } from 'lucide-react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import routesService, { RoutePlan } from '../../../services/routesService';
import usersService from '../../../services/usersService';
import { useAuthStore } from '../../../core/auth';

export default function RouteManager() {
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'PLANNED' | 'IN_PROGRESS' | 'DONE'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const currentUser = useAuthStore((s) => s.user);

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Charger les utilisateurs (vendeurs)
      const usersData = await usersService.getAll();
      const reps = usersData.filter((u: any) => u.role === 'REP');
      setUsers(reps);

      // Charger les routes avec filtres
      const filters: any = { date: selectedDate };
      if (selectedFilter !== 'all') {
        filters.status = selectedFilter;
      }
      
      const routesData = await routesService.getAll(filters);
      
      // Filtrer par territoire si l'admin a un territoire spécifique
      if (currentUser?.territoryId) {
        const filteredRoutes = routesData.filter((route) => {
          const user = usersData.find((u: any) => u.id === route.userId);
          return user?.territoryId === currentUser.territoryId;
        });
        setRoutes(filteredRoutes);
      } else {
        setRoutes(routesData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
      // En cas d'erreur, utiliser des données mock
      setRoutes([]);
    } finally {
      setLoading(false);
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

  const handleCreateRoute = () => {
    // TODO: Ouvrir un modal pour créer une route
    alert('Fonctionnalité de création de route à implémenter');
  };

  const handleDeleteRoute = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette route ?')) {
      try {
        await routesService.delete(id);
        loadData();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la route');
      }
    }
  };

  const stats = {
    total: routes.length,
    planned: routes.filter(r => r.status === 'PLANNED').length,
    inProgress: routes.filter(r => r.status === 'IN_PROGRESS').length,
    done: routes.filter(r => r.status === 'DONE').length,
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold text-gray-900">Gestion des Routes</h1>
          <Button variant="primary" size="sm" onClick={handleCreateRoute}>
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle Route
          </Button>
        </div>

        {/* Sélecteur de date */}
        <div className="mb-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-lg p-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-sm"
            />
          </div>
        </div>

        {/* Filtres de statut */}
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
        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-gray-600 mt-1">Total Routes</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{stats.inProgress}</div>
              <div className="text-xs text-gray-600 mt-1">En cours</div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{stats.done}</div>
              <div className="text-xs text-gray-600 mt-1">Terminées</div>
            </div>
          </Card>
        </div>

        {/* Liste des routes */}
        {loading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Chargement...</p>
          </div>
        ) : routes.length === 0 ? (
          <Card className="p-8">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune route trouvée
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Créez une nouvelle route pour commencer
              </p>
              <Button variant="primary" onClick={handleCreateRoute}>
                <Plus className="w-4 h-4 mr-1" />
                Créer une route
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-3">
            {routes.map((route) => {
              const user = users.find(u => u.id === route.userId);
              const stopCount = route.routeStops?.length || 0;

              return (
                <Card key={route.id} className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <MapPin className="w-6 h-6 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">
                            Route du {new Date(route.date).toLocaleDateString('fr-FR')}
                          </h4>
                          {user && (
                            <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                              <Users className="w-3 h-3" />
                              <span>{user.firstName} {user.lastName}</span>
                            </div>
                          )}
                        </div>
                        <Badge variant={getStatusColor(route.status)} size="sm">
                          {getStatusLabel(route.status)}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-3 text-xs text-gray-600">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {stopCount} arrêt{stopCount > 1 ? 's' : ''}
                        </span>
                        {route.isOffRoute && (
                          <Badge variant="warning" size="sm">Hors route</Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" fullWidth>
                      Voir détails
                    </Button>
                    {route.status === 'PLANNED' && (
                      <>
                        <Button variant="outline" size="sm" fullWidth>
                          Modifier
                        </Button>
                        <Button 
                          variant="danger" 
                          size="sm" 
                          onClick={() => handleDeleteRoute(route.id)}
                        >
                          Supprimer
                        </Button>
                      </>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
