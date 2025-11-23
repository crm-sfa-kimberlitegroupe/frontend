import { useState, useEffect } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import RoutePlanningModal from '../components/RoutePlanningModal';
import routesService, { type RoutePlan, type RouteMetrics } from '../services/routesService';
import Modal from '../../../core/ui/feedback/Modal';
import usersService, { type User } from '../../users/services/usersService';
export default function RouteADMIN() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMultiDayModalOpen, setIsMultiDayModalOpen] = useState(false);
  const [routes, setRoutes] = useState<RoutePlan[]>([]);
  const [routeMetrics, setRouteMetrics] = useState<Map<string, RouteMetrics>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'PLANNED' | 'IN_PROGRESS' | 'DONE'>('all');
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  
  // Multi-day modal state
  const [reps, setReps] = useState<User[]>([]);
  const [selectedRep, setSelectedRep] = useState<string>('');
  const [startDate, setStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [numberOfDays, setNumberOfDays] = useState<number>(5);
  const [outletsPerDay, setOutletsPerDay] = useState<number>(8);
  const [multiDayLoading, setMultiDayLoading] = useState(false);

  useEffect(() => {
    loadRoutes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, selectedFilter]);

  useEffect(() => {
    if (isMultiDayModalOpen) {
      loadReps();
    }
  }, [isMultiDayModalOpen]);

  const loadRoutes = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: { date?: string; status?: string } = {};
      
      if (selectedDate) {
        filters.date = selectedDate;
      }
      
      if (selectedFilter !== 'all') {
        filters.status = selectedFilter;
      }

      const data = await routesService.getAll(filters);
      console.log('Routes chargées:', data);
      console.log('Nombre de routes:', data?.length || 0);
      
      // Vérifier que data est un tableau
      if (!data || !Array.isArray(data)) {
        console.error('Les données reçues ne sont pas un tableau:', data);
        setRoutes([]);
        return;
      }
      
      setRoutes(data);
      
      // Charger les métriques pour chaque route
      const metricsMap = new Map<string, RouteMetrics>();
      for (const route of data) {
        try {
          const metrics = await routesService.getRouteMetrics(route.id);
          metricsMap.set(route.id, metrics);
        } catch (err) {
          console.error(`Erreur chargement métriques route ${route.id}:`, err);
        }
      }
      setRouteMetrics(metricsMap);
    } catch (err) {
      console.error('Erreur chargement routes:', err);
      setError('Impossible de charger les routes');
    } finally {
      setLoading(false);
    }
  };

  const loadReps = async () => {
    try {
      const allUsers = await usersService.getAll();
      const repUsers = allUsers.filter(u => u.role === 'REP' && u.status === 'ACTIVE');
      setReps(repUsers);
    } catch (err) {
      console.error('Erreur chargement REPs:', err);
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

  const handleOptimizeRoute = async (routeId: string) => {
    if (!confirm('Voulez-vous optimiser cette route ? L\'ordre des arrêts sera recalculé pour minimiser la distance.')) {
      return;
    }

    try {
      setLoading(true);
      await routesService.optimizeRoute(routeId);
      await loadRoutes();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Erreur optimisation route:', err);
      alert(err?.response?.data?.message || 'Erreur lors de l\'optimisation de la route');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMultiDay = async () => {
    if (!selectedRep) {
      alert('Veuillez sélectionner un représentant');
      return;
    }

    try {
      setMultiDayLoading(true);
      
      // Récupérer les informations du vendeur sélectionné pour obtenir son secteur
      const selectedRepData = reps.find(rep => rep.id === selectedRep);
      const rawSectorId = selectedRepData?.assignedSectorId || selectedRepData?.territoryId;
      const sectorId = rawSectorId || undefined; // Convertir null en undefined
      
      console.log('🔍 Génération multiroute pour:', {
        userId: selectedRep,
        sectorId,
        repData: selectedRepData
      });
      
      // Vérifier si le vendeur a un secteur assigné
      if (!sectorId) {
        alert(`⚠️ Attention: Le vendeur ${selectedRepData?.firstName} ${selectedRepData?.lastName} n'a pas de secteur assigné. Les routes seront créées sans contrainte géographique.`);
      }
      
      await routesService.generateMultiDayRoutes({
        userId: selectedRep,
        startDate,
        numberOfDays,
        outletsPerDay,
        optimize: true,
        sectorId, // Ajouter l'ID du secteur (peut être undefined)
      });
      
      setIsMultiDayModalOpen(false);
      await loadRoutes();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error('Erreur génération multi-jours:', err);
      alert(err?.response?.data?.message || 'Erreur lors de la génération des routes');
    } finally {
      setMultiDayLoading(false);
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
          <div className="flex gap-2">
            <Button variant="primary" size="sm" onClick={() => setIsModalOpen(true)}>
              <Icon name="plus" size="sm" className="mr-2" />
              Nouvelle route
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setIsMultiDayModalOpen(true)}>
              <Icon name="calendar" size="sm" className="mr-2" />
              Multi-jours
            </Button>
          </div>
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
              onClick={() => setSelectedFilter(filter.key as typeof selectedFilter)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                selectedFilter === filter.key
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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

                    {/* Métriques */}
                    {routeMetrics.get(route.id) && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-blue-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-blue-600">Distance</p>
                          <p className="text-sm font-bold text-blue-900">
                            {routeMetrics.get(route.id)!.totalDistance.toFixed(1)} km
                          </p>
                        </div>
                        <div className="bg-green-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-green-600">Temps</p>
                          <p className="text-sm font-bold text-green-900">
                            {Math.floor(routeMetrics.get(route.id)!.estimatedTime / 60)}h
                            {routeMetrics.get(route.id)!.estimatedTime % 60}m
                          </p>
                        </div>
                        <div className="bg-purple-50 rounded-lg p-2 text-center">
                          <p className="text-xs text-purple-600">Visités</p>
                          <p className="text-sm font-bold text-purple-900">
                            {routeMetrics.get(route.id)!.numberOfVisited || 0}/{routeMetrics.get(route.id)!.numberOfOutlets}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Liste des arrêts */}
                    {route.routeStops && route.routeStops.length > 0 ? (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-xs font-semibold text-gray-700 mb-2">
                          Points de vente ({route.routeStops.length})
                        </p>
                        <div className="space-y-1 max-h-48 overflow-y-auto">
                          {route.routeStops.map((stop, index) => (
                            <div key={stop.id} className="flex items-center gap-2 text-sm">
                              <span className="w-6 h-6 rounded-full bg-white border border-gray-300 flex items-center justify-center text-xs font-medium flex-shrink-0">
                                {index + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <p className="text-gray-900 font-medium truncate">{stop.outlet?.name || 'PDV sans nom'}</p>
                                {stop.outlet?.address && (
                                  <p className="text-xs text-gray-500 truncate">{stop.outlet.address}</p>
                                )}
                              </div>
                              {stop.status === 'VISITED' && (
                                <Icon name="checkCircle" size="xs" variant="green" className="flex-shrink-0" />
                              )}
                              {stop.status === 'SKIPPED' && (
                                <Icon name="x" size="xs" variant="red" className="flex-shrink-0" />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <Icon name="warning" size="sm" variant="yellow" />
                          <p className="text-sm text-yellow-800">
                            Aucun point de vente dans cette route
                          </p>
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
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            fullWidth
                            onClick={() => handleOptimizeRoute(route.id)}
                          >
                            <Icon name="refresh" size="xs" className="mr-1" />
                            Optimiser
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

      {/* Modal planification multi-jours */}
      <Modal
        isOpen={isMultiDayModalOpen}
        onClose={() => setIsMultiDayModalOpen(false)}
        title="Planification Multi-Jours"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Icon name="warning" size="sm" variant="primary" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Génération automatique</p>
                <p>
                  Créez plusieurs routes optimisées automatiquement pour un vendeur sur plusieurs jours.
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Représentant
            </label>
            <select
              value={selectedRep}
              onChange={(e) => setSelectedRep(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            >
              <option value="">Sélectionner un REP...</option>
              {reps.map(rep => (
                <option key={rep.id} value={rep.id}>
                  {rep.firstName} {rep.lastName} - {rep.email}
                  {(rep.assignedSectorId || rep.territoryId) && ` (Secteur: ${rep.assignedSectorId || rep.territoryId})`}
                </option>
              ))}
            </select>
          </div>

          {/* Informations du vendeur sélectionné */}
          {selectedRep && (() => {
            const selectedRepData = reps.find(rep => rep.id === selectedRep);
            const rawSectorId = selectedRepData?.assignedSectorId || selectedRepData?.territoryId;
            const sectorId = rawSectorId || undefined;
            
            return (
              <div className={`border rounded-lg p-3 ${sectorId ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'}`}>
                <div className="flex items-start gap-2">
                  <Icon name={sectorId ? "checkCircle" : "warning"} size="sm" variant={sectorId ? "green" : "yellow"} />
                  <div className={`text-sm ${sectorId ? 'text-green-800' : 'text-yellow-800'}`}>
                    <p className="font-medium mb-1">Vendeur sélectionné</p>
                    <p><strong>Nom :</strong> {selectedRepData?.firstName} {selectedRepData?.lastName}</p>
                    <p><strong>Email :</strong> {selectedRepData?.email}</p>
                    <p><strong>Secteur ID :</strong> {sectorId || 'Non assigné'}</p>
                    {!sectorId && (
                      <p className="text-red-600 mt-1">⚠️ Attention : Ce vendeur n'a pas de secteur assigné</p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Date de début
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre de jours: {numberOfDays}
            </label>
            <input
              type="range"
              min="1"
              max="14"
              value={numberOfDays}
              onChange={(e) => setNumberOfDays(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>1 jour</span>
              <span>14 jours</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Points de vente par jour: {outletsPerDay}
            </label>
            <input
              type="range"
              min="3"
              max="15"
              value={outletsPerDay}
              onChange={(e) => setOutletsPerDay(Number(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>3 PDV</span>
              <span>15 PDV</span>
            </div>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-2">Résumé</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Période:</span>
                <span className="font-medium">
                  {new Date(startDate).toLocaleDateString('fr-FR')} - 
                  {new Date(new Date(startDate).getTime() + (numberOfDays - 1) * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Routes à créer:</span>
                <span className="font-medium">{numberOfDays}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total PDV:</span>
                <span className="font-medium">{numberOfDays * outletsPerDay}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              variant="outline" 
              onClick={() => setIsMultiDayModalOpen(false)} 
              fullWidth
              disabled={multiDayLoading}
            >
              Annuler
            </Button>
            <Button 
              variant="success" 
              onClick={handleGenerateMultiDay} 
              fullWidth
              disabled={!selectedRep || multiDayLoading}
            >
              {multiDayLoading ? (
                <>
                  <Icon name="refresh" size="sm" className="mr-2 animate-spin" />
                  Génération...
                </>
              ) : (
                <>
                  <Icon name="check" size="sm" className="mr-2" />
                  Générer les routes
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
