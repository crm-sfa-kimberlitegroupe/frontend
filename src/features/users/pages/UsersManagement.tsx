import { useState, useEffect } from 'react';
import { UserPlus, Edit, Trash2, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PageHeader, DataTable, FilterBar } from '../../../core/components/desktop';
import type { Column } from '../../../core/components/desktop/DataTable';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { usersService, type User, type CreateUserDto, type UpdateUserDto } from '../../../services/usersService';
import UserModal from '../../../core/components/modals/UserModal';

const roleLabels = {
  REP: 'Vendeur',
  ADMIN: 'Administrateur',
  SUP: 'Manager',
};

export default function UsersManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Charger les utilisateurs au montage
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await usersService.getAll();
      // Filtrer pour afficher seulement les vendeurs (REP)
      const repsOnly = data.filter(user => user.role === 'REP');
      setUsers(repsOnly);
    } catch (err) {
      console.error('Error loading users:', err);
      setError('Erreur lors du chargement des utilisateurs');
      // Utiliser des données mockées en cas d'erreur
      setUsers([
        {
          id: '1',
          firstName: 'Jean',
          lastName: 'Kouassi',
          email: 'jean.kouassi@example.com',
          role: 'REP',
          territory: 'Abidjan Plateau',
          isActive: true,
          lastLogin: '2025-10-07 09:30',
        },
        {
          id: '2',
          firstName: 'Marie',
          lastName: 'Diallo',
          email: 'marie.diallo@example.com',
          role: 'REP',
          territory: 'Cocody',
          isActive: true,
          lastLogin: '2025-10-07 08:15',
        },
        {
          id: '3',
          firstName: 'Paul',
          lastName: 'Bamba',
          email: 'paul.bamba@example.com',
          role: 'SUP',
          territory: 'Abidjan',
          isActive: true,
          lastLogin: '2025-10-06 17:45',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }

    try {
      await usersService.delete(userId);
      setUsers(users.filter((u) => u.id !== userId));
    } catch (err) {
      console.error('Error deleting user:', err);
      alert('Erreur lors de la suppression');
    }
  };

  const handleToggleStatus = async (userId: string) => {
    try {
      const updatedUser = await usersService.toggleStatus(userId);
      setUsers(users.map((u) => (u.id === userId ? updatedUser : u)));
    } catch (err) {
      console.error('Error toggling status:', err);
      alert('Erreur lors de la modification du statut');
    }
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

  // Soumettre le formulaire (création ou édition)
  const handleSubmitUser = async (data: CreateUserDto | UpdateUserDto) => {
    try {
      if (modalMode === 'create') {
        const newUser = await usersService.create(data as CreateUserDto);
        setUsers([...users, newUser]);
      } else if (selectedUser) {
        const updatedUser = await usersService.update(selectedUser.id, data as UpdateUserDto);
        setUsers(users.map((u) => (u.id === selectedUser.id ? updatedUser : u)));
      }
      setIsModalOpen(false);
    } catch (err: any) {
      console.error('Error submitting user:', err);
      throw err; // Laisser le modal gérer l'erreur
    }
  };

  const filteredUsers = users.filter((user) => {
    if (roleFilter !== 'all' && user.role !== roleFilter) return false;
    if (statusFilter === 'active' && !user.isActive) return false;
    if (statusFilter === 'inactive' && user.isActive) return false;
    return true;
  });

  const activeFiltersCount =
    (roleFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0);

  const handleClearFilters = () => {
    setRoleFilter('all');
    setStatusFilter('all');
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

  // Afficher le loader pendant le chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
          <p className="text-gray-600">Chargement des utilisateurs...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800">{error}</p>
          <button
            onClick={loadUsers}
            className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
          >
            Réessayer
          </button>
        </div>
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
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Statut
          </label>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous</option>
            <option value="active">Actifs</option>
            <option value="inactive">Inactifs</option>
          </select>
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
