/* eslint-disable @typescript-eslint/no-explicit-any */
import { MapPin, Users, Plus } from 'lucide-react';
import {
  PageLayout,
  PageHeader,
  FilterBar,
  DatePicker,
  StatsGrid,
  EmptyState,
  LoadingSpinner,
  Card,
  Button,
  Badge,
} from '@/core/ui';
import { useQuery, useFilters } from '@/core/hooks';
import routesService from '@/features/routes/services';
import usersService from '@/features/users/services';
import { useAuthStore } from '@/core/auth';

export default function RouteManager() {
  const currentUser = useAuthStore((s) => s.user);

  //Hook réutilisable pour les filtres
  const { filters, setFilter } = useFilters({
    status: 'all' as 'all' | 'PLANNED' | 'IN_PROGRESS' | 'DONE',
    date: new Date().toISOString().split('T')[0],
  });

  // Hook réutilisable pour charger les données
  const { data: routesData, loading, refetch } = useQuery(async () => {
    const usersData = await usersService.getAll();
    const filterParams: any = { date: filters.date };
    
    if (filters.status !== 'all') {
      filterParams.status = filters.status;
    }
    
    const routesData = await routesService.getAll(filterParams);
    
    // Filtrer par territoire si nécessaire
    if (currentUser?.territory) {
      return routesData.filter((route) => {
        const user = usersData.find((u: any) => u.id === route.userId);
        return user?.territory === currentUser.territory;
      });
    }
    
    return routesData;
  });

  const routes = routesData || [];

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
        refetch();
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);
        alert('Erreur lors de la suppression de la route');
      }
    }
  };

  // Calcul des stats pour StatsGrid
  const stats = [
    {
      label: 'Total Routes',
      value: routes.length,
      color: 'primary' as const,
      icon: <MapPin className="w-5 h-5" />,
    },
    {
      label: 'En cours',
      value: routes.filter((r) => r.status === 'IN_PROGRESS').length,
      color: 'warning' as const,
      icon: <Users className="w-5 h-5" />,
    },
    {
      label: 'Terminées',
      value: routes.filter((r) => r.status === 'DONE').length,
      color: 'success' as const,
      icon: <MapPin className="w-5 h-5" />,
    },
  ];

  return (
    <PageLayout>
      {/* Composant PageHeader réutilisable */}
      <PageHeader
        title="Gestion des Routes"
        actions={
          <Button variant="primary" size="sm" onClick={handleCreateRoute}>
            <Plus className="w-4 h-4 mr-1" />
            Nouvelle Route
          </Button>
        }
      />

      <div className="p-4 space-y-4">
        {/*Composant DatePicker réutilisable */}
        <DatePicker
          value={filters.date}
          onChange={(e) => setFilter('date', e.target.value)}
          fullWidth
        />

        {/* Composant FilterBar réutilisable */}
        <FilterBar
          tabs={[
            { key: 'all', label: 'Toutes', count: routes.length },
            { key: 'PLANNED', label: 'Planifiées', count: routes.filter(r => r.status === 'PLANNED').length },
            { key: 'IN_PROGRESS', label: 'En cours', count: routes.filter(r => r.status === 'IN_PROGRESS').length },
            { key: 'DONE', label: 'Terminées', count: routes.filter(r => r.status === 'DONE').length },
          ]}
          selected={filters.status}
          onChange={(status) => setFilter('status', status as any)}
        />

        {/*Composant StatsGrid réutilisable */}
        <StatsGrid stats={stats} columns={3} />

        {/*Composant LoadingSpinner réutilisable */}
        {loading ? (
          <LoadingSpinner text="Chargement des routes..." />
        ) : routes.length === 0 ? (
          /*Composant EmptyState réutilisable */
          <EmptyState
            icon={MapPin}
            title="Aucune route trouvée"
            description="Créez une nouvelle route pour commencer"
            action={{
              label: 'Créer une route',
              onClick: handleCreateRoute,
              icon: <Plus className="w-4 h-4" />,
            }}
          />
        ) : (
          <div className="space-y-3">
            {routes.map((route) => {
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
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <Users className="w-3 h-3" />
                            <span>Utilisateur #{route.userId}</span>
                          </div>
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
    </PageLayout>
  );
}
