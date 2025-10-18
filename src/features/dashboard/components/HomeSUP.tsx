import { useState } from 'react';
import Card from '../../../core/ui/Card';
import KPICard from '../../../core/ui/KPICard';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';

export default function HomeSUP() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  const kpis = {
    coverage: 87.5,
    strikeRate: 72.3,
    todaySales: 1250000,
    todayVisits: 127,
  };

  const topPerformers = [
    { id: 1, name: 'Jean Kouassi', sales: 450000, visits: 18, rank: 1 },
    { id: 2, name: 'Marie Diallo', sales: 380000, visits: 15, rank: 2 },
    { id: 3, name: 'Paul Bamba', sales: 320000, visits: 14, rank: 3 },
  ];

  const lowPerformers = [
    { id: 1, name: 'Eric Toure', sales: 45000, visits: 3 },
    { id: 2, name: 'Sophie Kone', sales: 52000, visits: 4 },
  ];

  return (
    <div className="pb-20 px-4 pt-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
          Dashboard Manager
          <Icon name="chartBar" size="lg" variant="primary" />
        </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Filtres rapides */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['today', 'week', 'month', 'quarter'].map((period) => (
          <button
            key={period}
            onClick={() => setSelectedPeriod(period)}
            className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              selectedPeriod === period
                ? 'bg-primary text-white'
                : 'bg-white text-gray-700 border border-gray-200'
            }`}
          >
            {period === 'today' && "Aujourd'hui"}
            {period === 'week' && 'Cette semaine'}
            {period === 'month' && 'Ce mois'}
            {period === 'quarter' && 'Ce trimestre'}
          </button>
        ))}
      </div>

      {/* KPIs principaux */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <KPICard
          label="Taux de couverture"
          value={kpis.coverage}
          unit="%"
          icon="checkCircle"
          color="green"
          trend={5.2}
        />
        <KPICard
          label="Strike Rate"
          value={kpis.strikeRate}
          unit="%"
          icon="star"
          color="primary"
          trend={-2.1}
        />
        <KPICard
          label="CA du jour"
          value={(kpis.todaySales / 1000).toFixed(0)}
          unit="K FCFA"
          icon="cart"
          color="primary"
          trend={12.5}
        />
        <KPICard
          label="Visites effectuées"
          value={kpis.todayVisits}
          icon="locationMarker"
          color="yellow"
          trend={8.3}
        />
      </div>

      {/* Graphique de performance (placeholder) */}
      <Card className="p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Évolution des ventes</h3>
        <div className="h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <Icon name="chartBar" size="2xl" variant="primary" className="mb-2" />
            <p className="text-sm text-gray-600">Graphique interactif</p>
          </div>
        </div>
      </Card>

      {/* Top performers */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          Top Vendeurs
          <Icon name="star" size="md" variant="yellow" />
        </h3>
        <Card className="divide-y divide-gray-200">
          {topPerformers.map((performer, index) => (
            <div key={performer.id} className="p-4">
              <div className="flex items-center gap-3">
                <Icon 
                  name="star" 
                  size="xl" 
                  variant={performer.rank === 1 ? 'yellow' : performer.rank === 2 ? 'grey' : 'red'}
                />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{performer.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {(performer.sales / 1000).toFixed(0)}K FCFA
                    </span>
                    <span className="text-sm text-gray-600">
                      {performer.visits} visites
                    </span>
                  </div>
                </div>
                <Badge variant="success">#{index + 1}</Badge>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Low performers */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
          À surveiller
          <Icon name="warning" size="md" variant="yellow" />
        </h3>
        <Card className="divide-y divide-gray-200">
          {lowPerformers.map((performer) => (
            <div key={performer.id} className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{performer.name}</p>
                  <div className="flex items-center gap-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {(performer.sales / 1000).toFixed(0)}K FCFA
                    </span>
                    <span className="text-sm text-gray-600">
                      {performer.visits} visites
                    </span>
                  </div>
                </div>
                <Badge variant="warning">Faible</Badge>
              </div>
            </div>
          ))}
        </Card>
      </div>

      {/* Bouton export */}
      <Card className="p-4">
        <button className="w-full flex items-center justify-center gap-2 text-primary font-medium">
          <Icon name="download" size="md" />
          Exporter les données (Excel)
        </button>
      </Card>
    </div>
  );
}
