import { TrendingUp, Users, Target, Award } from 'lucide-react';
import {
  StatCard,
  DashboardGrid,
  PageHeader,
  ChartWrapper,
  FilterBar,
} from '../../components/desktop';
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   PieChart,
//   Pie,
//   Cell,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
// } from 'recharts';
import { useState } from 'react';

// Mock data
// const performanceData = [
//   { name: 'Sem 1', couverture: 85, strikeRate: 72, objectif: 80 },
//   { name: 'Sem 2', couverture: 88, strikeRate: 75, objectif: 80 },
//   { name: 'Sem 3', couverture: 82, strikeRate: 70, objectif: 80 },
//   { name: 'Sem 4', couverture: 91, strikeRate: 78, objectif: 80 },
// ];

// const salesByTerritory = [
//   { name: 'Plateau', value: 45000, color: '#38BDF8' },
//   { name: 'Cocody', value: 38000, color: '#10B981' },
//   { name: 'Adjamé', value: 32000, color: '#F59E0B' },
//   { name: 'Yopougon', value: 28000, color: '#EF4444' },
// ];

const topPerformers = [
  { rank: 1, name: 'Jean Kouassi', visites: 127, commandes: 89, ca: 45000 },
  { rank: 2, name: 'Marie Diallo', visites: 118, commandes: 82, ca: 38000 },
  { rank: 3, name: 'Paul Bamba', visites: 105, commandes: 75, ca: 32000 },
  { rank: 4, name: 'Aïcha Traoré', visites: 98, commandes: 68, ca: 28000 },
];

export default function DashboardSupervisor() {
  const [period, setPeriod] = useState('month');
  const [territory, setTerritory] = useState('all');

  const activeFiltersCount =
    (period !== 'month' ? 1 : 0) + (territory !== 'all' ? 1 : 0);

  return (
    <div>
      <PageHeader
        title="Tableau de bord Superviseur"
        description="Analyse des performances de l'équipe"
      />

      {/* Filters */}
      <FilterBar
        activeFiltersCount={activeFiltersCount}
        onClear={() => {
          setPeriod('month');
          setTerritory('all');
        }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Période
          </label>
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="week">Cette semaine</option>
            <option value="month">Ce mois</option>
            <option value="quarter">Ce trimestre</option>
            <option value="year">Cette année</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Territoire
          </label>
          <select
            value={territory}
            onChange={(e) => setTerritory(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les territoires</option>
            <option value="plateau">Plateau</option>
            <option value="cocody">Cocody</option>
            <option value="adjame">Adjamé</option>
            <option value="yopougon">Yopougon</option>
          </select>
        </div>
      </FilterBar>

      {/* KPIs */}
      <DashboardGrid columns={4} gap="md">
        <StatCard
          title="Couverture Moyenne"
          value="86.5%"
          icon={Target}
          color="success"
          trend={{ value: 5, isPositive: true }}
          subtitle="vs mois dernier"
        />
        <StatCard
          title="Strike Rate"
          value="73.8%"
          icon={TrendingUp}
          color="primary"
          trend={{ value: 3, isPositive: true }}
          subtitle="vs mois dernier"
        />
        <StatCard
          title="Vendeurs Actifs"
          value={24}
          icon={Users}
          color="warning"
          subtitle="sur 28 total"
        />
        <StatCard
          title="CA Mensuel"
          value="143K"
          icon={Award}
          color="secondary"
          trend={{ value: 12, isPositive: true }}
          subtitle="FCFA"
        />
      </DashboardGrid>

      {/* Charts - TEMPORAIREMENT DÉSACTIVÉ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ChartWrapper
          title="Performance Hebdomadaire"
          subtitle="Données en cours de chargement..."
        >
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-400">
              <p className="text-sm">Données non disponibles</p>
            </div>
          </div>
        </ChartWrapper>

        <ChartWrapper
          title="Ventes par Territoire"
          subtitle="Données en cours de chargement..."
        >
          <div className="h-[300px] flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center text-gray-400">
              <p className="text-sm">Données non disponibles</p>
            </div>
          </div>
        </ChartWrapper>
      </div>

      {/* Top Performers */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          🏆 Top Performers du Mois
        </h2>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Rang
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Vendeur
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Visites
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Commandes
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  CA (FCFA)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {topPerformers.map((performer) => (
                <tr key={performer.rank} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        performer.rank === 1
                          ? 'bg-yellow-500'
                          : performer.rank === 2
                          ? 'bg-gray-400'
                          : performer.rank === 3
                          ? 'bg-orange-600'
                          : 'bg-gray-300'
                      }`}
                    >
                      {performer.rank}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
                        {performer.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <span className="font-medium text-gray-900">
                        {performer.name}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {performer.visites}
                  </td>
                  <td className="px-6 py-4 text-gray-900">
                    {performer.commandes}
                  </td>
                  <td className="px-6 py-4 font-semibold text-success">
                    {performer.ca.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
