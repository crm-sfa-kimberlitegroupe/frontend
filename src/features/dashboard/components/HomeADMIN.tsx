import Card from '../../../core/ui/Card';
import KPICard from '../../../core/ui/KPICard';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';

export default function HomeADMIN() {
  const systemStats = {
    pendingPDV: 8,
    activeUsers: 45,
    todayVisits: 127,
    todayOrders: 89,
  };

  const criticalAlerts = [
    { id: 1, type: 'danger', message: '8 PDV en attente de validation', count: 8 },
    { id: 2, type: 'warning', message: '3 vendeurs inactifs depuis 2 jours', count: 3 },
    { id: 3, type: 'info', message: '15 nouvelles commandes à traiter', count: 15 },
  ];

  const recentActivity = [
    { id: 1, user: 'Jean Kouassi', action: 'a créé un nouveau PDV', time: 'Il y a 5 min' },
    { id: 2, user: 'Marie Diallo', action: 'a validé 3 commandes', time: 'Il y a 12 min' },
    { id: 3, user: 'Paul Bamba', action: 'a complété une visite', time: 'Il y a 18 min' },
  ];

  return (
    <div className="pb-20 px-4 pt-6 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Tableau de bord Admin </h1>
        <p className="text-gray-600">
          {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Statistiques système */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <KPICard
          label="PDV en attente"
          value={systemStats.pendingPDV}
          icon="store"
          color="yellow"
        />
        <KPICard
          label="Utilisateurs actifs"
          value={systemStats.activeUsers}
          icon="user"
          color="green"
        />
        <KPICard
          label="Visites aujourd'hui"
          value={systemStats.todayVisits}
          icon="locationMarker"
          color="primary"
        />
        <KPICard
          label="Commandes du jour"
          value={systemStats.todayOrders}
          icon="package"
          color="primary"
        />
      </div>

      {/* Alertes critiques */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Alertes critiques</h3>
        <div className="space-y-2">
          {criticalAlerts.map((alert) => (
            <Card key={alert.id} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <Badge 
                    variant={alert.type as 'danger' | 'warning'} 
                    size="md"
                  >
                    {alert.count}
                  </Badge>
                  <p className="text-sm text-gray-700">{alert.message}</p>
                </div>
                <button className="text-primary text-sm font-medium">
                  Voir →
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Raccourcis actions fréquentes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card className="p-4 text-center">
            <div className="mb-2 flex justify-center">
              <Icon name="user" size="2xl" variant="primary" />
            </div>
            <p className="text-sm font-medium text-gray-900">Créer utilisateur</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="mb-2 flex justify-center">
              <Icon name="store" size="2xl" variant="green" />
            </div>
            <p className="text-sm font-medium text-gray-900">Valider PDV</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="mb-2 flex justify-center">
              <Icon name="map" size="2xl" variant="primary" />
            </div>
            <p className="text-sm font-medium text-gray-900">Créer route</p>
          </Card>
          <Card className="p-4 text-center">
            <div className="mb-2 flex justify-center">
              <Icon name="chartBar" size="2xl" variant="primary" />
            </div>
            <p className="text-sm font-medium text-gray-900">Rapports</p>
          </Card>
        </div>
      </div>

      {/* Activité récente */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Activité récente</h3>
        <Card className="divide-y divide-gray-200">
          {recentActivity.map((activity) => (
            <div key={activity.id} className="p-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-900">
                    <span className="font-medium">{activity.user}</span> {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                </div>
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}
