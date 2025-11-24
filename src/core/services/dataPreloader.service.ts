/**
 * Service de préchargement centralisé
 * Charge toutes les données nécessaires après la connexion
 * pour une navigation fluide sans temps d'attente
 */

import { useAuthStore } from '@/core/auth';
import { useOrdersStore } from '@/features/orders/stores/ordersStore';
import { useVisitsStore } from '@/features/visits/stores/visitsStore';
import { useOutletsStore } from '@/features/outlets/stores/outletsStore';
import { useProductsStore } from '@/features/products/stores/productsStore';
import { useVendorStockStore } from '@/features/vendor-stock/stores/vendorStockStore';
import { useRoutesStore } from '@/features/routes/stores/routesStore';
import { useStatsStore } from '@/features/stats/stores/statsStore';
// Tous les stores sont maintenant créés !
import { vendorStockService } from '@/features/vendor-stock/services/vendorStockService';

export interface PreloadProgress {
  total: number;
  loaded: number;
  percentage: number;
  currentTask: string;
  isComplete: boolean;
  error?: string;
}

class DataPreloaderService {
  private isPreloading = false;
  private preloadPromise: Promise<void> | null = null;
  private progressCallbacks: ((progress: PreloadProgress) => void)[] = [];

  /**
   * Enregistrer un callback pour suivre la progression
   */
  onProgress(callback: (progress: PreloadProgress) => void) {
    this.progressCallbacks.push(callback);
    return () => {
      this.progressCallbacks = this.progressCallbacks.filter(cb => cb !== callback);
    };
  }

  /**
   * Notifier la progression
   */
  private notifyProgress(progress: PreloadProgress) {
    this.progressCallbacks.forEach(cb => cb(progress));
  }

  /**
   * Précharger toutes les données de l'application
   */
  async preloadAllData(): Promise<void> {
    // Éviter les préchargements multiples
    if (this.isPreloading && this.preloadPromise) {
      return this.preloadPromise;
    }

    this.isPreloading = true;
    
    this.preloadPromise = this.performPreload();
    
    try {
      await this.preloadPromise;
    } finally {
      this.isPreloading = false;
      this.preloadPromise = null;
    }
  }

  /**
   * Effectuer le préchargement
   */
  private async performPreload(): Promise<void> {
    const tasks = [
      { name: 'Chargement des commandes du jour', load: () => this.loadTodayOrders() },
      { name: 'Chargement des visites', load: () => this.loadVisits() },
      { name: 'Chargement des points de vente', load: () => this.loadOutlets() },
      { name: 'Chargement du stock vendeur', load: () => this.loadVendorStock() },
      { name: 'Chargement des produits', load: () => this.loadProducts() },
      { name: 'Chargement de la route du jour', load: () => this.loadTodayRoute() },
      { name: 'Chargement des statistiques', load: () => this.loadStats() },
      { name: 'Chargement des alertes de stock', load: () => this.loadLowStockAlerts() },
    ];

    const total = tasks.length;
    let loaded = 0;

    for (const task of tasks) {
      try {
        this.notifyProgress({
          total,
          loaded,
          percentage: Math.round((loaded / total) * 100),
          currentTask: task.name,
          isComplete: false
        });

        await task.load();
        loaded++;

        this.notifyProgress({
          total,
          loaded,
          percentage: Math.round((loaded / total) * 100),
          currentTask: task.name,
          isComplete: loaded === total
        });
      } catch (error) {
        console.error(`Erreur lors de: ${task.name}`, error);
        // Continuer même si une tâche échoue
        loaded++;
      }
    }

    // Marquer le préchargement comme terminé dans le localStorage
    localStorage.setItem('dataPreloaded', 'true');
    localStorage.setItem('dataPreloadedAt', new Date().toISOString());
  }

  /**
   * Charger les commandes du jour
   */
  private async loadTodayOrders(): Promise<void> {
    const ordersStore = useOrdersStore.getState();
    
    // Vérifier si déjà chargé pour aujourd'hui
    if (!ordersStore.isDataLoadedForToday()) {
      await ordersStore.loadTodayOrders();
    }
  }

  /**
   * Charger les visites
   */
  private async loadVisits(): Promise<void> {
    // const visitsStore = useVisitsStore.getState();
    const authStore = useAuthStore.getState();
    const user = authStore.user;

    if (user?.role === 'REP') {
      // TODO: Implémenter le chargement des visites quand les méthodes seront disponibles
      // await visitsStore.loadActiveVisits();
      // await visitsStore.loadVisitHistory({
      //   startDate: today,
      //   endDate: today
      // });
      
      console.log('Chargement des visites...');
    }
  }

