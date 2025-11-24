/**
 * Store Zustand pour la gestion des points de vente (outlets/PDV)
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types pour les outlets
export interface Outlet {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  contactPerson?: string;
  lat?: number;
  lng?: number;
  region?: string;
  commune?: string;
  ville?: string;
  quartier?: string;
  codePostal?: string;
  sectorId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OutletFilters {
  search?: string;
  region?: string;
  commune?: string;
  ville?: string;
  sectorId?: string;
  isActive?: boolean;
}

export interface OutletStats {
  totalOutlets: number;
  activeOutlets: number;
  inactiveOutlets: number;
  byRegion: { [region: string]: number };
  byCommune: { [commune: string]: number };
}

interface OutletsState {
  // État des données
  outlets: Outlet[];
  filteredOutlets: Outlet[];
  selectedOutlet: Outlet | null;
  stats: OutletStats | null;
  
  // États de chargement
  isLoading: boolean;
  isLoadingStats: boolean;
  error: string | null;
  
  // Filtres
  filters: OutletFilters;
  
  // Actions
  loadOutlets: () => Promise<void>;
  loadOutletById: (id: string) => Promise<void>;
  loadOutletStats: () => Promise<void>;
  createOutlet: (outletData: Partial<Outlet>) => Promise<void>;
  updateOutlet: (id: string, outletData: Partial<Outlet>) => Promise<void>;
  deleteOutlet: (id: string) => Promise<void>;
  setFilters: (filters: Partial<OutletFilters>) => void;
  applyFilters: () => void;
  clearFilters: () => void;
  setSelectedOutlet: (outlet: Outlet | null) => void;
  clearOutlets: () => void;
  clearError: () => void;
}

// Service API simulé (à remplacer par le vrai service)
const outletsService = {
  async getAll(): Promise<Outlet[]> {
    // TODO: Remplacer par le vrai service API
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'outlet-1',
            name: 'Boutique Central',
            address: '123 Rue de la Paix, Abidjan Plateau',
            phone: '+225 01 02 03 04',
            email: 'contact@boutique-central.ci',
            contactPerson: 'Jean Kouassi',
            lat: 5.3600,
            lng: -4.0083,
            region: 'Lagunes',
            commune: 'Abidjan',
            ville: 'Abidjan',
            quartier: 'Plateau',
            codePostal: '00225',
            sectorId: 'sector-1',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'outlet-2',
            name: 'Supermarché Cocody',
            address: '456 Boulevard de Cocody, Abidjan',
            phone: '+225 05 06 07 08',
            email: 'cocody@supermarche.ci',
            contactPerson: 'Marie Diabaté',
            lat: 5.3447,
            lng: -3.9884,
            region: 'Lagunes',
            commune: 'Abidjan',
            ville: 'Abidjan',
            quartier: 'Cocody',
            codePostal: '00225',
            sectorId: 'sector-1',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
          {
            id: 'outlet-3',
            name: 'Épicerie Marcory',
            address: '789 Rue de Marcory, Abidjan',
            phone: '+225 07 08 09 10',
            email: 'marcory@epicerie.ci',
            contactPerson: 'Fatou Traoré',
            lat: 5.2850,
            lng: -3.9889,
            region: 'Lagunes',
            commune: 'Abidjan',
            ville: 'Abidjan',
            quartier: 'Marcory',
            codePostal: '00225',
            sectorId: 'sector-1',
            isActive: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ]);
      }, 500);
    });
  },

  
  async getById(id: string): Promise<Outlet | null> {
    const outlets = await this.getAll();
    return outlets.find(outlet => outlet.id === id) || null;
  },

  async getStats(): Promise<OutletStats> {
    const outlets = await this.getAll();
    const activeOutlets = outlets.filter(o => o.isActive);
    const inactiveOutlets = outlets.filter(o => !o.isActive);
    
    const byRegion: { [region: string]: number } = {};
    const byCommune: { [commune: string]: number } = {};
    
    outlets.forEach(outlet => {
      if (outlet.region) {
        byRegion[outlet.region] = (byRegion[outlet.region] || 0) + 1;
      }
      if (outlet.commune) {
        byCommune[outlet.commune] = (byCommune[outlet.commune] || 0) + 1;
      }
    });

    return {
      totalOutlets: outlets.length,
      activeOutlets: activeOutlets.length,
      inactiveOutlets: inactiveOutlets.length,
      byRegion,
      byCommune,
    };
  },

  async create(outletData: Partial<Outlet>): Promise<Outlet> {
    // TODO: Remplacer par le vrai service API
    return new Promise((resolve) => {
      setTimeout(() => {
        const newOutlet: Outlet = {
          id: Math.random().toString(36).substr(2, 9),
          name: outletData.name || '',
          address: outletData.address || '',
          phone: outletData.phone,
          email: outletData.email,
          contactPerson: outletData.contactPerson,
          lat: outletData.lat,
          lng: outletData.lng,
          region: outletData.region,
          commune: outletData.commune,
          ville: outletData.ville,
          quartier: outletData.quartier,
          codePostal: outletData.codePostal,
          sectorId: outletData.sectorId,
          isActive: outletData.isActive ?? true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        resolve(newOutlet);
      }, 500);
    });
  },

  async update(id: string, outletData: Partial<Outlet>): Promise<Outlet> {
    // TODO: Remplacer par le vrai service API
    const outlet = await this.getById(id);
    if (!outlet) throw new Error('Outlet not found');
    
    return {
      ...outlet,
      ...outletData,
      updatedAt: new Date().toISOString(),
    };
  },

  async delete(id: string): Promise<void> {
    // TODO: Remplacer par le vrai service API
    console.log('Suppression outlet:', id);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 500);
    });
  },
};

export const useOutletsStore = create<OutletsState>()(
  devtools(
    (set, get) => ({
      // État initial
      outlets: [],
      filteredOutlets: [],
      selectedOutlet: null,
      stats: null,
      isLoading: false,
      isLoadingStats: false,
      error: null,
      filters: {},

      // Charger tous les outlets
      loadOutlets: async () => {
        set({ isLoading: true, error: null });
        try {
          const outlets = await outletsService.getAll();
          set({ 
            outlets, 
            filteredOutlets: outlets,
            isLoading: false 
          });
          
          // Appliquer les filtres si ils existent
          get().applyFilters();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des outlets',
            isLoading: false 
          });
        }
      },

      // Charger un outlet par ID
      loadOutletById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          const outlet = await outletsService.getById(id);
          set({ 
            selectedOutlet: outlet,
            isLoading: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement de l\'outlet',
            isLoading: false 
          });
        }
      },

      // Charger les statistiques
      loadOutletStats: async () => {
        set({ isLoadingStats: true, error: null });
        try {
          const stats = await outletsService.getStats();
          set({ 
            stats,
            isLoadingStats: false 
          });
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors du chargement des statistiques',
            isLoadingStats: false 
          });
        }
      },

      // Créer un nouveau outlet
      createOutlet: async (outletData: Partial<Outlet>) => {
        set({ isLoading: true, error: null });
        try {
          const newOutlet = await outletsService.create(outletData);
          const currentOutlets = get().outlets;
          const updatedOutlets = [...currentOutlets, newOutlet];
          
          set({ 
            outlets: updatedOutlets,
            filteredOutlets: updatedOutlets,
            isLoading: false 
          });
          
          // Appliquer les filtres
          get().applyFilters();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la création de l\'outlet',
            isLoading: false 
          });
        }
      },

      // Mettre à jour un outlet
      updateOutlet: async (id: string, outletData: Partial<Outlet>) => {
        set({ isLoading: true, error: null });
        try {
          const updatedOutlet = await outletsService.update(id, outletData);
          const currentOutlets = get().outlets;
          const updatedOutlets = currentOutlets.map(outlet => 
            outlet.id === id ? updatedOutlet : outlet
          );
          
          set({ 
            outlets: updatedOutlets,
            filteredOutlets: updatedOutlets,
            selectedOutlet: updatedOutlet,
            isLoading: false 
          });
          
          // Appliquer les filtres
          get().applyFilters();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la mise à jour de l\'outlet',
            isLoading: false 
          });
        }
      },

      // Supprimer un outlet
      deleteOutlet: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
          await outletsService.delete(id);
          const currentOutlets = get().outlets;
          const updatedOutlets = currentOutlets.filter(outlet => outlet.id !== id);
          
          set({ 
            outlets: updatedOutlets,
            filteredOutlets: updatedOutlets,
            selectedOutlet: null,
            isLoading: false 
          });
          
          // Appliquer les filtres
          get().applyFilters();
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Erreur lors de la suppression de l\'outlet',
            isLoading: false 
          });
        }
      },

      // Définir les filtres
      setFilters: (newFilters: Partial<OutletFilters>) => {
        const currentFilters = get().filters;
        const updatedFilters = { ...currentFilters, ...newFilters };
        set({ filters: updatedFilters });
        get().applyFilters();
      },

      // Appliquer les filtres
      applyFilters: () => {
        const { outlets, filters } = get();
        let filtered = [...outlets];

        // Filtre par recherche (nom ou adresse)
        if (filters.search) {
          const searchTerm = filters.search.toLowerCase();
          filtered = filtered.filter(outlet => 
            outlet.name.toLowerCase().includes(searchTerm) ||
            outlet.address.toLowerCase().includes(searchTerm) ||
            outlet.contactPerson?.toLowerCase().includes(searchTerm)
          );
        }

        // Filtre par région
        if (filters.region) {
          filtered = filtered.filter(outlet => outlet.region === filters.region);
        }

        // Filtre par commune
        if (filters.commune) {
          filtered = filtered.filter(outlet => outlet.commune === filters.commune);
        }

        // Filtre par ville
        if (filters.ville) {
          filtered = filtered.filter(outlet => outlet.ville === filters.ville);
        }

        // Filtre par secteur
        if (filters.sectorId) {
          filtered = filtered.filter(outlet => outlet.sectorId === filters.sectorId);
        }

        // Filtre par statut actif
        if (filters.isActive !== undefined) {
          filtered = filtered.filter(outlet => outlet.isActive === filters.isActive);
        }

        set({ filteredOutlets: filtered });
      },

      // Effacer les filtres
      clearFilters: () => {
        const { outlets } = get();
        set({ 
          filters: {},
          filteredOutlets: outlets 
        });
      },

      // Définir l'outlet sélectionné
      setSelectedOutlet: (outlet: Outlet | null) => {
        set({ selectedOutlet: outlet });
      },

      // Vider tous les outlets
      clearOutlets: () => {
        set({
          outlets: [],
          filteredOutlets: [],
          selectedOutlet: null,
          stats: null,
          filters: {},
          error: null,
        });
      },

      // Effacer l'erreur
      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'outlets-store',
    }
  )
);
