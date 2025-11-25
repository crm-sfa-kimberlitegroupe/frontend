const API_URL = import.meta.env.VITE_API_URL || 'https://backendsfa.onrender.com/api';

// Debug: Afficher la configuration chargée
console.log('Configuration API:', {
  apiUrl: API_URL,
  environment: import.meta.env.MODE,
  viteApiUrl: import.meta.env.VITE_API_URL,
  allEnvVars: import.meta.env
});

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  access_token: string;
}

export const authApi = {
  async login(data: LoginData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur de connexion');
    }

    return response.json();
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Erreur d\'inscription');
    }

    return response.json();
  },

  async getProfile(token: string) {
    const response = await fetch(`${API_URL}/auth/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('Erreur lors de la récupération du profil');
    }

    return response.json();
  },
};

// API client pour les requêtes authentifiées
const api = {
  async get(url: string, options?: { params?: Record<string, any> }) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    
    // Construire l'URL avec les paramètres
    let fullUrl = `${API_URL}${url}`;
    if (options?.params) {
      const searchParams = new URLSearchParams();
      Object.entries(options.params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        fullUrl += `?${queryString}`;
      }
    }
    
    const response = await fetch(fullUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('❌ Erreur 401: Non autorisé - Token invalide ou expiré');
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return response.json();
  },

  async post(url: string, data?: any) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    console.log('Token utilisé pour la requête:', token ? `${token.substring(0, 20)}...` : 'AUCUN TOKEN');
    
    // Détecter si c'est un FormData (pour l'upload de fichiers)
    const isFormData = data instanceof FormData;
    
    const headers: Record<string, string> = {
      ...(token && { Authorization: `Bearer ${token}` }),
    };
    
    // Ne pas ajouter Content-Type pour FormData (le navigateur le fait automatiquement avec boundary)
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }
    
    const response = await fetch(`${API_URL}${url}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: isFormData ? data : JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Erreur 401: Non autorisé - Token invalide ou expiré');
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return response.json();
  },

  async put(url: string, data?: any) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error(' Erreur 401: Non autorisé - Token invalide ou expiré');
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return response.json();
  },

  async patch(url: string, data?: any) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Erreur 401: Non autorisé - Token invalide ou expiré');
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return response.json();
  },

  async delete(url: string) {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    const response = await fetch(`${API_URL}${url}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        console.error('Erreur 401: Non autorisé - Token invalide ou expiré');
        localStorage.clear();
        window.location.href = '/';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      }
      const error = await response.json().catch(() => ({ message: 'Erreur réseau' }));
      throw new Error(error.message || `Erreur HTTP ${response.status}`);
    }

    return response.json();
  },
};

export default api;
