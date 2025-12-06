/**
 * Service de synchronisation pour la PWA
 * Gere la queue offline, la synchronisation et le cache
 */

export interface PendingRequest {
  id?: number;
  url: string;
  method: string;
  headers: Record<string, string>;
  body: string;
  timestamp: number;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync: Date;
  pendingItems: number;
  storageUsed: number;
  isSyncing: boolean;
}

export interface SyncResult {
  success: boolean;
  url: string;
  error?: string | number;
}

const DB_NAME = 'SFA_OfflineDB';
const DB_VERSION = 1;
const STORE_NAME = 'offlineQueue';
const LAST_SYNC_KEY = 'sfa_last_sync';

class SyncService {
  private db: IDBDatabase | null = null;

  private async openDatabase(): Promise<IDBDatabase> {
    if (this.db) {
      return this.db;
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve(request.result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }

  async getPendingCount(): Promise<number> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.count();

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => resolve(0);
      });
    } catch (error) {
      console.error('[SyncService] Erreur getPendingCount:', error);
      return 0;
    }
  }

  async getPendingRequests(): Promise<PendingRequest[]> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      return new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
    } catch (error) {
      console.error('[SyncService] Erreur getPendingRequests:', error);
      return [];
    }
  }

  async removeFromQueue(id: number): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.delete(id);
    } catch (error) {
      console.error('[SyncService] Erreur removeFromQueue:', error);
    }
  }

  async clearQueue(): Promise<void> {
    try {
      const db = await this.openDatabase();
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      store.clear();
      console.log('[SyncService] Queue videe');
    } catch (error) {
      console.error('[SyncService] Erreur clearQueue:', error);
    }
  }

  getLastSyncDate(): Date {
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    return lastSync ? new Date(lastSync) : new Date();
  }

  private saveLastSyncDate(): void {
    localStorage.setItem(LAST_SYNC_KEY, new Date().toISOString());
  }

  async getStorageUsed(): Promise<number> {
    try {
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        const usedMB = (estimate.usage || 0) / (1024 * 1024);
        return Math.round(usedMB * 10) / 10;
      }
      return 0;
    } catch (error) {
      console.error('[SyncService] Erreur getStorageUsed:', error);
      return 0;
    }
  }

  async getSyncStatus(): Promise<SyncStatus> {
    const [pendingItems, storageUsed] = await Promise.all([
      this.getPendingCount(),
      this.getStorageUsed(),
    ]);

    return {
      isOnline: navigator.onLine,
      lastSync: this.getLastSyncDate(),
      pendingItems,
      storageUsed,
      isSyncing: false,
    };
  }

  async triggerSync(): Promise<SyncResult[]> {
    console.log('[SyncService] Declenchement de la synchronisation...');

    if (!navigator.onLine) {
      console.log('[SyncService] Pas de connexion, synchronisation reportee');
      return [{ success: false, url: '', error: 'Pas de connexion' }];
    }

    if ('serviceWorker' in navigator && 'sync' in ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const syncReg = registration as ServiceWorkerRegistration & { 
          sync?: { register: (tag: string) => Promise<void> } 
        };
        if (syncReg.sync) {
          await syncReg.sync.register('sync-offline-queue');
          console.log('[SyncService] Background Sync declenche');
          this.saveLastSyncDate();
          return [{ success: true, url: 'background-sync' }];
        }
      } catch (error) {
        console.error('[SyncService] Erreur Background Sync:', error);
      }
    }

    return await this.manualSync();
  }

  private async manualSync(): Promise<SyncResult[]> {
    console.log('[SyncService] Synchronisation manuelle...');

    const pendingRequests = await this.getPendingRequests();

    if (pendingRequests.length === 0) {
      console.log('[SyncService] Aucune requete en attente');
      this.saveLastSyncDate();
      return [];
    }

    const results: SyncResult[] = [];

    for (const request of pendingRequests) {
      try {
        const response = await fetch(request.url, {
          method: request.method,
          headers: request.headers,
          body: request.body || undefined,
        });

        if (response.ok) {
          console.log('[SyncService] Requete synchronisee:', request.url);
          if (request.id) {
            await this.removeFromQueue(request.id);
          }
          results.push({ success: true, url: request.url });
        } else {
          console.error('[SyncService] Echec synchronisation:', request.url, response.status);
          results.push({ success: false, url: request.url, error: response.status });
        }
      } catch (error) {
        console.error('[SyncService] Erreur synchronisation:', request.url, error);
        results.push({ success: false, url: request.url, error: String(error) });
      }
    }

    this.saveLastSyncDate();
    console.log('[SyncService] Synchronisation terminee:', results);

    return results;
  }

  async clearAllCaches(): Promise<void> {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map((cacheName) => {
          console.log('[SyncService] Suppression du cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
      console.log('[SyncService] Tous les caches ont ete vides');
    } catch (error) {
      console.error('[SyncService] Erreur clearAllCaches:', error);
    }
  }

  async clearAll(): Promise<void> {
    await Promise.all([
      this.clearQueue(),
      this.clearAllCaches(),
    ]);
    localStorage.removeItem(LAST_SYNC_KEY);
    console.log('[SyncService] Tout a ete vide');
  }

  listenToServiceWorker(callback: (results: SyncResult[]) => void): () => void {
    const handler = (event: MessageEvent) => {
      if (event.data.type === 'SYNC_COMPLETE') {
        console.log('[SyncService] Synchronisation completee:', event.data.results);
        this.saveLastSyncDate();
        callback(event.data.results);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handler);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handler);
      }
    };
  }
}

export const syncService = new SyncService();
