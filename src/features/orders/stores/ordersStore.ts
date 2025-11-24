import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Order } from '../types/order.types';

export interface DailyOrderStats {
  date: string;
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  averageOrderValue: number;
}

interface OrdersStore {
  // État des commandes
  orders: Order[];
  todayOrders: Order[];
  dailyStats: DailyOrderStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  removeOrder: (orderId: string) => void;
  setOrders: (orders: Order[]) => void;
  
  // Actions pour les statistiques du jour
  loadTodayOrders: () => Promise<void>;
  calculateDailyStats: () => void;
  getTodayOrdersCount: () => number;
  getTodayRevenue: () => number;
  
  // Actions utilitaires
  clearOrders: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  isDataLoadedForToday: () => boolean;
}

export const useOrdersStore = create<OrdersStore>()(
  persist(
    (set, get) => ({
      // État initial
      orders: [],
      todayOrders: [],
      dailyStats: null,
      isLoading: false,
      error: null,
      
      // Ajouter une nouvelle commande (sans appel API)
      addOrder: (order: Order) => {
        set((state) => {
          const newOrders = [...state.orders, order];
          const today = new Date().toISOString().split('T')[0];
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          
          // Si c'est une commande d'aujourd'hui, l'ajouter aux commandes du jour
          const newTodayOrders = orderDate === today 
            ? [...state.todayOrders, order]
            : state.todayOrders;
          
          return {
            orders: newOrders,
            todayOrders: newTodayOrders,
          };
        });
        
        // Recalculer les statistiques automatiquement
        get().calculateDailyStats();
      },
      
      // Mettre à jour une commande
      updateOrder: (orderId: string, updates: Partial<Order>) => {
        set((state) => ({
          orders: state.orders.map(order => 
            order.id === orderId ? { ...order, ...updates } : order
          ),
          todayOrders: state.todayOrders.map(order => 
            order.id === orderId ? { ...order, ...updates } : order
          ),
        }));
        
        get().calculateDailyStats();
      },
      
      // Supprimer une commande
      removeOrder: (orderId: string) => {
        set((state) => ({
          orders: state.orders.filter(order => order.id !== orderId),
          todayOrders: state.todayOrders.filter(order => order.id !== orderId),
        }));
        
        get().calculateDailyStats();
      },
      
      // Définir toutes les commandes
      setOrders: (orders: Order[]) => {
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(order => {
          const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
          return orderDate === today;
        });
        
        set({
          orders,
          todayOrders,
        });
        
        get().calculateDailyStats();
      },
      
      // Charger les commandes du jour (depuis l'API)
      loadTodayOrders: async () => {
        try {
          set({ isLoading: true, error: null });
          
          // Import dynamique pour éviter les dépendances circulaires
          const { ordersService } = await import('../services/orders.service');
          
          const today = new Date().toISOString().split('T')[0];
          
          // Créer des objets Date complets pour l'API
          const startOfDay = new Date(today + 'T00:00:00.000Z');
          const endOfDay = new Date(today + 'T23:59:59.999Z');
          
          
          const orders = await ordersService.getMyOrders({
            startDate: startOfDay.toISOString(),
            endDate: endOfDay.toISOString(),
          });
          
          
          set((state) => ({
            todayOrders: orders,
            orders: [
              ...state.orders.filter(order => {
                const orderDate = new Date(order.createdAt).toISOString().split('T')[0];
                return orderDate !== today;
              }),
              ...orders
            ],
            isLoading: false,
          }));
          
          // TOUJOURS calculer les stats après chargement (même si 0 commandes)
          get().calculateDailyStats();
          
        } catch (error) {
          console.error('[OrdersStore] Erreur chargement commandes du jour:', error);
          set({ 
            error: error instanceof Error ? error.message : 'Erreur inconnue',
            isLoading: false 
          });
        }
      },
      
      // Calculer les statistiques du jour
      calculateDailyStats: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        const totalOrders = state.todayOrders.length;
        const totalRevenue = state.todayOrders.reduce((sum, order) => {
          const amount = typeof order.totalTtc === 'string' ? parseFloat(order.totalTtc) : order.totalTtc;
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        const totalItems = state.todayOrders.reduce((sum, order) => {
          return sum + (order.orderLines?.reduce((lineSum, line) => lineSum + line.qty, 0) || 0);
        }, 0);
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        const dailyStats: DailyOrderStats = {
          date: today,
          totalOrders,
          totalRevenue,
          totalItems,
          averageOrderValue,
        };
        
        set({ dailyStats });
      },
      
      // Obtenir le nombre de commandes du jour
      getTodayOrdersCount: () => {
        return get().todayOrders.length;
      },
      
      // Obtenir le chiffre d'affaires du jour
      getTodayRevenue: () => {
        const orders = get().todayOrders;
        const revenue = orders.reduce((sum, order) => {
          // Convertir totalTtc en nombre (il arrive comme string depuis l'API)
          const amount = typeof order.totalTtc === 'string' ? parseFloat(order.totalTtc) : order.totalTtc;
          return sum + (isNaN(amount) ? 0 : amount);
        }, 0);
        
        return revenue;
      },
      
      // Vider toutes les commandes
      clearOrders: () => {
        set({
          orders: [],
          todayOrders: [],
          dailyStats: null,
        });
      },
      
      // Définir l'état de chargement
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      // Définir l'erreur
      setError: (error: string | null) => {
        set({ error });
      },
      
      // Vérifier si les données ont déjà été chargées pour aujourd'hui
      isDataLoadedForToday: () => {
        const state = get();
        const today = new Date().toISOString().split('T')[0];
        
        // Vérifier si on a des statistiques ET qu'elles correspondent à aujourd'hui
        // ET qu'on a fait au moins un appel API (même si 0 résultat)
        if (state.dailyStats && state.dailyStats.date === today) {
          return true;
        }
        
        return false;
      },
    }),
    {
      name: 'orders-storage',
      partialize: (state) => ({
        // Persister seulement les données, pas les états de chargement
        orders: state.orders,
        todayOrders: state.todayOrders,
        dailyStats: state.dailyStats,
      }),
    }
  )
);
