import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import usersService, { type User } from '../services/usersService';

interface UsersState {
  users: User[];
  admins: User[];
  supervisors: User[];
  representatives: User[];
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  loadUsers: () => Promise<void>;
  refreshUsers: () => Promise<void>;
  clearUsers: () => void;
}

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export const useUsersStore = create<UsersState>()(
  persist(
    (set, get) => ({
  users: [],
  admins: [],
  supervisors: [],
  representatives: [],
  loading: false,
  refreshing: false,
  error: null,
  lastFetch: null,

  loadUsers: async () => {
    const state = get();
    const now = Date.now();
    
    // Vérifier le cache
    if (state.lastFetch && now - state.lastFetch < CACHE_DURATION && state.users.length > 0) {
      return;
    }

    // Premier chargement ou cache expiré
    const isFirstLoad = !state.lastFetch;
    set({ 
      loading: isFirstLoad, 
      refreshing: !isFirstLoad, 
      error: null 
    });
    
    try {
      const allUsers = await usersService.getAll();
      
      // Séparer les utilisateurs par rôle
      const admins = allUsers.filter((user: User) => user.role === 'ADMIN');
      const supervisors = allUsers.filter((user: User) => user.role === 'SUP');
      const representatives = allUsers.filter((user: User) => user.role === 'REP');
      
      set({
        users: allUsers,
        admins,
        supervisors,
        representatives,
        loading: false,
        refreshing: false,
        lastFetch: now,
        error: null,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des utilisateurs';
      set({
        loading: false,
        refreshing: false,
        error: errorMessage,
      });
    }
  },

  refreshUsers: async () => {
    set({ lastFetch: null });
    await get().loadUsers();
  },

  clearUsers: () => {
    set({
      users: [],
      admins: [],
      supervisors: [],
      representatives: [],
      loading: false,
      refreshing: false,
      error: null,
      lastFetch: null,
    });
  },
}),
    {
      name: 'users-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
        admins: state.admins,
        supervisors: state.supervisors,
        representatives: state.representatives,
        lastFetch: state.lastFetch,
      }),
    }
  )
);
