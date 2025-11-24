/**
 * Service IndexedDB pour le stockage local des données
 * Permet de stocker de grandes quantités de données de manière performante
 */

interface DBConfig {
  name: string;
  version: number;
  stores: {
    name: string;
    keyPath: string;
    indexes?: { name: string; keyPath: string; unique?: boolean }[];
  }[];
}

class IndexedDBService {
  private db: IDBDatabase | null = null;
  private readonly dbConfig: DBConfig = {
    name: 'SFA_Mobile_DB',
    version: 1,
    stores: [
      {
        name: 'orders',
        keyPath: 'id',
        indexes: [
          { name: 'createdAt', keyPath: 'createdAt' },
          { name: 'userId', keyPath: 'userId' },
          { name: 'outletId', keyPath: 'outletId' }
        ]
      },
      {
        name: 'visits',
        keyPath: 'id',
        indexes: [
          { name: 'outletId', keyPath: 'outletId' },
          { name: 'status', keyPath: 'status' },
          { name: 'startedAt', keyPath: 'startedAt' }
        ]
      },
      {
        name: 'outlets',
        keyPath: 'id',
        indexes: [
          { name: 'name', keyPath: 'name' },
          { name: 'sectorId', keyPath: 'sectorId' },
          { name: 'ville', keyPath: 'ville' }
        ]
      },
      {
        name: 'products',
        keyPath: 'id',
        indexes: [
          { name: 'name', keyPath: 'name' },
          { name: 'categoryId', keyPath: 'categoryId' },
          { name: 'brandId', keyPath: 'brandId' }
        ]
      },
      {
        name: 'vendorStock',
        keyPath: 'id',
        indexes: [
          { name: 'skuId', keyPath: 'skuId' },
          { name: 'quantity', keyPath: 'quantity' },
          { name: 'alertThreshold', keyPath: 'alertThreshold' }
        ]
      },
      {
        name: 'routes',
        keyPath: 'id',
        indexes: [
          { name: 'date', keyPath: 'date' },
          { name: 'userId', keyPath: 'userId' },
          { name: 'status', keyPath: 'status' }
        ]
      },
      {
        name: 'stats',
        keyPath: 'id',
        indexes: [
          { name: 'date', keyPath: 'date' },
          { name: 'type', keyPath: 'type' }
        ]
      },
      {
        name: 'cache',
        keyPath: 'key',
        indexes: [
          { name: 'expiresAt', keyPath: 'expiresAt' }
        ]
      }
    ]
  };

  /**
   * Initialiser la base de données
   */
  async init(): Promise<void> {
    if (this.db) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbConfig.name, this.dbConfig.version);

      request.onerror = () => {
        console.error('Erreur lors de l\'ouverture d\'IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('IndexedDB initialisé avec succès');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Créer les stores si ils n'existent pas
        for (const storeConfig of this.dbConfig.stores) {
          if (!db.objectStoreNames.contains(storeConfig.name)) {
            const store = db.createObjectStore(storeConfig.name, {
              keyPath: storeConfig.keyPath
            });

            // Créer les index
            if (storeConfig.indexes) {
              for (const index of storeConfig.indexes) {
                store.createIndex(index.name, index.keyPath, {
                  unique: index.unique || false
                });
              }
            }
          }
        }
      };
    });
  }

  /**
   * Obtenir un store
   */
  private getStore(storeName: string, mode: IDBTransactionMode = 'readonly'): IDBObjectStore {
    if (!this.db) {
      throw new Error('IndexedDB n\'est pas initialisé');
    }

    const transaction = this.db.transaction([storeName], mode);
    return transaction.objectStore(storeName);
  }

  /**
   * Sauvegarder des données dans un store
   */
  async save<T>(storeName: string, data: T | T[]): Promise<void> {
    const store = this.getStore(storeName, 'readwrite');
    const items = Array.isArray(data) ? data : [data];

    return new Promise((resolve, reject) => {
      const transaction = store.transaction;
      
      for (const item of items) {
        store.put(item);
      }

      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  }

  /**
   * Récupérer toutes les données d'un store
   */
  async getAll<T>(storeName: string): Promise<T[]> {
    const store = this.getStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Récupérer un élément par ID
   */
  async getById<T>(storeName: string, id: string): Promise<T | undefined> {
    const store = this.getStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.get(id);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Récupérer des éléments par index
   */
  async getByIndex<T>(
    storeName: string,
    indexName: string,
    value: any
  ): Promise<T[]> {
    const store = this.getStore(storeName);
    const index = store.index(indexName);

    return new Promise((resolve, reject) => {
      const request = index.getAll(value);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Supprimer un élément
   */
  async delete(storeName: string, id: string): Promise<void> {
    const store = this.getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Vider un store
   */
  async clear(storeName: string): Promise<void> {
    const store = this.getStore(storeName, 'readwrite');

    return new Promise((resolve, reject) => {
      const request = store.clear();
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Compter les éléments d'un store
   */
  async count(storeName: string): Promise<number> {
    const store = this.getStore(storeName);

    return new Promise((resolve, reject) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Sauvegarder dans le cache avec expiration
   */
  async saveToCache(key: string, data: any, ttlMinutes: number = 60): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + ttlMinutes);

    await this.save('cache', {
      key,
      data,
      expiresAt: expiresAt.toISOString(),
      createdAt: new Date().toISOString()
    });
  }

  /**
   * Récupérer depuis le cache
   */
  async getFromCache<T>(key: string): Promise<T | null> {
    const cached = await this.getById<{
      key: string;
      data: T;
      expiresAt: string;
    }>('cache', key);

    if (!cached) return null;

    // Vérifier l'expiration
    if (new Date(cached.expiresAt) < new Date()) {
      await this.delete('cache', key);
      return null;
    }

    return cached.data;
  }

  /**
   * Nettoyer le cache expiré
   */
  async cleanExpiredCache(): Promise<void> {
    const store = this.getStore('cache', 'readwrite');
    const index = store.index('expiresAt');
    const now = new Date().toISOString();

    return new Promise((resolve, reject) => {
      const range = IDBKeyRange.upperBound(now);
      const request = index.openCursor(range);

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest).result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        } else {
          resolve();
        }
      };

      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Fermer la base de données
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }

  /**
   * Supprimer complètement la base de données
   */
  async deleteDatabase(): Promise<void> {
    this.close();
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbConfig.name);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  /**
   * Vérifier si IndexedDB est supporté
   */
  isSupported(): boolean {
    return 'indexedDB' in window;
  }

  /**
   * Obtenir la taille estimée de la base de données
   */
  async getStorageEstimate(): Promise<{ usage?: number; quota?: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      return await navigator.storage.estimate();
    }
    return {};
  }
}

export const indexedDBService = new IndexedDBService();
