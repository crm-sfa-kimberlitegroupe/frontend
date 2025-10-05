import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authService, type User } from '../services/authService';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<{ requiresTwoFactor?: boolean }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: true,

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      
      setLoading: (loading) => set({ loading }),

      login: async (email, password, twoFactorCode) => {
        const response = await authService.login(email, password, twoFactorCode);
        
        if (response.requiresTwoFactor) {
          return { requiresTwoFactor: true };
        }
        
        if (response.user) {
          set({ user: response.user, isAuthenticated: true });
        }
        
        return {};
      },

      register: async (email, password, firstName, lastName) => {
        const response = await authService.register(email, password, firstName, lastName);
        if (response.user) {
          set({ user: response.user, isAuthenticated: true });
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          set({ user: null, isAuthenticated: false });
        }
      },

      loadUser: async () => {
        if (authService.isAuthenticated()) {
          try {
            const response = await authService.getProfile();
            set({ user: response.user, isAuthenticated: true, loading: false });
          } catch (error) {
            console.error('Failed to load user:', error);
            authService.logout();
            set({ user: null, isAuthenticated: false, loading: false });
          }
        } else {
          set({ loading: false });
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
