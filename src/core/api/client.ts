const API_URL = import.meta.env.VITE_API_URL || 'https://backendsfa.onrender.com/api';

// Debug: Afficher la configuration chargée
console.log('🔧 Configuration API:', {
  apiUrl: API_URL,
  environment: import.meta.env.MODE,
  viteApiUrl: import.meta.env.VITE_API_URL,
  allEnvVars: import.meta.env
});

export const API_BASE_URL = API_URL;

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export class ApiError extends Error {
  statusCode?: number;
  data?: any;
  
  constructor(
    message: string,
    statusCode?: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

export const apiClient = {
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {},
    isRetry = false
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
    };

    const response = await fetch(`${API_URL}${endpoint}`, config);

    // Si erreur 401 et pas déjà un retry, tenter de refresh le token
    if (response.status === 401 && !isRetry) {
      const refreshToken = localStorage.getItem('refresh_token');
      
      if (refreshToken) {
        try {
          console.log('🔄 Token expiré, tentative de refresh...');
          
          // Appel au endpoint de refresh
          const refreshResponse = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
          });

          if (refreshResponse.ok) {
            const refreshData = await refreshResponse.json();
            
            // Sauvegarder les nouveaux tokens
            localStorage.setItem('access_token', refreshData.access_token);
            localStorage.setItem('refresh_token', refreshData.refresh_token);
            
            console.log('✅ Token refreshé avec succès');
            
            // Réessayer la requête originale avec le nouveau token
            return this.request<T>(endpoint, options, true);
          } else {
            // Refresh a échoué, déconnecter l'utilisateur
            console.error('❌ Refresh token invalide, déconnexion...');
            localStorage.clear();
            window.location.href = '/login';
            throw new ApiError('Session expirée, veuillez vous reconnecter', 401);
          }
        } catch (refreshError) {
          console.error('❌ Erreur lors du refresh:', refreshError);
          localStorage.clear();
          window.location.href = '/login';
          throw new ApiError('Session expirée, veuillez vous reconnecter', 401);
        }
      } else {
        // Pas de refresh token, déconnecter
        console.error('❌ Pas de refresh token, déconnexion...');
        localStorage.clear();
        window.location.href = '/login';
        throw new ApiError('Non autorisé', 401);
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Une erreur est survenue' }));
      throw new ApiError(
        error.message || 'Erreur de requête',
        response.status,
        error
      );
    }

    return response.json();
  },

  get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET' });
  },

  post<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  put<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  patch<T = any>(endpoint: string, data?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' });
  },
};
