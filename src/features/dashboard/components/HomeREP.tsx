import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import KPICard from '../../../core/ui/KPICard';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { useAuthStore } from '@/core/auth';

export default function HomeREP() {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [syncStatus] = useState({
    isOnline: true,
    lastSync: new Date(),
  });

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const todayStats = {
    pdvToVisit: 12,
    pdvVisited: 5,
    ordersPlaced: 3,
    revenue: '850k',
    nextVisit: 'Supermarché Plateau',
    distance: '3.2 km',
  };

  const weekStats = {
    totalVisits: 47,
    totalOrders: 28,
    successRate: 85,
    avgOrderValue: '180k',
  };

  const notifications = [
    { id: 1, type: 'warning', message: 'Rupture de stock signalée sur 2 produits', time: '10 min' },
    { id: 2, type: 'info', message: 'Nouvelle promotion disponible jusqu\'au 30 Oct', time: '2h' },
  ];

  const progressPercentage = Math.round((todayStats.pdvVisited / todayStats.pdvToVisit) * 100);

  return (
    <div className="pb-20 pb-safe-bottom px-4 pt-6 bg-gray-50 min-h-screen">
      {/* En-tête sobre et professionnel */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              Bonjour, {user?.firstName || 'Vendeur'}!
            </h1>
            <p className="text-gray-600 text-sm">
              {new Date().toLocaleDateString('fr-FR', { 
                weekday: 'long', 
                day: 'numeric',
                month: 'long',
                year: 'numeric'
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center justify-end gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? 'bg-success animate-pulse' : 'bg-danger'}`} />
              <span className="text-xs text-gray-600">
                {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
            </div>
            <span className="text-xl font-bold text-gray-900">
              {currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>
      </div>

      {/* Résumé de la journée - Design sobre */}
      <Card className="p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Ma journée</h2>
          <Badge variant="primary">{progressPercentage}% complété</Badge>
        </div>
        
        {/* Barre de progression élégante */}
        <div className="mb-5">
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="bg-sky-600 h-2 rounded-full transition-all duration-700"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-5">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon name="checkCircle" size="lg" variant="primary" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{todayStats.pdvVisited}<span className="text-base text-gray-500">/{todayStats.pdvToVisit}</span></p>
            <p className="text-sm text-gray-600 mt-1">PDV visités</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Icon name="package" size="lg" variant="green" />
            </div>
            <p className="text-2xl font-bold text-gray-900">{todayStats.ordersPlaced}</p>
            <p className="text-sm text-gray-600 mt-1">Commandes prises</p>
          </div>
        </div>

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs text-gray-600 mb-1">Prochaine visite</p>
              <p className="font-semibold text-gray-900">{todayStats.nextVisit}</p>
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                <Icon name="locationMarker" size="sm" variant="grey" />
                <span>{todayStats.distance}</span>
              </div>
            </div>
            <Icon name="arrowRight" size="xl" variant="primary" />
          </div>
        </div>
      </Card>

      {/* CTA Principal sobre */}
      <Button 
        variant="primary" 
        size="lg" 
        fullWidth 
        className="mb-6"
      >
        <Icon name="map" size="lg" className="mr-2" />
        <span className="font-medium">Démarrer ma tournée</span>
      </Button>

      {/* KPI Cards - Performance de la semaine */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Icon name="chartBar" size="lg" variant="primary" />
          Performance cette semaine
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <KPICard
            label="Visites totales"
            value={weekStats.totalVisits}
            icon="user"
            color="primary"
            trend={12}
          />
          <KPICard
            label="Commandes"
            value={weekStats.totalOrders}
            icon="cart"
            color="green"
            trend={8}
          />
          <KPICard
            label="Taux de réussite"
            value={weekStats.successRate}
            unit="%"
            icon="chartBar"
            color="yellow"
            trend={5}
          />
          <KPICard
            label="Panier moyen"
            value={weekStats.avgOrderValue}
            unit="FCFA"
            icon="star"
            color="green"
            trend={-3}
          />
        </div>
      </div>

      {/* Notifications sobres */}
      {notifications.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Alertes importantes</h3>
          <div className="space-y-2">
            {notifications.map((notif) => (
              <Card key={notif.id} className="p-3">
                <div className="flex items-start gap-3">
                  <Icon 
                    name={notif.type === 'warning' ? 'warning' : 'checkCircle'}
                    size="lg"
                    variant={notif.type === 'warning' ? 'yellow' : 'primary'}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-700">{notif.message}</p>
                    <p className="text-xs text-gray-500 mt-1">Il y a {notif.time}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Informations complémentaires */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="locationMarker" size="md" variant="primary" />
            <p className="text-xs text-gray-600 font-medium">Météo Abidjan</p>
          </div>
          <p className="text-2xl font-bold text-gray-900">32°C</p>
          <p className="text-sm text-gray-600 mt-1">Ensoleillé</p>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="refresh" size="md" variant="primary" />
            <p className="text-xs text-gray-600 font-medium">Dernière synchro</p>
          </div>
          <p className="text-sm text-gray-900 font-medium mb-2">
            {syncStatus.lastSync.toLocaleTimeString('fr-FR')}
          </p>
          <Button variant="outline" size="sm" fullWidth className="text-xs">
            Synchroniser
          </Button>
        </Card>
      </div>

      {/* Actions rapides - design cohérent */}
      <Card className="p-4">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Actions rapides</h3>
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={() => navigate('/dashboard/visits')}
            className="text-center p-2 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <div className="mb-2 flex justify-center">
              <Icon name="store" size="2xl" variant="primary" />
            </div>
            <p className="text-xs font-medium text-gray-700">Nouveau PDV</p>
          </button>
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Icon name="chartBar" size="2xl" variant="primary" />
            </div>
            <p className="text-xs font-medium text-gray-700">Mes stats</p>
          </div>
          <div className="text-center">
            <div className="mb-2 flex justify-center">
              <Icon name="phone" size="2xl" variant="primary" />
            </div>
            <p className="text-xs font-medium text-gray-700">Support</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
