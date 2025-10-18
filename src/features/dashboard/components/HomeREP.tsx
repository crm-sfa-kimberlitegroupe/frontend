import { useState } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import { Icon } from '../../../core/ui/Icon';

export default function HomeREP() {
  const [syncStatus] = useState({
    isOnline: true,
    lastSync: new Date(),
  });

  const todayStats = {
    pdvToVisit: 12,
    pdvVisited: 5,
    ordersPlaced: 3,
    nextVisit: 'Supermarché Plateau',
  };

  const notifications = [
    { id: 1, type: 'warning', message: 'Rupture de stock signalée sur 2 produits' },
    { id: 2, type: 'info', message: 'Nouvelle promotion disponible' },
  ];

  return (
    <div className="pb-20 px-4 pt-6 bg-gray-50 min-h-screen">
      {/* En-tête avec statut */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            Bonjour, Vendeur!
            <Icon name="user" size="lg" variant="primary" />
          </h1>
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? 'bg-success animate-pulse' : 'bg-danger'}`} />
            <span className="text-sm text-gray-600">
              {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Résumé de la journée */}
      <Card className="p-4 mb-4 bg-gradient-to-br from-primary to-sky-500 text-white">
        <h2 className="text-lg font-semibold mb-4">Ma journée</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-3xl font-bold">{todayStats.pdvVisited}/{todayStats.pdvToVisit}</p>
            <p className="text-sm opacity-90">PDV visités</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{todayStats.ordersPlaced}</p>
            <p className="text-sm opacity-90">Commandes prises</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs opacity-75">Prochaine visite</p>
              <p className="font-semibold">{todayStats.nextVisit}</p>
            </div>
            <Icon name="locationMarker" size="xl" variant="white" />
          </div>
        </div>
      </Card>

      {/* CTA Principal */}
      <Button variant="success" size="lg" fullWidth className="mb-6 shadow-lg">
        <Icon name="map" size="lg" className="mr-2" />
        Démarrer la route
      </Button>

      {/* Notifications */}
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
                  <p className="text-sm text-gray-700 flex-1">{notif.message}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Météo et infos */}
      <Card className="p-4 mb-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Météo à Abidjan</p>
            <p className="text-2xl font-bold text-gray-900">32°C</p>
            <p className="text-sm text-gray-600 flex items-center gap-1">
              Ensoleillé
              <Icon name="star" size="sm" variant="yellow" />
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Heure actuelle</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
        </div>
      </Card>

      {/* Statut de synchronisation */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">Dernière synchronisation</p>
            <p className="text-xs text-gray-600">
              {syncStatus.lastSync.toLocaleTimeString('fr-FR')}
            </p>
          </div>
          <Button variant="outline" size="sm">
            Synchroniser
          </Button>
        </div>
      </Card>
    </div>
  );
}
