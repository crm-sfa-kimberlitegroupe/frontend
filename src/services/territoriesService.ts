import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backendsfa.onrender.com/api';

export interface Territory {
  id: string;
  name: string;
  code: string;
}

export interface Manager {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

// Axios instance
const api = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token
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

// Service
export const territoriesService = {
  // Récupérer tous les territoires
  async getAll(): Promise<Territory[]> {
    try {
      const response = await api.get<{ success: boolean; data: Territory[]; message: string }>('/territories');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching territories:', error);
      throw error;
    }
  },

  // Récupérer tous les managers (SUP et ADMIN)
  async getManagers(): Promise<Manager[]> {
    try {
      const response = await api.get<{ success: boolean; data: Manager[]; message: string }>('/users/managers/list');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching managers:', error);
      throw error;
    }
  },
};

export default territoriesService;
