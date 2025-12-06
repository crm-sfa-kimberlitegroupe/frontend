import { useEffect, useState } from 'react';
import { Icon } from '../ui/Icon';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { syncService } from '../services/syncService';

export default function OfflineIndicator() {
  const networkStatus = useNetworkStatus();
  const [showBanner, setShowBanner] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);

  useEffect(() => {
    setShowBanner(!networkStatus.isOnline);
  }, [networkStatus.isOnline]);

  useEffect(() => {
    const loadPendingRequestsCount = async () => {
      const count = await syncService.getPendingCount();
      setPendingRequests(count);
    };

    loadPendingRequestsCount();
    
    // Ecouter les messages du Service Worker
    const cleanup = syncService.listenToServiceWorker((results) => {
      const successCount = results.filter(r => r.success).length;
      if (successCount > 0) {
        console.log(`[OfflineIndicator] ${successCount} requetes synchronisees avec succes`);
      }
      loadPendingRequestsCount();
    });
    
    return cleanup;
  }, []);


  const getConnectionQuality = () => {
    if (!networkStatus.isOnline) return null;
    
    const type = networkStatus.effectiveType;
    if (type === '4g') return { text: '4G', color: 'text-green-600' };
    if (type === '3g') return { text: '3G', color: 'text-yellow-600' };
    if (type === '2g') return { text: '2G', color: 'text-orange-600' };
    if (type === 'slow-2g') return { text: 'Lent', color: 'text-red-600' };
    return null;
  };

  const connectionQuality = getConnectionQuality();

  if (!showBanner && pendingRequests === 0) {
    return null;
  }

  return (
    <>
      {/* Bannière offline */}
      {showBanner && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-500 text-white px-4 py-2 shadow-lg">
          <div className="flex items-center justify-between max-w-7xl mx-auto">
            <div className="flex items-center gap-2">
              <Icon name="warning" size="sm" />
              <span className="text-sm font-medium">
                Mode hors ligne
              </span>
            </div>
            <div className="text-xs">
              Vos actions seront synchronisées automatiquement
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de requêtes en attente */}
      {pendingRequests > 0 && (
        <div className="fixed bottom-20 right-4 z-50">
          <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
            <div className="animate-spin">
              <Icon name="refresh" size="sm" />
            </div>
            <span className="text-sm font-medium">
              {pendingRequests} action{pendingRequests > 1 ? 's' : ''} en attente
            </span>
          </div>
        </div>
      )}

      {/* Indicateur de qualité de connexion (petit badge en haut à droite) */}
      {connectionQuality && networkStatus.isOnline && (
        <div className="fixed top-4 right-4 z-40">
          <div className={`bg-white rounded-full px-2 py-1 shadow-md border border-gray-200 flex items-center gap-1 ${connectionQuality.color}`}>
            <Icon name="checkCircle" size="xs" />
            <span className="text-xs font-medium">{connectionQuality.text}</span>
          </div>
        </div>
      )}
    </>
  );
}
