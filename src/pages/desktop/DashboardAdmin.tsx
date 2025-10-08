import { Users, MapPin, TrendingUp, Package } from 'lucide-react';
import { 
  StatCard, 
  DashboardGrid, 
  PageHeader, 
  DataTable,
  ChartWrapper 
} from '../../components/desktop';
import type { Column } from '../../components/desktop/DataTable';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// Mock data
const recentActivities = [
  {
    id: 1,
    user: 'Jean Kouassi',
    action: 'Nouvelle visite complétée',
    pdv: 'Supermarché Plateau',
    time: 'Il y a 5 min',
  },
  {
    id: 2,
    user: 'Marie Diallo',
    action: 'Commande créée',
    pdv: 'Boutique Cocody',
    time: 'Il y a 12 min',
  },
  {
    id: 3,
    user: 'Paul Bamba',
    action: 'PDV proposé',
    pdv: 'Kiosque Adjamé',
    time: 'Il y a 18 min',
  },
  {
    id: 4,
    user: 'Aïcha Traoré',
    action: 'Route complétée',
    pdv: '12 visites',
    time: 'Il y a 25 min',
  },
];

const visitsData = [
  { name: 'Lun', visites: 45, commandes: 32 },
  { name: 'Mar', visites: 52, commandes: 38 },
  { name: 'Mer', visites: 48, commandes: 35 },
  { name: 'Jeu', visites: 61, commandes: 42 },
  { name: 'Ven', visites: 55, commandes: 40 },
  { name: 'Sam', visites: 38, commandes: 28 },
];

const salesData = [
  { name: 'Jan', ventes: 45000 },
  { name: 'Fév', ventes: 52000 },
  { name: 'Mar', ventes: 48000 },
  { name: 'Avr', ventes: 61000 },
  { name: 'Mai', ventes: 55000 },
  { name: 'Juin', ventes: 67000 },
];

const columns: Column<typeof recentActivities[0]>[] = [
  {
    key: 'user',
    label: 'Utilisateur',
    sortable: true,
    render: (item) => (
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-semibold">
          {item.user.split(' ').map((n: string) => n[0]).join('')}
        </div>
        <span className="font-medium">{item.user}</span>
      </div>
    ),
  },
  {
    key: 'action',
    label: 'Action',
    sortable: true,
  },
  {
    key: 'pdv',
    label: 'PDV / Détails',
    sortable: true,
  },
  {
    key: 'time',
    label: 'Heure',
    sortable: false,
    render: (item) => (
      <span className="text-gray-500">{item.time}</span>
    ),
  },
];

export default function DashboardAdmin() {
  return (
    <div>
      <PageHeader
        title="Tableau de bord Administrateur"
        description="Vue d'ensemble des activités et performances"
      />

      {/* KPIs */}
      <DashboardGrid columns={4} gap="md">
        <StatCard
          title="Utilisateurs Actifs"
          value={45}
          icon={Users}
          color="success"
          trend={{ value: 12, isPositive: true }}
          subtitle="vs mois dernier"
        />
        <StatCard
          title="Points de Vente"
          value={234}
          icon={MapPin}
          color="primary"
          trend={{ value: 8, isPositive: true }}
          subtitle="8 en attente"
        />
        <StatCard
          title="Visites Aujourd'hui"
          value={127}
          icon={TrendingUp}
          color="warning"
          trend={{ value: -3, isPositive: false }}
          subtitle="vs hier"
        />
        <StatCard
          title="Commandes du Jour"
          value={89}
          icon={Package}
          color="secondary"
          trend={{ value: 15, isPositive: true }}
          subtitle="vs hier"
        />
      </DashboardGrid>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ChartWrapper
          title="Visites et Commandes"
          subtitle="7 derniers jours"
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={visitsData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="visites" fill="#38BDF8" name="Visites" />
              <Bar dataKey="commandes" fill="#10B981" name="Commandes" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper
          title="Évolution des Ventes"
          subtitle="6 derniers mois"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="ventes"
                stroke="#2563EB"
                strokeWidth={2}
                name="Ventes (FCFA)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Recent Activities Table */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Activités Récentes
        </h2>
        <DataTable
          data={recentActivities}
          columns={columns}
          searchable
          searchPlaceholder="Rechercher une activité..."
        />
      </div>
    </div>
  );
}