  /**
   * Charger les points de vente
   */
  private async loadOutlets(): Promise<void> {
    const outletsStore = useOutletsStore.getState();
    
    try {
      // Charger tous les PDV assignés
      await outletsStore.loadOutlets();
      
      // Charger aussi les statistiques
      await outletsStore.loadOutletStats();
    } catch (error) {
      console.error('Erreur chargement outlets:', error);
    }
  }

  /**
   * Charger le stock vendeur
   */
  private async loadVendorStock(): Promise<void> {
    const vendorStockStore = useVendorStockStore.getState();
    
    try {
      // Charger toutes les données du stock vendeur
      await Promise.all([
        vendorStockStore.loadStock(),
        vendorStockStore.loadStats(),
        vendorStockStore.loadLowStockItems(10)
      ]);
    } catch (error) {
      console.error('Erreur chargement stock vendeur:', error);
    }
  }

  /**
   * Charger les produits
   */
  private async loadProducts(): Promise<void> {
    const productsStore = useProductsStore.getState();
    
    try {
      // Charger tous les produits et leurs données associées
      await Promise.all([
        productsStore.loadProducts(),
        productsStore.loadSKUs(),
        productsStore.loadBrands(),
        productsStore.loadCategories(),
        productsStore.loadProductStats()
      ]);
    } catch (error) {
      console.error('Erreur chargement produits:', error);
    }
  }

  /**
   * Charger la route du jour
   */
  private async loadTodayRoute(): Promise<void> {
    const routesStore = useRoutesStore.getState();
    const authStore = useAuthStore.getState();
    const user = authStore.user;

    if (user?.id) {
      try {
        // Charger la route du jour et les statistiques
        await Promise.all([
          routesStore.loadTodayRoute(user.id),
          routesStore.loadRouteStats()
        ]);
      } catch (error) {
        console.error('Erreur chargement route:', error);
      }
    }
  }

  /**
   * Charger les statistiques
   */
  private async loadStats(): Promise<void> {
    const statsStore = useStatsStore.getState();
    
    try {
      // Charger toutes les statistiques importantes
      const today = new Date().toISOString().split('T')[0];
      const currentMonth = (new Date().getMonth() + 1).toString().padStart(2, '0');
      const currentYear = new Date().getFullYear();
      
      await Promise.all([
        statsStore.loadDailyStats(today),
        statsStore.loadWeeklyStats(today),
        statsStore.loadMonthlyStats(currentMonth, currentYear),
        statsStore.loadKPIStats()
      ]);
    } catch (error) {
      console.error('Erreur chargement stats:', error);
    }
  }

  /**
   * Charger les alertes de stock faible
   */
  private async loadLowStockAlerts(): Promise<void> {
    try {
      const lowStockItems = await vendorStockService.getLowStockItems(10);
      
      // Stocker dans le localStorage pour accès rapide
      localStorage.setItem('lowStockAlerts', JSON.stringify(lowStockItems));
      localStorage.setItem('lowStockAlertsUpdatedAt', new Date().toISOString());
    } catch (error) {
      console.error('Erreur chargement alertes stock:', error);
    }
  }

  /**
   * Vérifier si les données sont déjà préchargées
   */
  isDataPreloaded(): boolean {
    const preloaded = localStorage.getItem('dataPreloaded');
    const preloadedAt = localStorage.getItem('dataPreloadedAt');
    
    if (!preloaded || !preloadedAt) {
      return false;
    }

    // Vérifier si le préchargement date d'aujourd'hui
    const preloadDate = new Date(preloadedAt);
    const today = new Date();
    
    return preloadDate.toDateString() === today.toDateString();
  }

  /**
   * Réinitialiser le cache de préchargement
   */
  clearPreloadCache(): void {
    localStorage.removeItem('dataPreloaded');
    localStorage.removeItem('dataPreloadedAt');
    localStorage.removeItem('lowStockAlerts');
    localStorage.removeItem('lowStockAlertsUpdatedAt');
    
    // Réinitialiser tous les stores
    useOrdersStore.getState().clearOrders();
    useVisitsStore.getState().clearVisit('');
    useOutletsStore.getState().clearOutlets();
    useProductsStore.getState().clearProducts();
    useVendorStockStore.getState().clearStock();
    useRoutesStore.getState().clearRoute();
    useStatsStore.getState().clearStats();
    // Tous les stores sont maintenant intégrés !
  }

  /**
   * Rafraîchir une partie spécifique des données
   */
  async refreshData(dataType: 'orders' | 'visits' | 'stock' | 'all'): Promise<void> {
    switch (dataType) {
      case 'orders':
        await this.loadTodayOrders();
        break;
      case 'visits':
        await this.loadVisits();
        break;
      case 'stock':
        await this.loadVendorStock();
        await this.loadLowStockAlerts();
        break;
      case 'all':
        await this.preloadAllData();
        break;
    }
  }
}

export const dataPreloaderService = new DataPreloaderService();
