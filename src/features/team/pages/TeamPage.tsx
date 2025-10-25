/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Users, MapPin, Phone, Mail, Calendar, TrendingUp, UserPlus } from 'lucide-react';
import { PageHeader, DashboardGrid, StatCard } from '../../../core/components/desktop';
import { Button, Modal, Badge, Card } from '@/core/ui';
import { useToggle, useMutation } from '@/core/hooks';
import UserModal from '../../../core/components/modals/UserModal';
import { usersService, type CreateUserDto, type UpdateUserDto } from '@/features/users/services';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  territory: string;
  phone: string;
  email: string;
  hireDate: string;
  activeRoutes: number;
  pdvAssigned: number;
  lastActivity: string;
  performance: {
    coverage: number;
    strikeRate: number;
    sales: number;
  };
  status: 'active' | 'inactive' | 'on_leave';
}

// Mock data
const mockTeam: TeamMember[] = [
  {
    id: '1',
    name: 'Jean Kouassi',
    role: 'Vendeur Senior',
    territory: 'Plateau',
    phone: '+225 01 23 45 67',
    email: 'jean.kouassi@example.com',
    hireDate: '2023-01-15',
    activeRoutes: 3,
    pdvAssigned: 45,
    lastActivity: '2025-10-07 14:30',
    performance: {
      coverage: 92,
      strikeRate: 78,
      sales: 45000,
    },
    status: 'active',
  },
  {
    id: '2',
    name: 'Marie Diallo',
    role: 'Vendeur',
    territory: 'Cocody',
    phone: '+225 07 89 01 23',
    email: 'marie.diallo@example.com',
    hireDate: '2023-06-20',
    activeRoutes: 2,
    pdvAssigned: 38,
    lastActivity: '2025-10-07 13:15',
    performance: {
      coverage: 87,
      strikeRate: 72,
      sales: 38000,
    },
    status: 'active',
  },
  {
    id: '3',
    name: 'Paul Bamba',
    role: 'Vendeur Senior',
    territory: 'Adjamé',
    phone: '+225 05 67 89 01',
    email: 'paul.bamba@example.com',
    hireDate: '2022-09-10',
    activeRoutes: 4,
    pdvAssigned: 52,
    lastActivity: '2025-10-07 15:45',
    performance: {
      coverage: 95,
      strikeRate: 85,
      sales: 52000,
    },
    status: 'active',
  },
  {
    id: '4',
    name: 'Aïcha Traoré',
    role: 'Vendeur Junior',
    territory: 'Yopougon',
    phone: '+225 09 12 34 56',
    email: 'aicha.traore@example.com',
    hireDate: '2024-03-01',
    activeRoutes: 2,
    pdvAssigned: 28,
    lastActivity: '2025-10-06 16:20',
    performance: {
      coverage: 64,
      strikeRate: 55,
      sales: 28000,
    },
    status: 'active',
  },
];

