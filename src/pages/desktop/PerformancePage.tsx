import { useState } from 'react';
import { TrendingUp, Target, Award, DollarSign } from 'lucide-react';
import {
  PageHeader,
  DashboardGrid,
  StatCard,
  ChartWrapper,
  FilterBar,
  DataTable,
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

interface RepPerformance {
  id: string;
  name: string;
  territory: string;
  visitsPlanned: number;
  visitsCompleted: number;
  coverage: number;
  strikeRate: number;
  sales: number;
  trend: number;
}

// Mock data
const mockPerformances: RepPerformance[] = [
  {
    id: '1',
    name: 'Jean Kouassi',
    territory: 'Plateau',
    visitsPlanned: 120,
    visitsCompleted: 110,
    coverage: 92,
    strikeRate: 78,
    sales: 45000,
    trend: 12,
  },
  {
    id: '2',
    name: 'Marie Diallo',
    territory: 'Cocody',
    visitsPlanned: 100,
    visitsCompleted: 87,
    coverage: 87,
    strikeRate: 72,
    sales: 38000,
    trend: 5,
  },
  {
    id: '3',
    name: 'Paul Bamba',
    territory: 'Adjamé',
    visitsPlanned: 150,
    visitsCompleted: 142,
    coverage: 95,
    strikeRate: 85,
    sales: 52000,
    trend: 18,
  },
  {
    id: '4',
    name: 'Aïcha Traoré',
    territory: 'Yopougon',
    visitsPlanned: 90,
    visitsCompleted: 58,
    coverage: 64,
    strikeRate: 55,
    sales: 28000,
    trend: -8,
  },
];

const weeklyData = [
  { week: 'S1', coverage: 85, strikeRate: 72, sales: 35000 },
  { week: 'S2', coverage: 88, strikeRate: 75, sales: 38000 },
  { week: 'S3', coverage: 82, strikeRate: 70, sales: 32000 },
  { week: 'S4', coverage: 91, strikeRate: 78, sales: 42000 },
];

const territoryData = [
  { territory: 'Plateau', coverage: 92, strikeRate: 78 },
  { territory: 'Cocody', coverage: 87, strikeRate: 72 },
  { territory: 'Adjamé', coverage: 95, strikeRate: 85 },
  { territory: 'Yopougon', coverage: 64, strikeRate: 55 },
];

export default function PerformancePage() {
  const [performances] = useState<RepPerformance[]>(mockPerformances);
  const [period, setPeriod] = useState('month');
  const [territory, setTerritory] = useState('all');

  const filteredPerformances = performances.filter((perf) => {
    if (territory !== 'all' && perf.territory !== territory) return false;
    return true;
  });

  const activeFiltersCount = (period !== 'month' ? 1 : 0) + (territory !== 'all' ? 1 : 0);

  const columns: Column<RepPerformance>[] = [
    {
      key: 'name',
      label: 'Vendeur',
      sortable: true,
      render: (perf) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold">
            {perf.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <p className="font-medium text-gray-900">{perf.name}</p>
            <p className="text-sm text-gray-500">{perf.territory}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'visitsCompleted',
      label: 'Visites',
      sortable: true,
      render: (perf) => (
        <div>
          <p className="font-semibold text-gray-900">
            {perf.visitsCompleted}/{perf.visitsPlanned}
          </p>
          <p className="text-xs text-gray-500">complétées</p>
        </div>
      ),
    },
    {
      key: 'coverage',
      label: 'Couverture',
      sortable: true,
      render: (perf) => (
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2 max-w-[80px]">
            <div
              className={`h-2 rounded-full ${
                perf.coverage >= 90
                  ? 'bg-success'
                  : perf.coverage >= 70
                  ? 'bg-warning'
                  : 'bg-danger'
              }`}
              style={{ width: `${perf.coverage}%` }}
            />
          </div>
          <span className="text-sm font-semibold text-gray-700">{perf.coverage}%</span>
        </div>
      ),
    },
    {
      key: 'strikeRate',
      label: 'Strike Rate',
      sortable: true,
      render: (perf) => (
        <span
          className={`font-semibold ${
            perf.strikeRate >= 80
              ? 'text-success'
              : perf.strikeRate >= 60
              ? 'text-warning'
              : 'text-danger'
          }`}
        >
          {perf.strikeRate}%
        </span>
      ),
    },
    {
      key: 'sales',
      label: 'CA (FCFA)',
      sortable: true,
      render: (perf) => (
        <span className="font-semibold text-gray-900">
          {perf.sales.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'trend',
      label: 'Tendance',
      sortable: true,
      render: (perf) => (
        <div className="flex items-center gap-1">
          <TrendingUp
            className={`w-4 h-4 ${
              perf.trend > 0 ? 'text-success' : 'text-danger'
            } ${perf.trend < 0 ? 'rotate-180' : ''}`}
          />
          <span
            className={`text-sm font-medium ${
              perf.trend > 0 ? 'text-success' : 'text-danger'
            }`}
          >
            {perf.trend > 0 ? '+' : ''}
            {perf.trend}%
          </span>
        </div>
      ),
    },
  ];

  const avgCoverage = Math.round(
    filteredPerformances.reduce((sum, p) => sum + p.coverage, 0) / filteredPerformances.length
  );
  const avgStrikeRate = Math.round(
    filteredPerformances.reduce((sum, p) => sum + p.strikeRate, 0) / filteredPerformances.length
  );
  const totalSales = filteredPerformances.reduce((sum, p) => sum + p.sales, 0);
  const topPerformer = filteredPerformances.reduce((max, p) =>
    p.coverage > max.coverage ? p : max
  );

  return (
    <div>
      <PageHeader
        title="Performances de l'Équipe"
        description="Analyse détaillée des KPIs par vendeur"
      />

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
            <option value="Plateau">Plateau</option>
            <option value="Cocody">Cocody</option>
            <option value="Adjamé">Adjamé</option>
            <option value="Yopougon">Yopougon</option>
          </select>
        </div>
      </FilterBar>

      {/* KPIs */}
      <DashboardGrid columns={4} gap="md">
        <StatCard
          title="Couverture Moyenne"
          value={`${avgCoverage}%`}
          icon={Target}
          color="success"
          trend={{ value: 5, isPositive: true }}
          subtitle="vs période précédente"
        />
        <StatCard
          title="Strike Rate Moyen"
          value={`${avgStrikeRate}%`}
          icon={TrendingUp}
          color="primary"
          trend={{ value: 3, isPositive: true }}
          subtitle="vs période précédente"
        />
        <StatCard
          title="CA Total"
          value={`${(totalSales / 1000).toFixed(0)}K`}
          icon={DollarSign}
          color="warning"
          trend={{ value: 12, isPositive: true }}
          subtitle="FCFA"
        />
        <StatCard
          title="Top Performer"
          value={topPerformer.name.split(' ')[0]}
          icon={Award}
          color="secondary"
          subtitle={`${topPerformer.coverage}% couverture`}
        />
      </DashboardGrid>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ChartWrapper title="Évolution Hebdomadaire" subtitle="Couverture et Strike Rate">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="coverage"
                stroke="#10B981"
                strokeWidth={2}
                name="Couverture (%)"
              />
              <Line
                type="monotone"
                dataKey="strikeRate"
                stroke="#38BDF8"
                strokeWidth={2}
                name="Strike Rate (%)"
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Performance par Territoire" subtitle="Comparaison">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={territoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="territory" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="coverage" fill="#10B981" name="Couverture (%)" />
              <Bar dataKey="strikeRate" fill="#38BDF8" name="Strike Rate (%)" />
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>

      {/* Table */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Détails par Vendeur
        </h2>
        <DataTable
          data={filteredPerformances}
          columns={columns}
          searchable
          searchPlaceholder="Rechercher un vendeur..."
        />
      </div>
    </div>
  );
}
