import { useState } from 'react';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import KPICard from '../../components/ui/KPICard';

export default function DataSUP() {
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  const [selectedTerritory, setSelectedTerritory] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState('all');

  const kpis = {
    dn: 87.5,
    dw: 92.3,
    osa: 94.1,
    perfectStore: 78.5,
  };

  const salesData = [
    { period: 'Semaine 1', sales: 2500000, target: 3000000 },
    { period: 'Semaine 2', sales: 2800000, target: 3000000 },
    { period: 'Semaine 3', sales: 3200000, target: 3000000 },
    { period: 'Semaine 4', sales: 2900000, target: 3000000 },
  ];

  const topProducts = [
    { id: '1', name: 'Coca-Cola 1.5L', sales: 450000, units: 450, growth: 12.5 },
    { id: '2', name: 'Fanta Orange 50cl', sales: 380000, units: 760, growth: 8.3 },
    { id: '3', name: 'Sprite 1L', sales: 320000, units: 400, growth: -2.1 },
  ];

  const comparison = {
    currentMonth: 11500000,
    previousMonth: 10200000,
    growth: 12.7,
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-white border-b border-gray-200 px-4 py-4 sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-900 mb-3">Analytics détaillés 📊</h1>
        
        {/* Filtres */}
        <div className="space-y-2">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['today', 'week', 'month', 'quarter', 'year'].map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedPeriod === period
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                {period === 'today' && "Aujourd'hui"}
                {period === 'week' && 'Semaine'}
                {period === 'month' && 'Mois'}
                {period === 'quarter' && 'Trimestre'}
                {period === 'year' && 'Année'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* KPIs secondaires */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <KPICard
            label="DN (Distribution Numérique)"
            value={kpis.dn}
            unit="%"
            icon="📊"
            color="primary"
            trend={3.2}
          />
          <KPICard
            label="DW (Distribution Valeur)"
            value={kpis.dw}
            unit="%"
            icon="💰"
            color="secondary"
            trend={2.8}
          />
          <KPICard
            label="OSA (On Shelf Availability)"
            value={kpis.osa}
            unit="%"
            icon="📦"
            color="success"
            trend={1.5}
          />
          <KPICard
            label="Perfect Store Score"
            value={kpis.perfectStore}
            unit="%"
            icon="⭐"
            color="warning"
            trend={-1.2}
          />
        </div>

        {/* Comparaison N vs N-1 */}
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Comparaison période N vs N-1
          </h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-xs text-gray-600 mb-1">Mois actuel</p>
              <p className="text-2xl font-bold text-gray-900">
                {(comparison.currentMonth / 1000000).toFixed(1)}M
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-600 mb-1">Mois précédent</p>
              <p className="text-2xl font-bold text-gray-500">
                {(comparison.previousMonth / 1000000).toFixed(1)}M
              </p>
            </div>
          </div>
          <div className="flex items-center justify-center gap-2 p-3 bg-success/10 rounded-lg">
            <span className="text-2xl">📈</span>
            <div>
              <p className="text-sm font-medium text-success">
                +{comparison.growth}% de croissance
              </p>
              <p className="text-xs text-gray-600">
                +{((comparison.currentMonth - comparison.previousMonth) / 1000).toFixed(0)}K FCFA
              </p>
            </div>
          </div>
        </Card>

        {/* Graphique ventes */}
        <Card className="p-4 mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Évolution des ventes (4 dernières semaines)
          </h3>
          <div className="space-y-3">
            {salesData.map((data, index) => {
              const percentage = (data.sales / data.target) * 100;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-gray-600">{data.period}</span>
                    <span className="text-xs font-medium text-gray-900">
                      {(data.sales / 1000000).toFixed(1)}M / {(data.target / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        percentage >= 100 ? 'bg-success' : percentage >= 80 ? 'bg-warning' : 'bg-danger'
                      }`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Top produits */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 px-1">
            Top produits
          </h3>
          <div className="space-y-2">
            {topProducts.map((product, index) => (
              <Card key={product.id} className="p-4">
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={index === 0 ? 'success' : index === 1 ? 'warning' : 'gray'}
                    size="md"
                  >
                    #{index + 1}
                  </Badge>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 mb-1">{product.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-600">
                      <span>{(product.sales / 1000).toFixed(0)}K FCFA</span>
                      <span>•</span>
                      <span>{product.units} unités</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${
                      product.growth >= 0 ? 'text-success' : 'text-danger'
                    }`}>
                      {product.growth >= 0 ? '↑' : '↓'} {Math.abs(product.growth)}%
                    </span>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Filtres avancés */}
        <Card className="p-4 mb-4">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Filtres avancés</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Territoire
              </label>
              <select 
                value={selectedTerritory}
                onChange={(e) => setSelectedTerritory(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Tous les territoires</option>
                <option value="plateau">Plateau</option>
                <option value="cocody">Cocody</option>
                <option value="marcory">Marcory</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Produit
              </label>
              <select 
                value={selectedProduct}
                onChange={(e) => setSelectedProduct(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="all">Tous les produits</option>
                <option value="coca">Coca-Cola</option>
                <option value="fanta">Fanta</option>
                <option value="sprite">Sprite</option>
              </select>
            </div>
          </div>
        </Card>

        {/* Export */}
        <Button variant="success" size="lg" fullWidth>
          <span className="mr-2">📥</span>
          Exporter en Excel/CSV
        </Button>
      </div>
    </div>
  );
}
