import { useState } from 'react';
import { UserPlus, Edit, Trash2, CheckCircle, XCircle, MapPin, Phone, Mail } from 'lucide-react';
import { PageHeader, FilterBar, DashboardGrid, StatCard } from '../../../core/components/desktop';
import { Button, Badge, LoadingSpinner, Alert, Select, Card, Modal } from '@/core/ui';
import { useQuery, useMutation, useFilters, useToggle } from '@/core/hooks';
import { usersService, type User, type CreateUserDto, type UpdateUserDto } from '@/features/users/services';
import UserModal from '../../../core/components/modals/UserModal';

const roleLabels = {
  REP: 'Vendeur',
  ADMIN: 'Administrateur',
  SUP: 'Manager',
};

export default function UsersManagement() {
  // ✅ Hook réutilisable pour charger les données
  const { data: users = [], loading, error, refetch } = useQuery(async () => {
    const data = await usersService.getAll();
    // Filtrer pour afficher seulement les vendeurs (REP)
    return data.filter(user => user.role === 'REP');
  });

  // ✅ Hook réutilisable pour les filtres
  const { filters, setFilter } = useFilters({
    role: 'all',
    status: 'all',
  });
  
  // ✅ Hook réutilisable pour le modal
  const [isModalOpen, , setIsModalOpen] = useToggle(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // ✅ Hook réutilisable pour les mutations
  const deleteMutation = useMutation(
    (userId: string) => usersService.delete(userId),
    {
      onSuccess: () => refetch(),
      onError: () => alert('Erreur lors de la suppression'),
    }
  );

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    deleteMutation.mutate(userId);
  };

  const toggleStatusMutation = useMutation(
    (userId: string) => usersService.toggleStatus(userId),
    {
      onSuccess: () => refetch(),
      onError: () => alert('Erreur lors de la modification du statut'),
    }
  );

  const handleToggleStatus = (userId: string) => {
    toggleStatusMutation.mutate(userId);
  };

  // Ouvrir le modal pour créer un utilisateur
  const handleOpenCreateModal = () => {
    setModalMode('create');
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  // Ouvrir le modal pour éditer un utilisateur
  const handleOpenEditModal = (user: User) => {
    setModalMode('edit');
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const submitMutation = useMutation(
    async (data: CreateUserDto | UpdateUserDto) => {
      if (modalMode === 'create') {
        return await usersService.create(data as CreateUserDto);
      } else if (selectedUser) {
        return await usersService.update(selectedUser.id, data as UpdateUserDto);
      }
    },
    {
      onSuccess: () => {
        refetch();
        setIsModalOpen(false);
      },
    }
  );

  const handleSubmitUser = async (data: CreateUserDto | UpdateUserDto): Promise<void> => {
    await submitMutation.mutateAsync(data);
  };

  const filteredUsers = (users || []).filter((user) => {
    if (filters.role !== 'all' && user.role !== filters.role) return false;
    if (filters.status === 'active' && !user.isActive) return false;
    if (filters.status === 'inactive' && user.isActive) return false;
    return true;
  });

  const activeFiltersCount =
    (filters.role !== 'all' ? 1 : 0) + (filters.status !== 'all' ? 1 : 0);

  const handleClearFilters = () => {
    setFilter('role', 'all');
    setFilter('status', 'all');
  };

  // Stats KPIs
  const activeVendors = (users || []).filter(u => u.isActive).length;
  const totalVendors = (users || []).length;

  // Générer des données mockées stables pour chaque utilisateur
  const getMockData = (userId: string) => {
    // Utiliser l'ID pour générer des valeurs cohérentes
    const seed = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const pdv = 25 + (seed % 30);
    const routes = 2 + (seed % 3);
    const coverage = 65 + (seed % 30);
    const strikeRate = 60 + (seed % 25);
    
    return { pdv, routes, coverage, strikeRate };
  };

  // ✅ Composant LoadingSpinner réutilisable
  if (loading) {
    return <LoadingSpinner size="lg" text="Chargement des utilisateurs..." />;
  }

  return (
    <div>
      {/* ✅ Composant Alert réutilisable */}
      {error && (
        <Alert
          variant="error"
          title="Erreur"
          message={error.message || 'Erreur lors du chargement des utilisateurs'}
        >
          <button
            onClick={refetch}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </Alert>
      )}

      <PageHeader
        title="Gestion des Vendeurs"
        description="Gérer les vendeurs (REP) de votre équipe"
        actions={
          <Button variant="primary" size="md" onClick={handleOpenCreateModal}>
            <UserPlus className="w-4 h-4 mr-2" />
            Nouveau Vendeur
          </Button>
        }
      />

      {/* KPIs */}
      <DashboardGrid columns={3} gap="md">
        <StatCard
          title="Vendeurs Actifs"
          value={activeVendors}
          icon={CheckCircle}
          color="success"
          subtitle={`sur ${totalVendors} total`}
        />
        <StatCard
          title="Vendeurs Inactifs"
          value={totalVendors - activeVendors}
          icon={XCircle}
          color="secondary"
          subtitle="suspendus"
        />
        <StatCard
          title="Total Vendeurs"
          value={totalVendors}
          icon={UserPlus}
          color="primary"
          subtitle="dans l'équipe"
        />
      </DashboardGrid>

      <FilterBar
        activeFiltersCount={activeFiltersCount}
        onClear={handleClearFilters}
      >
        <div>
          {/* ✅ Composant Select réutilisable */}
          <Select
            label="Statut"
            value={filters.status}
            onChange={(e) => setFilter('status', e.target.value)}
            options={[
              { value: 'all', label: 'Tous' },
              { value: 'active', label: 'Actifs' },
              { value: 'inactive', label: 'Inactifs' },
            ]}
            fullWidth
          />
        </div>
      </FilterBar>

      {/* Grid de Cards */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Vendeurs ({filteredUsers.length})
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredUsers.map((user) => (
            <Card
              key={user.id}
              onClick={() => setSelectedUser(user)}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                    {user.firstName[0]}{user.lastName[0]}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {user.firstName} {user.lastName}
                    </h3>
                    <p className="text-sm text-gray-500">{roleLabels[user.role]}</p>
                  </div>
                </div>
                <Badge
                  variant={user.isActive ? 'success' : 'gray'}
                  size="sm"
                >
                  {user.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{user.territory || 'Non assigné'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{user.phone || 'Non renseigné'}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{user.email}</span>
                </div>
              </div>

              {/* Stats - Mêmes que TeamPage */}
              {(() => {
                const mockData = getMockData(user.id);
                const coverage = user.isActive ? mockData.coverage : 0;
                return (
                  <>
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-500">PDV</p>
                        <p className="text-lg font-bold text-gray-900">
                          {mockData.pdv}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Routes</p>
                        <p className="text-lg font-bold text-gray-900">
                          {mockData.routes}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Couverture</p>
                        <p
                          className={`text-lg font-bold ${
                            coverage >= 90
                              ? 'text-success'
                              : coverage >= 70
                              ? 'text-warning'
                              : 'text-gray-400'
                          }`}
                        >
                          {coverage}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Strike Rate</p>
                        <p className="text-lg font-bold text-primary">
                          {user.isActive ? mockData.strikeRate : 0}%
                        </p>
                      </div>
                    </div>

                    {/* Performance Bar */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                        <span>Performance</span>
                        <span className="font-medium">{coverage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            coverage >= 90
                              ? 'bg-success'
                              : coverage >= 70
                              ? 'bg-warning'
                              : 'bg-danger'
                          }`}
                          style={{ width: `${coverage}%` }}
                        />
                      </div>
                    </div>
                  </>
                );
              })()}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-gray-200">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditModal(user);
                  }}
                  className="flex-1 px-3 py-2 text-sm font-medium text-primary bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center justify-center gap-2"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4" />
                  Modifier
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleStatus(user.id);
                  }}
                  className={`px-3 py-2 rounded-lg transition-colors ${
                    user.isActive
                      ? 'text-warning bg-orange-50 hover:bg-orange-100'
                      : 'text-success bg-green-50 hover:bg-green-100'
                  }`}
                  title={user.isActive ? 'Suspendre' : 'Activer'}
                >
                  {user.isActive ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(user.id);
                  }}
                  className="px-3 py-2 text-danger bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">Aucun vendeur trouvé</p>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {selectedUser && (
        <Modal
          isOpen={!!selectedUser}
          onClose={() => setSelectedUser(null)}
          title={`${selectedUser.firstName} ${selectedUser.lastName}`}
          size="lg"
        >
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                {selectedUser.firstName[0]}{selectedUser.lastName[0]}
              </div>
              <div>
                <p className="text-gray-600">{roleLabels[selectedUser.role]}</p>
                <Badge variant={selectedUser.isActive ? 'success' : 'gray'} size="sm" className="mt-1">
                  {selectedUser.isActive ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Informations</h3>
                <div className="space-y-2 text-sm">
                  {selectedUser.territory && (
                    <p>
                      <span className="text-gray-600">Territoire:</span>{' '}
                      <span className="font-medium">{selectedUser.territory}</span>
                    </p>
                  )}
                  {selectedUser.phone && (
                    <p>
                      <span className="text-gray-600">Téléphone:</span>{' '}
                      <span className="font-medium">{selectedUser.phone}</span>
                    </p>
                  )}
                  <p>
                    <span className="text-gray-600">Email:</span>{' '}
                    <span className="font-medium">{selectedUser.email}</span>
                  </p>
                  {selectedUser.hireDate && (
                    <p>
                      <span className="text-gray-600">Date d'embauche:</span>{' '}
                      <span className="font-medium">{selectedUser.hireDate}</span>
                    </p>
                  )}
                  {selectedUser.lastLogin && (
                    <p>
                      <span className="text-gray-600">Dernière connexion:</span>{' '}
                      <span className="font-medium">{selectedUser.lastLogin}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-4 border-t flex gap-2">
                <Button
                  variant="primary"
                  onClick={() => {
                    setSelectedUser(null);
                    handleOpenEditModal(selectedUser);
                  }}
                  fullWidth
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setSelectedUser(null)}
                  fullWidth
                >
                  Fermer
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal de création/édition */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitUser}
        user={selectedUser}
        mode={modalMode}
      />
    </div>
  );
}
