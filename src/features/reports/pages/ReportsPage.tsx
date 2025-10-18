import { useState } from 'react';
import { FileText, Download, Calendar, TrendingUp } from 'lucide-react';
import { PageHeader, FilterBar, ChartWrapper } from '../../../core/components/desktop';
import Button from '../../../core/ui/Button';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'sales' | 'performance' | 'inventory' | 'visits';
  icon: string;
}

const reportTemplates: ReportTemplate[] = [
  {
    id: '1',
    name: 'Rapport de Ventes',
    description: 'Analyse détaillée des ventes par période, territoire et produit',
    category: 'sales',
    icon: '💰',
  },
  {
    id: '2',
    name: 'Performance des Vendeurs',
    description: 'KPIs individuels et comparaisons',
    category: 'performance',
    icon: '📊',
  },
  {
    id: '3',
    name: 'État des Stocks',
    description: 'Inventaire et ruptures de stock',
    category: 'inventory',
    icon: '📦',
  },
  {
    id: '4',
    name: 'Couverture des Visites',
    description: 'Taux de visite et couverture territoriale',
    category: 'visits',
    icon: '🗺️',
  },
  {
    id: '5',
    name: 'Analyse Territoriale',
    description: 'Performance par zone géographique',
    category: 'sales',
    icon: '🌍',
  },
  {
    id: '6',
    name: 'Tendances Mensuelles',
    description: 'Évolution des indicateurs clés',
    category: 'performance',
    icon: '📈',
  },
];

// Mock data pour les graphiques
const salesTrendData = [
  { month: 'Jan', ventes: 45000, objectif: 40000 },
  { month: 'Fév', ventes: 52000, objectif: 45000 },
  { month: 'Mar', ventes: 48000, objectif: 45000 },
  { month: 'Avr', ventes: 61000, objectif: 50000 },
  { month: 'Mai', ventes: 55000, objectif: 50000 },
  { month: 'Juin', ventes: 67000, objectif: 55000 },
];

const categoryData = [
  { name: 'Boissons', value: 45, color: '#38BDF8' },
  { name: 'Snacks', value: 25, color: '#10B981' },
  { name: 'Hygiène', value: 20, color: '#F59E0B' },
  { name: 'Alimentaire', value: 10, color: '#EF4444' },
];

const territoryPerformance = [
  { territory: 'Plateau', ventes: 45000, visites: 120 },
  { territory: 'Cocody', ventes: 38000, visites: 100 },
  { territory: 'Adjamé', ventes: 52000, visites: 150 },
  { territory: 'Yopougon', ventes: 28000, visites: 90 },
];

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('2025-10-01');
  const [endDate, setEndDate] = useState('2025-10-07');
  const [territory, setTerritory] = useState('all');
  const [reportType, setReportType] = useState('all');

  const activeFiltersCount =
    (territory !== 'all' ? 1 : 0) + (reportType !== 'all' ? 1 : 0);

  const handleGenerateReport = (templateId: string) => {
    console.log('Generating report:', templateId, { startDate, endDate, territory });
    alert(`Génération du rapport en cours...\nPériode: ${startDate} au ${endDate}`);
  };

  const handleExport = (format: 'pdf' | 'excel') => {
    console.log('Exporting report as:', format);
    alert(`Export en ${format.toUpperCase()} en cours...`);
  };

  return (
    <div>
      <PageHeader
        title="Rapports et Analyses"
        description="Générer et exporter des rapports personnalisés"
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="md" onClick={() => handleExport('excel')}>
              <Download className="w-4 h-4 mr-2" />
              Excel
            </Button>
            <Button variant="primary" size="md" onClick={() => handleExport('pdf')}>
              <Download className="w-4 h-4 mr-2" />
              PDF
            </Button>
          </div>
        }
      />

      {/* Filtres */}
      <FilterBar
        activeFiltersCount={activeFiltersCount}
        onClear={() => {
          setTerritory('all');
          setReportType('all');
        }}
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de début
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Date de fin
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          />
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de rapport
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">Tous les types</option>
            <option value="sales">Ventes</option>
            <option value="performance">Performance</option>
            <option value="inventory">Inventaire</option>
            <option value="visits">Visites</option>
          </select>
        </div>
      </FilterBar>

      {/* Templates de rapports */}
      <div className="mt-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Modèles de Rapports
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reportTemplates
            .filter((template) => reportType === 'all' || template.category === reportType)
            .map((template) => (
              <div
                key={template.id}
                className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="text-4xl">{template.icon}</div>
                  <FileText className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.description}</p>
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  onClick={() => handleGenerateReport(template.id)}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  Générer
                </Button>
              </div>
            ))}
        </div>
      </div>

      {/* Aperçu des données */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Aperçu des Données
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Tendance des ventes */}
          <ChartWrapper
            title="Tendance des Ventes"
            subtitle="6 derniers mois"
          >
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={salesTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
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
                <Line
                  type="monotone"
                  dataKey="objectif"
                  stroke="#EF4444"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Objectif"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartWrapper>

          {/* Répartition par catégorie */}
          <ChartWrapper
            title="Ventes par Catégorie"
            subtitle="Répartition"
          >
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartWrapper>

          {/* Performance territoriale */}
          <ChartWrapper
            title="Performance par Territoire"
            subtitle="Ventes et visites"
          >
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={territoryPerformance}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="territory" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Bar
                  yAxisId="left"
                  dataKey="ventes"
                  fill="#10B981"
                  name="Ventes (FCFA)"
                />
                <Bar
                  yAxisId="right"
                  dataKey="visites"
                  fill="#38BDF8"
                  name="Visites"
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartWrapper>

          {/* Résumé */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="w-6 h-6 text-primary" />
              <h3 className="text-lg font-semibold text-gray-900">
                Résumé de la Période
              </h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Ventes totales</span>
                <span className="text-xl font-bold text-gray-900">
                  163K FCFA
                </span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Nombre de visites</span>
                <span className="text-xl font-bold text-gray-900">460</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Taux de couverture</span>
                <span className="text-xl font-bold text-success">86.5%</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Strike rate</span>
                <span className="text-xl font-bold text-primary">73.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Croissance</span>
                <span className="text-xl font-bold text-success">+12%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
