import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../../../core/ui/Card';
import KPICard from '../../../core/ui/KPICard';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { useAdminDashboardStore, isCacheValid } from '../stores/adminDashboardStore';
import { adminDashboardService } from '../services/adminDashboardService';

export default function HomeADMIN() {
  const navigate = useNavigate();
  const { stats, activities, alerts, isLoading, lastUpdated, setStats, setActivities, setAlerts, setLoading, setError } = useAdminDashboardStore();

  useEffect(() => {
    const loadDashboardData = async () => {
      // Vérifier si le cache est valide
      if (stats && isCacheValid(lastUpdated)) {
        console.log('[HomeADMIN] Utilisation des données en cache');
        return;
      }

      try {
        console.log('[HomeADMIN] Chargement des données dashboard...');
        setLoading(true);
        const { stats: newStats, activities: newActivities, alerts: newAlerts } = await adminDashboardService.loadAllStats();
        
        setStats(newStats);
        setActivities(newActivities);
        setAlerts(newAlerts);
        console.log('[HomeADMIN] Données chargées avec succès');
      } catch (error) {
        console.error('[HomeADMIN] Erreur chargement dashboard:', error);
        setError(error instanceof Error ? error.message : 'Erreur de chargement');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [stats, lastUpdated, setLoading, setStats, setActivities, setAlerts, setError]);

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

      {/* Statistiques systeme */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <KPICard
          label="PDV en attente"
          value={isLoading || !stats ? '--' : stats.pendingPDV}
          icon="store"
          color="yellow"
        />
        <KPICard
          label="Utilisateurs actifs"
          value={isLoading || !stats ? '--' : stats.activeUsers}
          icon="user"
          color="green"
        />
        <KPICard
          label="Visites aujourd'hui"
          value={isLoading || !stats ? '--' : stats.todayVisits}
          icon="locationMarker"
          color="primary"
        />
        <KPICard
          label="Commandes du jour"
          value={isLoading || !stats ? '--' : stats.todayOrders}
          icon="package"
          color="primary"
        />
      </div>

      {/* Alertes critiques */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Alertes critiques</h3>
        <div className="space-y-2">
          {isLoading ? (
            <Card className="p-4">
              <p className="text-sm text-gray-500 text-center">Chargement des alertes...</p>
            </Card>
          ) : alerts.length === 0 ? (
            <Card className="p-4">
              <div className="flex items-center gap-3">
                <Icon name="checkCircle" size="lg" variant="green" />
                <p className="text-sm text-gray-700">Aucune alerte critique</p>
              </div>
            </Card>
          ) : (
            alerts.map((alert) => (
              <Card 
                key={alert.id} 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => alert.link && navigate(alert.link)}
              >
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
                    Voir
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Raccourcis actions frequentes */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Actions rapides</h3>
        <div className="grid grid-cols-2 gap-3">
          <Card 
            className="p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/dashboard/users')}
          >
            <div className="mb-2 flex justify-center">
              <Icon name="user" size="2xl" variant="primary" />
            </div>
            <p className="text-sm font-medium text-gray-900">Creer utilisateur</p>
          </Card>
          <Card 
            className="p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/dashboard/pdv?status=PENDING')}
          >
            <div className="mb-2 flex justify-center">
              <Icon name="store" size="2xl" variant="green" />
            </div>
            <p className="text-sm font-medium text-gray-900">Valider PDV</p>
          </Card>
          <Card 
            className="p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/dashboard/route')}
          >
            <div className="mb-2 flex justify-center">
              <Icon name="map" size="2xl" variant="primary" />
            </div>
            <p className="text-sm font-medium text-gray-900">Creer route</p>
          </Card>
          <Card 
            className="p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => navigate('/dashboard/reports')}
          >
            <div className="mb-2 flex justify-center">
              <Icon name="chartBar" size="2xl" variant="primary" />
            </div>
            <p className="text-sm font-medium text-gray-900">Rapports</p>
          </Card>
        </div>
      </div>

      {/* Activite recente */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">Activite recente</h3>
        <Card className="divide-y divide-gray-200">
          {isLoading ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">Chargement...</p>
            </div>
          ) : activities.length === 0 ? (
            <div className="p-4 text-center">
              <p className="text-sm text-gray-500">Aucune activite recente</p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user}</span> {activity.action}
                      {activity.pdv && <span className="text-gray-600"> - {activity.pdv}</span>}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
