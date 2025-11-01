import { Plus, CheckCircle, XCircle, Edit, Trash2, Clock, RefreshCw } from 'lucide-react';
import { PageHeader, DataTable, FilterBar } from '../../../core/components/desktop';
import type { Column } from '../../../core/components/desktop/DataTable';
import { Button, Badge, LoadingSpinner } from '@/core/ui';
import { useFilters } from '@/core/hooks';
import type { Outlet } from '../services/outletsService';
import { useOutletsStore } from '@/features/outlets/store/outletsStore';

// Supprimer les mock data - on utilise maintenant l'API réelle

const statusLabels: Record<string, string> = {
  PENDING: 'En attente',
  APPROVED: 'Approuvé',
  REJECTED: 'Rejeté',
  INACTIVE: 'Inactif',
};

const statusColors: Record<string, 'warning' | 'success' | 'danger' | 'gray'> = {
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  INACTIVE: 'gray',
};

export default function PDVManagement() {
  // Utilisation du store Zustand pour les PDV
  const outlets = useOutletsStore((state) => state.outlets);
  const loading = useOutletsStore((state) => state.loading);
  const refreshing = useOutletsStore((state) => state.refreshing);
  const refreshOutlets = useOutletsStore((state) => state.refreshOutlets);

  // ✅ Hook réutilisable pour les filtres
  const { filters, setFilter, resetFilters } = useFilters({
    status: 'all',
    channel: 'all',
    segment: 'all',
  });
  
  // Aliases pour compatibilité avec le code existant
  const channelFilter = filters.channel;
  const segmentFilter = filters.segment;
  const setChannelFilter = (value: string) => setFilter('channel', value);
  const setSegmentFilter = (value: string) => setFilter('segment', value);

  const filteredPDVs = outlets.filter((outlet) => {
    if (filters.status !== 'all' && outlet.status !== filters.status) return false;
    if (filters.channel !== 'all' && outlet.channel !== filters.channel) return false;
    if (filters.segment !== 'all' && outlet.segment !== filters.segment) return false;
    return true;
  });

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleApprove = async (_pdvId: string) => {
    // TODO: Implémenter l'approbation
    alert('Fonction d\'approbation à implémenter');
    // Après l'approbation, rafraîchir les données
    await refreshOutlets();
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleReject = async (_pdvId: string) => {
    // TODO: Implémenter le rejet
    alert('Fonction de rejet à implémenter');
    // Après le rejet, rafraîchir les données
    await refreshOutlets();
  };

  const columns: Column<Outlet>[] = [
    {
      key: 'name',
      label: 'Point de Vente',
      sortable: true,
      render: (outlet) => (
        <div>
          <p className="font-medium text-gray-900">{outlet.name}</p>
          <p className="text-sm text-gray-500">{outlet.address}</p>
        </div>
      ),
    },
    {
      key: 'channel',
      label: 'Canal',
      sortable: true,
      render: (outlet) => (
        <Badge variant="secondary">{outlet.channel}</Badge>
      ),
    },
    {
      key: 'segment',
      label: 'Segment',
      sortable: true,
      render: (outlet) => (
        <span className="font-semibold text-gray-700">{outlet.segment}</span>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (outlet) => (
        <Badge variant={statusColors[outlet.status]}>
          {statusLabels[outlet.status]}
        </Badge>
      ),
    },
    {
      key: 'proposedBy',
      label: 'Proposé par',
      sortable: true,
      render: (outlet) => (
        <span className="text-sm text-gray-600">
          {outlet.proposer ? `${outlet.proposer.firstName} ${outlet.proposer.lastName}` : '-'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (outlet) => (
        <div className="flex items-center gap-2">
          {outlet.status === 'PENDING' && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleApprove(outlet.id);
                }}
                className="p-2 text-success hover:bg-green-50 rounded-lg transition-colors"
                title="Approuver"
              >
                <CheckCircle className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleReject(outlet.id);
                }}
                className="p-2 text-danger hover:bg-red-50 rounded-lg transition-colors"
                title="Rejeter"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert('Fonction de modification à implémenter');
            }}
            className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Supprimer ce PDV ?')) {
                alert('Fonction de suppression à implémenter');
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

  const pendingCount = outlets.filter((o) => o.status === 'PENDING').length;
  const activeFiltersCount = (filters.status !== 'all' ? 1 : 0) + (filters.channel !== 'all' ? 1 : 0) + (filters.segment !== 'all' ? 1 : 0);

  // Affichage du loading uniquement pour le premier chargement
  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement des points de vente..." />;
  }

  return (
    <div>
      <PageHeader
        title="Gestion des Points de Vente"
        description={`${outlets.length} PDV au total • ${pendingCount} en attente de validation`}
        actions={
          <div className="flex items-center gap-2">
            {refreshing && (
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <RefreshCw className="w-4 h-4 animate-spin" />
                Mise à jour...
              </div>
            )}
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4 mr-2" />
              Nouveau PDV
            </Button>
          </div>
        }
      />

      {/* Alertes */}
      {pendingCount > 0 && (
        <div className="mb-6 p-4 bg-warning/10 border border-warning/20 rounded-lg flex items-center gap-3">
          <Clock className="w-5 h-5 text-warning" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {pendingCount} PDV en attente de validation
            </p>
            <p className="text-sm text-gray-600">
              Ces points de vente ont été proposés par les vendeurs et nécessitent votre approbation.
            </p>
          </div>
          <Button
            variant="warning"
            size="sm"
            onClick={() => setFilter('status', 'PENDING')}
          >
            Voir
          </Button>
        </div>
      )}

      <FilterBar
        activeFiltersCount={activeFiltersCount}
        onClear={resetFilters}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les statuts</option>
            <option value="PENDING">En attente</option>
            <option value="APPROVED">Approuvés</option>
            <option value="REJECTED">Rejetés</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Canal
          </label>
          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les canaux</option>
            <option value="Supermarché">Supermarché</option>
            <option value="Boutique">Boutique</option>
            <option value="Kiosque">Kiosque</option>
            <option value="Épicerie">Épicerie</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Segment
          </label>
          <select
            value={segmentFilter}
            onChange={(e) => setSegmentFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les segments</option>
            <option value="A">Segment A</option>
            <option value="B">Segment B</option>
            <option value="C">Segment C</option>
          </select>
        </div>
      </FilterBar>

      <DataTable
        data={filteredPDVs}
        columns={columns}
        searchable
        searchPlaceholder="Rechercher un PDV..."
      />
    </div>
  );
}
