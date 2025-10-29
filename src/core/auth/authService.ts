import axios from 'axios';
import type { User } from '@/core/types';

const API_URL = import.meta.env.VITE_API_URL || 'https://backendsfa.onrender.com/api';

console.log('🔧 Configuration AuthService:', {
  apiUrl: API_URL,
  environment: import.meta.env.MODE,
  viteApiUrl: import.meta.env.VITE_API_URL
});

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  access_token?: string;
  refresh_token?: string;
  requiresTwoFactor?: boolean;
}

export interface TwoFactorSetupResponse {
  success: boolean;
  message: string;
  qrCode: string;
  secret: string;
}

export interface TwoFactorResponse {
  success: boolean;
  message: string;
  twoFactorEnabled: boolean;
}

export interface PasswordResetResponse {
  success: boolean;
  message: string;
}

const api = axios.create({
  baseURL: `${API_URL}/auth`,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { access_token, refresh_token } = response.data;
          localStorage.setItem('access_token', access_token);
          localStorage.setItem('refresh_token', refresh_token);

          originalRequest.headers.Authorization = `Bearer ${access_token}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.clear();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authService = {
  async register(email: string, password: string, firstName: string, lastName: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/register', {
      email,
      password,
      firstName,
      lastName,
    });
    
    if (response.data.access_token && response.data.refresh_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  },

  async login(email: string, password: string, twoFactorCode?: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/login', {
      email,
      password,
      twoFactorCode,
    });
    
    if (response.data.access_token && response.data.refresh_token) {
      localStorage.setItem('access_token', response.data.access_token);
      localStorage.setItem('refresh_token', response.data.refresh_token);
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }
    }
    
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refresh_token');
    if (refreshToken) {
      try {
        await api.post('/logout', { refreshToken });
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.clear();
  },

  async logoutAll(): Promise<PasswordResetResponse> {
    const response = await api.post<PasswordResetResponse>('/logout-all');
    localStorage.clear();
    return response.data;
  },

  async getProfile(): Promise<{ success: boolean; user: User }> {
    const response = await api.get('/profile');
    return response.data;
  },

  async forgotPassword(email: string): Promise<PasswordResetResponse> {
    const response = await api.post<PasswordResetResponse>('/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<PasswordResetResponse> {
    const response = await api.post<PasswordResetResponse>('/reset-password', {
      token,
      newPassword,
    });
    return response.data;
  },

  async generate2FA(): Promise<TwoFactorSetupResponse> {
    const response = await api.post<TwoFactorSetupResponse>('/2fa/generate');
    return response.data;
  },

  async enable2FA(code: string): Promise<TwoFactorResponse> {
    const response = await api.post<TwoFactorResponse>('/2fa/enable', { code });
    return response.data;
  },

  async verify2FA(code: string): Promise<TwoFactorResponse> {
    const response = await api.post<TwoFactorResponse>('/2fa/verify', { code });
    return response.data;
  },

  async disable2FA(): Promise<TwoFactorResponse> {
    const response = await api.post<TwoFactorResponse>('/2fa/disable');
    return response.data;
  },

  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authService;
