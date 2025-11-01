import { create } from 'zustand';
import usersService, { type User } from '../services/usersService';

interface VendorsState {
  vendors: User[];
  loading: boolean;
  error: string | null;
  lastFetch: number | null;
  
  // Actions
  loadVendors: () => Promise<void>;
  refreshVendors: () => Promise<void>;
  updateVendor: (vendor: User) => void;
  removeVendor: (vendorId: string) => void;
  addVendor: (vendor: User) => void;
  getVendorBySectorId: (sectorId: string) => User | undefined;
  clearVendors: () => void;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useVendorsStore = create<VendorsState>((set, get) => ({
  vendors: [],
  loading: false,
  error: null,
  lastFetch: null,

  // Charger tous les vendeurs (REP uniquement)
  loadVendors: async () => {
    const state = get();
    
    // Vérifier si les données sont en cache et encore valides
    if (
      state.vendors.length > 0 &&
      state.lastFetch &&
      Date.now() - state.lastFetch < CACHE_DURATION
    ) {
      return; // Utiliser le cache
    }

    set({ loading: true, error: null });
    
    try {
      const allUsers = await usersService.getAll();
      const vendors = allUsers.filter(
        (user) => user.role === 'REP' && user.status === 'ACTIVE'
      );
      
      set({ 
        vendors, 
        loading: false, 
        lastFetch: Date.now() 
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors du chargement des vendeurs';
      set({ 
        error: errorMessage,
        loading: false 
      });
      console.error('Erreur chargement vendeurs:', error);
    }
  },

  // Forcer le rechargement des vendeurs
  refreshVendors: async () => {
    set({ lastFetch: null }); // Invalider le cache
    await get().loadVendors();
  },

  // Mettre à jour un vendeur dans le store
  updateVendor: (updatedVendor: User) => {
    set((state) => ({
      vendors: state.vendors.map((vendor) =>
        vendor.id === updatedVendor.id ? updatedVendor : vendor
      ),
    }));
  },

  // Supprimer un vendeur du store
  removeVendor: (vendorId: string) => {
    set((state) => ({
      vendors: state.vendors.filter((vendor) => vendor.id !== vendorId),
    }));
  },

  // Ajouter un nouveau vendeur au store
  addVendor: (newVendor: User) => {
    set((state) => ({
      vendors: [...state.vendors, newVendor],
    }));
  },

  // Récupérer un vendeur par son secteur assigné
  getVendorBySectorId: (sectorId: string) => {
    const state = get();
    return state.vendors.find((vendor) => vendor.assignedSectorId === sectorId);
  },

  // Vider le store (utile lors de la déconnexion)
  clearVendors: () => {
    set({ 
      vendors: [], 
      loading: false, 
      error: null, 
      lastFetch: null 
    });
  },
}));
