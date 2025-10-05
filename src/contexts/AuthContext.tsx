import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService, User } from '../services/authService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string, twoFactorCode?: string) => Promise<{ requiresTwoFactor?: boolean }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Charger l'utilisateur au démarrage
    const loadUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await authService.getProfile();
          setUser(response.user);
        } catch (error) {
          console.error('Failed to load user:', error);
          authService.logout();
        }
      }
      setLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string, twoFactorCode?: string) => {
    const response = await authService.login(email, password, twoFactorCode);
    
    if (response.requiresTwoFactor) {
      return { requiresTwoFactor: true };
    }
    
    if (response.user) {
      setUser(response.user);
    }
    
    return {};
  };

  const register = async (email: string, password: string, firstName: string, lastName: string) => {
    const response = await authService.register(email, password, firstName, lastName);
    if (response.user) {
      setUser(response.user);
    }
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
