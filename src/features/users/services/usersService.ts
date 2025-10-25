import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://backendsfa.onrender.com/api';

// Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'REP' | 'ADMIN' | 'SUP';
  phone?: string | null;
  photo?: string | null; // Alias pour photoUrl (compatibilité)
  photoUrl?: string | null; // Nom du backend
  territory?: string | null; // Nom du territoire (ou ID en fallback)
  territoryName?: string | null; // Nom du territoire
  employeeId?: string | null;
  hireDate?: string | null;
  manager?: string | null;
  isActive: boolean;
  status?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED'; // Ajout du status
  lastLogin?: string;
}

export interface CreateUserDto {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'REP' | 'ADMIN' | 'SUP';
  territoryId?: string;
  phone?: string;
  employeeId?: string;
  hireDate?: string;
  managerId?: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  role?: 'REP' | 'ADMIN' | 'SUP';
  territoryId?: string;
  phone?: string;
  employeeId?: string;
  hireDate?: string;
  managerId?: string;
  isActive?: boolean;
}

export interface UserPerformance {
  coverage: number;
  strikeRate: number;
  visitsThisMonth: number;
  salesThisMonth: number;
  perfectStoreScore: number;
  totalOutlets: number;
  visitedOutlets: number;
  ordersThisMonth: number;
  averageOrderValue: number;
}

export interface UsersResponse {
  success: boolean;
  data: User[];
  message: string;
}

export interface UserResponse {
  success: boolean;
  data: User;
  message: string;
}

// Axios instance
const api = axios.create({
  baseURL: `${API_URL}/users`,
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
export const usersService = {
  // Récupérer tous les utilisateurs
  async getAll(): Promise<User[]> {
    try {
      const response = await api.get<UsersResponse>('/');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      throw error;
    }
  },

  // Récupérer un utilisateur par ID
  async getById(id: string): Promise<User> {
    const response = await api.get<UserResponse>(`/${id}`);
    return response.data.data;
  },

  // Créer un utilisateur
  async create(data: CreateUserDto): Promise<User> {
    const response = await api.post<UserResponse>('/', data);
    return response.data.data;
  },

  // Mettre à jour un utilisateur
  async update(id: string, data: UpdateUserDto): Promise<User> {
    const response = await api.patch<UserResponse>(`/${id}`, data);
    return response.data.data;
  },

  // Supprimer un utilisateur
  async delete(id: string): Promise<void> {
    await api.delete(`/${id}`);
  },

  // Activer/Désactiver un utilisateur (Toggle Status)
  async toggleStatus(id: string): Promise<User> {
    const response = await api.patch<UserResponse>(`/${id}/toggle-status`);
    return response.data.data;
  },

  // Récupérer les performances d'un utilisateur
  async getPerformance(id: string): Promise<UserPerformance> {
    const response = await api.get<{ success: boolean; data: UserPerformance; message: string }>(`/${id}/performance`);
    return response.data.data;
  },

  // Upload de photo de profil
  async uploadPhoto(id: string, file: File): Promise<string> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await api.post<{ success: boolean; data: { photoUrl: string }; message: string }>(
      `/${id}/upload-photo`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data.data.photoUrl;
  },
};

export default usersService;
