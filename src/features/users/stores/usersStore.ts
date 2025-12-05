import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { usersService, type User, type UserPerformance, type ManagerInfo } from '../services/usersService';

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

export const useUsersStore = create<UsersState>()(persist((set, get) => ({
  // États initiaux
  currentUser: null,
  userPerformance: null,
  managerInfo: null,
  isLoading: false,
  error: null,

  // Charger les données de l'utilisateur actuel (vraie API)
  loadCurrentUser: async (userId: string) => {
    try {
      const userData = await usersService.getById(userId);
      set({ currentUser: userData });
    } catch (err) {
      console.error('Erreur chargement utilisateur:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Erreur lors du chargement de l\'utilisateur',
        currentUser: null 
      });
    }
  },

  // Charger les performances de l'utilisateur (vraie API)
  loadUserPerformance: async (userId: string) => {
    try {
      const performance = await usersService.getPerformance(userId);
      set({ userPerformance: performance });
    } catch (err) {
      console.error('Erreur chargement performances:', err);
      // Performances optionnelles - pas d'erreur bloquante
      set({ userPerformance: null });
    }
  },

  // Charger les informations du manager (vraie API)
  loadManagerInfo: async (userId: string) => {
    try {
      const manager = await usersService.getManager(userId);
      set({ managerInfo: manager });
    } catch (err) {
      console.error('Erreur chargement manager:', err);
      // Manager optionnel - pas d'erreur si non trouve
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
      
    } catch (err) {
      console.error('Erreur chargement donnees utilisateur:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Erreur lors du chargement des donnees utilisateur'
      });
    } finally {
      set({ isLoading: false });
    }
  },

  // Mettre a jour l'utilisateur (vraie API)
  updateUser: async (userId: string, data: Partial<User>) => {
    set({ isLoading: true, error: null });
    
    try {
      const updatedUser = await usersService.update(userId, {
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone || '',
        matricule: data.matricule || '',
        hireDate: data.hireDate || '',
      });
      set({ currentUser: updatedUser });
    } catch (err) {
      console.error('Erreur mise a jour utilisateur:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Erreur lors de la mise a jour'
      });
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  // Effacer les erreurs
  clearError: () => {
    set({ error: null });
  },
}), {
  name: 'users-profile-storage',
  partialize: (state) => ({
    // Persister les données importantes, pas les états de chargement
    currentUser: state.currentUser,
    userPerformance: state.userPerformance,
    managerInfo: state.managerInfo,
    // Ne pas persister: isLoading, error
  }),
}));

export default useUsersStore;