export default function TeamPage() {
  const [team] = useState<TeamMember[]>(mockTeam);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  
  // ✅ Hook réutilisable pour le modal
  const [isModalOpen, , setIsModalOpen] = useToggle(false);
  const [modalMode] = useState<'create' | 'edit'>('create');

  const activeMembers = team.filter((m) => m.status === 'active').length;
  const totalPDV = team.reduce((sum, m) => sum + m.pdvAssigned, 0);
  const totalRoutes = team.reduce((sum, m) => sum + m.activeRoutes, 0);
  const avgCoverage = Math.round(
    team.reduce((sum, m) => sum + m.performance.coverage, 0) / team.length
  );

  // ✅ Hook réutilisable pour les mutations
  const createUserMutation = useMutation(
    (data: CreateUserDto) => usersService.create(data),
    {
      onSuccess: () => {
        alert('✅ Utilisateur créé avec succès!');
        setIsModalOpen(false);
      },
      onError: (error) => {
        console.error('❌ Erreur lors de la création:', error);
      },
    }
  );

  const handleSubmitUser = (data: CreateUserDto | UpdateUserDto) => {
    return createUserMutation.mutateAsync(data as CreateUserDto);
  };

  return (
    <div>
      <PageHeader
        title="Mon Équipe"
        description={`${team.length} vendeurs • ${activeMembers} actifs`}
        actions={
          <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
            <UserPlus className="w-4 h-4 mr-2" />
            Nouvel Utilisateur
          </Button>
        }
      />

      {/* KPIs */}
      <DashboardGrid columns={4} gap="md">
        <StatCard
          title="Vendeurs Actifs"
          value={activeMembers}
          icon={Users}
          color="success"
          subtitle={`sur ${team.length} total`}
        />
        <StatCard
          title="PDV Assignés"
          value={totalPDV}
          icon={MapPin}
          color="primary"
          subtitle="au total"
        />
        <StatCard
          title="Routes Actives"
          value={totalRoutes}
          icon={Calendar}
          color="warning"
          subtitle="en cours"
        />
        <StatCard
          title="Couverture Moyenne"
          value={`${avgCoverage}%`}
          icon={TrendingUp}
          color="secondary"
          subtitle="de l'équipe"
        />
      </DashboardGrid>

      {/* Team Grid */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Membres de l'Équipe</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {team.map((member) => (
            <Card
              key={member.id}
              onClick={() => setSelectedMember(member)}
              className="p-6 hover:shadow-lg transition-shadow cursor-pointer"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-lg font-bold">
                    {member.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <Badge
                  variant={member.status === 'active' ? 'success' : 'gray'}
                  size="sm"
                >
                  {member.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>

              {/* Info */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  <span>{member.territory}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  <span>{member.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4" />
                  <span className="truncate">{member.email}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-200">
                <div>
                  <p className="text-xs text-gray-500">PDV</p>
                  <p className="text-lg font-bold text-gray-900">{member.pdvAssigned}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Routes</p>
                  <p className="text-lg font-bold text-gray-900">{member.activeRoutes}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Couverture</p>
                  <p
                    className={`text-lg font-bold ${
                      member.performance.coverage >= 90
                        ? 'text-success'
                        : member.performance.coverage >= 70
                        ? 'text-warning'
                        : 'text-danger'
                    }`}
                  >
                    {member.performance.coverage}%
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Strike Rate</p>
                  <p className="text-lg font-bold text-primary">
                    {member.performance.strikeRate}%
                  </p>
                </div>
              </div>

              {/* Performance Bar */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                  <span>Performance</span>
                  <span className="font-medium">{member.performance.coverage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      member.performance.coverage >= 90
                        ? 'bg-success'
                        : member.performance.coverage >= 70
                        ? 'bg-warning'
                        : 'bg-danger'
                    }`}
                    style={{ width: `${member.performance.coverage}%` }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ✅ Modal réutilisable pour les détails */}
      <Modal
        isOpen={!!selectedMember}
        onClose={() => setSelectedMember(null)}
        title={selectedMember?.name || ''}
        size="lg"
      >
        {selectedMember && (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                {selectedMember.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-gray-600">{selectedMember.role}</p>
                <Badge variant="success" size="sm" className="mt-1">
                  {selectedMember.status === 'active' ? 'Actif' : 'Inactif'}
                </Badge>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Informations</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="text-gray-600">Territoire:</span>{' '}
                    <span className="font-medium">{selectedMember.territory}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Téléphone:</span>{' '}
                    <span className="font-medium">{selectedMember.phone}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Email:</span>{' '}
                    <span className="font-medium">{selectedMember.email}</span>
                  </p>
                  <p>
                    <span className="text-gray-600">Date d'embauche:</span>{' '}
                    <span className="font-medium">
                      {new Date(selectedMember.hireDate).toLocaleDateString('fr-FR')}
                    </span>
                  </p>
                  <p>
                    <span className="text-gray-600">Dernière activité:</span>{' '}
                    <span className="font-medium">{selectedMember.lastActivity}</span>
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Performance</h3>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Couverture</span>
                      <span className="font-semibold text-success">
                        {selectedMember.performance.coverage}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-success"
                        style={{ width: `${selectedMember.performance.coverage}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Strike Rate</span>
                      <span className="font-semibold text-primary">
                        {selectedMember.performance.strikeRate}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${selectedMember.performance.strikeRate}%` }}
                      />
                    </div>
                  </div>
                  <div className="pt-3 border-t">
                    <p className="text-sm text-gray-600">CA du mois</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {selectedMember.performance.sales.toLocaleString()} FCFA
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de création d'utilisateur */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmitUser}
        mode={modalMode}
        allowRoleSelection={true}  // Les SUP peuvent créer tous les types d'utilisateurs
      />
    </div>
  );
}
