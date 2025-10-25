import { useState } from 'react';
import { UserPlus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { PageHeader, DataTable, FilterBar } from '../../../core/components/desktop';
import type { Column } from '../../../core/components/desktop/DataTable';
import { Button, Badge, LoadingSpinner, Alert, Select } from '@/core/ui';
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

  const columns: Column<User>[] = [
    {
      key: 'name',
      label: 'Utilisateur',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
            {user.firstName[0]}
            {user.lastName[0]}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      label: 'Rôle',
      sortable: true,
      render: (user) => (
        <Badge
          variant={
            user.role === 'ADMIN'
              ? 'danger'
              : user.role === 'SUP'
              ? 'warning'
              : 'primary'
          }
        >
          {roleLabels[user.role]}
        </Badge>
      ),
    },
    {
      key: 'territory',
      label: 'Territoire',
      sortable: true,
      render: (user) => user.territory || '-',
    },
    {
      key: 'isActive',
      label: 'Statut',
      sortable: true,
      render: (user) => (
        <div className="flex items-center gap-2">
          {user.isActive ? (
            <>
              <CheckCircle className="w-4 h-4 text-success" />
              <span className="text-success font-medium">Actif</span>
            </>
          ) : (
            <>
              <XCircle className="w-4 h-4 text-gray-400" />
              <span className="text-gray-500">Inactif</span>
            </>
          )}
        </div>
      ),
    },
    {
      key: 'lastLogin',
      label: 'Dernière connexion',
      sortable: true,
      render: (user) => (
        <span className="text-sm text-gray-600">
          {user.lastLogin || 'Jamais'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (user) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(user);
            }}
            className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleToggleStatus(user.id);
            }}
            className={`p-2 rounded-lg transition-colors ${
              user.isActive
                ? 'text-warning hover:bg-orange-50'
                : 'text-success hover:bg-green-50'
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
            className="p-2 text-danger hover:bg-red-50 rounded-lg transition-colors"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

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

      <DataTable
        data={filteredUsers}
        columns={columns}
        searchable
        searchPlaceholder="Rechercher un utilisateur..."
      />

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
