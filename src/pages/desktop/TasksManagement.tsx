import { useState } from 'react';
import { ClipboardList, Plus, Edit, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { PageHeader, DataTable, FilterBar, DashboardGrid, StatCard } from '../../components/desktop';
import type { Column } from '../../components/desktop/DataTable';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

interface Task {
  id: string;
  title: string;
  description: string;
  type: 'SURVEY' | 'MERCHANDISING' | 'STOCK_CHECK' | 'PHOTO' | 'OTHER';
  assignedTo: string;
  dueDate: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  completionRate?: number;
  createdAt: string;
}

// Mock data
const mockTasks: Task[] = [
  {
    id: '1',
    title: 'Contrôle Merchandising Plateau',
    description: 'Vérifier la disposition des produits et la PLV',
    type: 'MERCHANDISING',
    assignedTo: 'Jean Kouassi',
    dueDate: '2025-10-10',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    completionRate: 60,
    createdAt: '2025-10-05',
  },
  {
    id: '2',
    title: 'Enquête Satisfaction Clients',
    description: 'Questionnaire de 10 questions',
    type: 'SURVEY',
    assignedTo: 'Marie Diallo',
    dueDate: '2025-10-12',
    status: 'PENDING',
    priority: 'MEDIUM',
    createdAt: '2025-10-06',
  },
  {
    id: '3',
    title: 'Inventaire Stock Cocody',
    description: 'Comptage physique des produits',
    type: 'STOCK_CHECK',
    assignedTo: 'Paul Bamba',
    dueDate: '2025-10-08',
    status: 'COMPLETED',
    priority: 'HIGH',
    completionRate: 100,
    createdAt: '2025-10-01',
  },
  {
    id: '4',
    title: 'Photos Nouveaux PDV',
    description: 'Prendre photos façade et intérieur',
    type: 'PHOTO',
    assignedTo: 'Aïcha Traoré',
    dueDate: '2025-10-05',
    status: 'OVERDUE',
    priority: 'LOW',
    createdAt: '2025-09-28',
  },
];

const typeLabels = {
  SURVEY: 'Enquête',
  MERCHANDISING: 'Merchandising',
  STOCK_CHECK: 'Inventaire',
  PHOTO: 'Photos',
  OTHER: 'Autre',
};

const statusLabels = {
  PENDING: 'En attente',
  IN_PROGRESS: 'En cours',
  COMPLETED: 'Terminée',
  OVERDUE: 'En retard',
};

const statusColors = {
  PENDING: 'warning',
  IN_PROGRESS: 'primary',
  COMPLETED: 'success',
  OVERDUE: 'danger',
} as const;

const priorityColors = {
  LOW: 'secondary',
  MEDIUM: 'warning',
  HIGH: 'danger',
} as const;

export default function TasksManagement() {
  const [tasks] = useState<Task[]>(mockTasks);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTasks = tasks.filter((task) => {
    if (typeFilter !== 'all' && task.type !== typeFilter) return false;
    if (statusFilter !== 'all' && task.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;
    return true;
  });

  const activeFiltersCount =
    (typeFilter !== 'all' ? 1 : 0) +
    (statusFilter !== 'all' ? 1 : 0) +
    (priorityFilter !== 'all' ? 1 : 0);

  const handleClearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
  };

  const columns: Column<Task>[] = [
    {
      key: 'title',
      label: 'Tâche',
      sortable: true,
      render: (task) => (
        <div>
          <p className="font-medium text-gray-900">{task.title}</p>
          <p className="text-sm text-gray-500">{task.description}</p>
        </div>
      ),
    },
    {
      key: 'type',
      label: 'Type',
      sortable: true,
      render: (task) => (
        <Badge variant="secondary">{typeLabels[task.type]}</Badge>
      ),
    },
    {
      key: 'assignedTo',
      label: 'Assigné à',
      sortable: true,
      render: (task) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
            {task.assignedTo.split(' ').map(n => n[0]).join('')}
          </div>
          <span className="text-sm text-gray-900">{task.assignedTo}</span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      label: 'Échéance',
      sortable: true,
      render: (task) => {
        const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'COMPLETED';
        return (
          <div className={isOverdue ? 'text-danger font-medium' : 'text-gray-700'}>
            {new Date(task.dueDate).toLocaleDateString('fr-FR')}
          </div>
        );
      },
    },
    {
      key: 'priority',
      label: 'Priorité',
      sortable: true,
      render: (task) => (
        <Badge variant={priorityColors[task.priority]}>
          {task.priority === 'HIGH' ? 'Haute' : task.priority === 'MEDIUM' ? 'Moyenne' : 'Basse'}
        </Badge>
      ),
    },
    {
      key: 'status',
      label: 'Statut',
      sortable: true,
      render: (task) => (
        <div>
          <Badge variant={statusColors[task.status]}>
            {statusLabels[task.status]}
          </Badge>
          {task.completionRate !== undefined && task.status === 'IN_PROGRESS' && (
            <div className="mt-2">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-200 rounded-full h-1.5 max-w-[80px]">
                  <div
                    className="h-1.5 rounded-full bg-primary"
                    style={{ width: `${task.completionRate}%` }}
                  />
                </div>
                <span className="text-xs text-gray-600">{task.completionRate}%</span>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (task) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              console.log('Edit task:', task.id);
            }}
            className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors"
            title="Modifier"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (confirm('Supprimer cette tâche ?')) {
                console.log('Delete task:', task.id);
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

  const pendingCount = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgressCount = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completedCount = tasks.filter((t) => t.status === 'COMPLETED').length;
  const overdueCount = tasks.filter((t) => t.status === 'OVERDUE').length;

  return (
    <div>
      <PageHeader
        title="Gestion des Tâches"
        description="Créer et suivre les tâches assignées aux vendeurs"
        actions={
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4 mr-2" />
            Nouvelle Tâche
          </Button>
        }
      />

      {/* KPIs */}
      <DashboardGrid columns={4} gap="md">
        <StatCard
          title="En attente"
          value={pendingCount}
          icon={Clock}
          color="warning"
          subtitle="tâches"
        />
        <StatCard
          title="En cours"
          value={inProgressCount}
          icon={ClipboardList}
          color="primary"
          subtitle="tâches"
        />
        <StatCard
          title="Terminées"
          value={completedCount}
          icon={CheckCircle}
          color="success"
          subtitle="tâches"
        />
        <StatCard
          title="En retard"
          value={overdueCount}
          icon={XCircle}
          color="danger"
          subtitle="tâches"
        />
      </DashboardGrid>

      {/* Alertes */}
      {overdueCount > 0 && (
        <div className="mt-6 p-4 bg-danger/10 border border-danger/20 rounded-lg flex items-center gap-3">
          <XCircle className="w-5 h-5 text-danger" />
          <div className="flex-1">
            <p className="font-medium text-gray-900">
              {overdueCount} tâche{overdueCount > 1 ? 's' : ''} en retard
            </p>
            <p className="text-sm text-gray-600">
              Ces tâches ont dépassé leur date d'échéance.
            </p>
          </div>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setStatusFilter('OVERDUE')}
          >
            Voir
          </Button>
        </div>
      )}

      <div className="mt-6">
        <FilterBar
          activeFiltersCount={activeFiltersCount}
          onClear={handleClearFilters}
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Tous les types</option>
              <option value="SURVEY">Enquête</option>
              <option value="MERCHANDISING">Merchandising</option>
              <option value="STOCK_CHECK">Inventaire</option>
              <option value="PHOTO">Photos</option>
              <option value="OTHER">Autre</option>
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
              <option value="all">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="COMPLETED">Terminées</option>
              <option value="OVERDUE">En retard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">Toutes les priorités</option>
              <option value="HIGH">Haute</option>
              <option value="MEDIUM">Moyenne</option>
              <option value="LOW">Basse</option>
            </select>
          </div>
        </FilterBar>

        <DataTable
          data={filteredTasks}
          columns={columns}
          searchable
          searchPlaceholder="Rechercher une tâche..."
          onRowClick={(task) => console.log('View task details:', task)}
        />
      </div>
    </div>
  );
}
