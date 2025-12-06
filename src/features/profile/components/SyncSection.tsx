import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';

interface SyncSectionProps {
  syncStatus: {
    isOnline: boolean;
    lastSync: Date;
    pendingItems: number;
    storageUsed: number;
    isSyncing?: boolean;
  };
  onSync: () => void;
  onClearCache: () => void;
}

export default function SyncSection({ syncStatus, onSync, onClearCache }: SyncSectionProps) {
  return (
    <Card className="p-5 mb-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100 bg-gradient-to-br from-white to-cyan-50/30">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl flex items-center justify-center">
          <Icon name="refresh" size="lg" variant="primary" />
        </div>
        <h2 className="text-lg font-bold text-gray-900">Synchronisation</h2>
      </div>
      
      <div className="space-y-3 mb-5">
        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl shadow-sm">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Icon name="locationMarker" size="sm" variant="grey" />
            <span>Statut connexion</span>
          </span>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${syncStatus.isOnline ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500'}`} />
            <span className={`text-sm font-semibold ${syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
              {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl shadow-sm">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Icon name="clock" size="sm" variant="grey" />
            <span>Dernière sync</span>
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {syncStatus.lastSync.toLocaleTimeString('fr-FR')}
          </span>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl shadow-sm">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Icon name="clock" size="sm" variant="grey" />
            <span>Données en attente</span>
          </span>
          <Badge variant="warning" className="font-bold">{syncStatus.pendingItems}</Badge>
        </div>

        <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl shadow-sm">
          <span className="text-sm text-gray-600 flex items-center gap-2">
            <Icon name="disk" size="sm" variant="grey" />
            <span>Stockage local</span>
          </span>
          <span className="text-sm font-semibold text-gray-900">
            {syncStatus.storageUsed} MB
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <Button 
          variant="primary" 
          size="lg" 
          fullWidth 
          onClick={onSync}
          disabled={syncStatus.isSyncing || !syncStatus.isOnline}
          className="bg-primary text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95 py-4 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <Icon 
              name="refresh" 
              size="md" 
              variant="white" 
              className={syncStatus.isSyncing ? 'animate-spin' : ''}
            />
            <span>{syncStatus.isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}</span>
          </span>
        </Button>
        <Button 
          variant="outline" 
          size="md" 
          fullWidth 
          onClick={onClearCache}
          disabled={syncStatus.isSyncing}
          className="bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors py-3 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span className="flex items-center justify-center gap-2">
            <Icon name="x" size="md" variant="red" />
            <span>Vider le cache</span>
          </span>
        </Button>
      </div>
    </Card>
  );
}
