import { create } from 'zustand';
import type { User, UserPerformance, ManagerInfo } from '../services/usersService';

interface UsersState {
  // États
  currentUser: User | null;
  userPerformance: UserPerformance | null;
  managerInfo: ManagerInfo | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  loadCurrentUser: (userId: string) => Promise<void>;
  loadUserPerformance: (userId: string) => Promise<void>;
  loadManagerInfo: (userId: string) => Promise<void>;
  loadAllUserData: (userId: string, userRole: string) => Promise<void>;
  updateUser: (userId: string, data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

export const useUsersStore = create<UsersState>((set, get) => ({
  // États initiaux
  currentUser: null,
  userPerformance: null,
  managerInfo: null,
  isLoading: false,
  error: null,

  // Charger les données de l'utilisateur actuel
  loadCurrentUser: async (userId: string) => {
    try {
      // Simuler des données utilisateur (remplacer par vraie API plus tard)
      await new Promise(resolve => setTimeout(resolve, 200));
      
      const mockUser: User = {
        id: userId,
        email: 'kouassi.kouassi@sfa-ci.com',
        firstName: 'Kouassi',
        lastName: 'Kouassi',
        role: 'REP',
        phone: '+225 01 02 03 04',
        photoUrl: null,
        territory: 'Zone Abidjan Nord',
        territoryName: 'Zone Abidjan Nord',
        territoryId: 'territory-1',
        assignedSectorId: 'sector-1',
        matricule: 'REP-001',
        hireDate: '2023-01-15',
        manager: 'Admin Zone Abidjan',
        managerId: 'admin-1',
        isActive: true,
        status: 'ACTIVE',
        lastLogin: new Date().toISOString(),
      };

      set({ currentUser: mockUser });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement de l\'utilisateur',
        currentUser: null 
      });
    }
  },

  // Charger les performances de l'utilisateur
  loadUserPerformance: async (userId: string) => {
    try {
      // Simuler des données de performance
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const mockPerformance: UserPerformance = {
        coverage: 85.5,
        strikeRate: 72.3,
        visitsThisMonth: 45,
        salesThisMonth: 125000,
        perfectStoreScore: 78.9,
        totalOutlets: 52,
        visitedOutlets: 45,
        ordersThisMonth: 38,
        averageOrderValue: 3289.47,
      };

      set({ userPerformance: mockPerformance });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des performances',
        userPerformance: null 
      });
    }
  },

  // Charger les informations du manager
  loadManagerInfo: async (userId: string) => {
    try {
      // Simuler des données du manager
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const mockManager: ManagerInfo = {
        id: 'admin-1',
        firstName: 'Koffi',
        lastName: 'Kouadio',
        email: 'admin.zone-abidjan@sfa-ci.com',
        phone: '+225 05 06 07 08',
        role: 'ADMIN',
        photoUrl: null,
      };

      set({ managerInfo: mockManager });
    } catch (error) {
      // Manager optionnel - pas d'erreur si non trouvé
      set({ managerInfo: null });
    }
  },

  // Charger toutes les données utilisateur en parallèle (optimisé)
  loadAllUserData: async (userId: string, userRole: string) => {
    set({ isLoading: true, error: null });
    
    try {
      // Appels parallèles pour optimiser les performances
      const promises = [
        get().loadCurrentUser(userId),
        userRole === 'REP' ? get().loadUserPerformance(userId) : Promise.resolve(),
        get().loadManagerInfo(userId)
      ];

      await Promise.allSettled(promises);
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors du chargement des données utilisateur'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // Mettre à jour l'utilisateur
  updateUser: async (userId: string, data: Partial<User>) => {
    set({ isLoading: true, error: null });
    
    try {
      // Simuler la mise à jour
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const currentUser = get().currentUser;
      if (currentUser) {
        const updatedUser = { ...currentUser, ...data };
        set({ currentUser: updatedUser });
      }
      
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // Effacer les erreurs
  clearError: () => {
    set({ error: null });
  },
}));

export default useUsersStore;
