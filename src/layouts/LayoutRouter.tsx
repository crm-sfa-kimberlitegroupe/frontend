import { useEffect } from 'react';
import { useAuthStore } from '@/core/auth';
import { useVendorsStore } from '@/features/users/store/vendorsStore';
import { useUsersStore } from '@/features/users/store/usersStore';
import { useOutletsStore } from '@/features/outlets/store/outletsStore';
import { useSectorsStore } from '@/features/territories/store/sectorsStore';
import MobileLayout from './MobileLayout';
import DesktopLayout from './DesktopLayout';

export default function LayoutRouter() {
  const user = useAuthStore((state) => state.user);
  const loadVendors = useVendorsStore((state) => state.loadVendors);
  const clearVendors = useVendorsStore((state) => state.clearVendors);
  const loadUsers = useUsersStore((state) => state.loadUsers);
  const clearUsers = useUsersStore((state) => state.clearUsers);
  const loadOutlets = useOutletsStore((state) => state.loadOutlets);
  const clearOutlets = useOutletsStore((state) => state.clearOutlets);
  const loadSectors = useSectorsStore((state) => state.loadSectors);
  const clearSectors = useSectorsStore((state) => state.clearSectors);

  // Charger les vendeurs, utilisateurs, PDV et secteurs pour les admins
  useEffect(() => {
    console.log('🚀 [LayoutRouter] Initialisation des stores pour ADMIN:', user?.role);
    
    if (user?.role === 'ADMIN') {
      console.log('📦 [LayoutRouter] Chargement des stores...');
      loadVendors();
      loadUsers();
      loadOutlets();
      loadSectors();
      console.log('✅ [LayoutRouter] Tous les stores lancés en parallèle');
    }
    
    // Nettoyer les stores lors de la déconnexion
    return () => {
      if (user?.role === 'ADMIN') {
        console.log('🗑️ [LayoutRouter] Nettoyage des stores à la déconnexion');
        clearVendors();
        clearUsers();
        clearOutlets();
        clearSectors();
        console.log('✅ [LayoutRouter] Stores nettoyés');
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]); // Seulement user?.role comme dépendance

  // Si pas d'utilisateur, retourner null (sera géré par ProtectedRoute)
  if (!user) {
    return null;
  }

  // REP → Mobile PWA
  // ADMIN/SUP → Desktop Web
  const isMobileRole = user.role === 'REP';

  return isMobileRole ? <MobileLayout /> : <DesktopLayout userRole={user.role} />;
}
