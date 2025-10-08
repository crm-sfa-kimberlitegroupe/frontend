import { useState } from 'react';
import { Map, Plus, Calendar, Users, MapPin, Edit, Trash2, Copy } from 'lucide-react';
import { PageHeader, DataTable, FilterBar, DashboardGrid, StatCard } from '../../components/desktop';
import type { Column } from '../../components/desktop/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

interface Route {
  id: string;
  name: string;
  territory: string;
  assignedTo: string;
  pdvCount: number;
  frequency: 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY';
  day?: string;
  isActive: boolean;
  lastVisit?: string;
  completionRate: number;
}

// Mock data
const mockRoutes: Route[] = [
  {
    id: '1',
    name: 'Route Plateau Nord',
    territory: 'Plateau',
    assignedTo: 'Jean Kouassi',
    pdvCount: 12,
    frequency: 'WEEKLY',
    day: 'Lundi',
    isActive: true,
    lastVisit: '2025-10-07',
    completionRate: 92,
  },
  {
    id: '2',
    name: 'Route Cocody Centre',
    territory: 'Cocody',
    assignedTo: 'Marie Diallo',
    pdvCount: 15,
    frequency: 'WEEKLY',
    day: 'Mardi',
    isActive: true,
    lastVisit: '2025-10-06',
    completionRate: 87,
  },
  {
    id: '3',
    name: 'Route Adjamé Marché',
    territory: 'Adjamé',
    assignedTo: 'Paul Bamba',
    pdvCount: 20,
    frequency: 'BIWEEKLY',
    day: 'Mercredi',
    isActive: true,
    lastVisit: '2025-10-01',
    completionRate: 95,
  },
  {
    id: '4',
    name: 'Route Yopougon Ouest',
    territory: 'Yopougon',
    assignedTo: 'Aïcha Traoré',
    pdvCount: 10,
    frequency: 'WEEKLY',
    day: 'Jeudi',
    isActive: false,
    lastVisit: '2025-09-28',
    completionRate: 65,
  },
];

const frequencyLabels = {
  DAILY: 'Quotidien',
  WEEKLY: 'Hebdomadaire',
  BIWEEKLY: 'Bi-hebdomadaire',
  MONTHLY: 'Mensuel',
};

export default function RoutesManagement() {
  const [routes] = useState<Route[]>(mockRoutes);
  const [territoryFilter, setTerritoryFilter] = useState<string>('all');
  const [frequencyFilter, setFrequencyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredRoutes = routes.filter((route) => {
    if (territoryFilter !== 'all' && route.territory !== territoryFilter) return false;
    if (frequencyFilter !== 'all' && route.frequency !== frequencyFilter) return false;
    if (statusFilter === 'active' && !route.isActive) return false;
    if (statusFilter === 'inactive' && route.isActive) return false;
    return true;
  });

  const activeFiltersCount =
    (territoryFilter !== 'all' ? 1 : 0) +
    (frequencyFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0);

  const handleClearFilters = () => {
    setTerritoryFilter('all');
    setFrequencyFilter('all');
    setStatusFilter('all');
  };

  const columns: Column<Route>[] = [
    {
      key: 'name',
      label: 'Route',
      sortable: true,
      render: (route) => (
        <div>
          <p className="font-medium text-gray-900">{route.name}</p>
          <p className="text-sm text-gray-500">{route.territory}</p>
        </div>
      ),
    },
    {
      key: 'assignedTo',
      label: 'Vendeur',
      sortable: true,
      render: (route) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
            {route.assignedTo.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-sm text-gray-900">{route.assignedTo}</span>
        </div>
      ),
    },
    {
      key: 'pdvCount',
      label: 'PDV',
      sortable: true,
      render: (route) => (
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-gray-400" />
          <span className="font-semibold text-gray-900">{route.pdvCount}</span>
        </div>
      ),
    },
    {
      key: 'frequency',
      label: 'Fréquence',
      sortable: true,
      render: (route) => (
        <div>
          <Badge variant="secondary">{frequencyLabels[route.frequency]}</Badge>
          {route.day && (
            <p className="text-xs text-gray-500 mt-1">{route.day}</p>
          )}
        </div>
      ),
    },
    {
      key: 'completionRate',
      label: 'Taux de complétion',
      sortable: true,
      render: (route) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[100px]">
            <div
              className={`h-2 rounded-full ${
                route.completionRate >= 90
                  ? 'bg-success'
                  : route.completionRate >= 70
                  ? 'bg-warning'
                  : 'bg-danger'
              }`}
              style={{ width: `${route.completionRate}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-700">
            {route.completionRate}%
          </span>
        </div>
      ),
    },
    {
      key: 'isActive',
      label: 'Statut',
      sortable: true,
      render: (route) => (
        <Badge variant={route.isActive ? 'success' : 'danger'}>
          {route.isActive ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (route) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit route:', route.id);
            }}
            className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Duplicate route:', route.id);
            }}
            className="p-2 text-secondary hover:bg-purple-50 rounded-lg transition-colors"
            title="Dupliquer"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Supprimer cette route ?')) {
                console.log('Delete route:', route.id);
              }
            }}
            className="p-2 text-danger hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  const totalPDV = routes.reduce((sum, route) => sum + route.pdvCount, 0);
  const activeRoutes = routes.filter((r) => r.isActive).length;
  const avgCompletionRate = Math.round(
    routes.reduce((sum, route) => sum + route.completionRate, 0) / routes.length
  );

  return (
    <div>
      <PageHeader
        title="Gestion des Routes"
        description="Planifier et optimiser les itinéraires de visite"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Route
          </Button>
        }
      />

      {/* KPIs */}
      <DashboardGrid columns={4} gap="md">
        <StatCard
          title="Routes Actives"
          value={activeRoutes}
          icon={Map}
          color="success"
          subtitle={`sur ${routes.length} total`}
        />
        <StatCard
          title="PDV Couverts"
          value={totalPDV}
          icon={MapPin}
          color="primary"
        />
        <StatCard
          title="Taux Moyen"
          value={`${avgCompletionRate}%`}
          icon={Calendar}
          color="warning"
          subtitle="de complétion"
        />
        <StatCard
          title="Vendeurs"
          value={new Set(routes.map((r) => r.assignedTo)).size}
          icon={Users}
          color="secondary"
          subtitle="assignés"
        />
      </DashboardGrid>

      <div className="mt-6">
        <FilterBar
          activeFiltersCount={activeFiltersCount}
          onClear={handleClearFilters}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Territoire
            </label>
            <select
              value={territoryFilter}
              onChange={(e) => setTerritoryFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tous les territoires</option>
              <option value="Plateau">Plateau</option>
              <option value="Cocody">Cocody</option>
              <option value="Adjamé">Adjamé</option>
              <option value="Yopougon">Yopougon</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fréquence
            </label>
            <select
              value={frequencyFilter}
              onChange={(e) => setFrequencyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Toutes les fréquences</option>
              <option value="DAILY">Quotidien</option>
              <option value="WEEKLY">Hebdomadaire</option>
              <option value="BIWEEKLY">Bi-hebdomadaire</option>
              <option value="MONTHLY">Mensuel</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tous</option>
              <option value="active">Actives</option>
              <option value="inactive">Inactives</option>
            </select>
          </div>
        </FilterBar>

        <DataTable
          data={filteredRoutes}
          columns={columns}
          searchable
          searchPlaceholder="Rechercher une route..."
          onRowClick={(route) => console.log('View route details:', route)}
        />
      </div>
    </div>
  );
}
