import { useEffect } from 'react';
import { useAuthStore } from '@/core/auth';
import { useVendorsStore } from '@/features/users/store/vendorsStore';
import { useUsersStore } from '@/features/users/store/usersStore';
import { useOutletsStore } from '@/features/outlets/store/outletsStore';
import { useSectorsStore } from '@/features/territories/store/sectorsStore';
import { useRoutesStore } from '@/features/routes/stores/routesStore';
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
  const loadTodayRoute = useRoutesStore((state) => state.loadTodayRoute);

  // Charger les stores selon le rôle
  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadVendors();
      loadUsers();
      loadOutlets();
      loadSectors();
    } else if (user?.role === 'REP') {
      loadOutlets();
      loadTodayRoute(user.id);
    }
    
    // Nettoyer les stores lors de la déconnexion
    return () => {
      if (user?.role === 'ADMIN') {
        clearVendors();
        clearUsers();
        clearSectors();
      }
      clearOutlets();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.role]);

  // Si pas d'utilisateur, retourner null (sera géré par ProtectedRoute)
  if (!user) {
    return null;
  }

  // REP → Mobile PWA
  // ADMIN/SUP → Desktop Web
  const isMobileRole = user.role === 'REP';

  return isMobileRole ? <MobileLayout /> : <DesktopLayout userRole={user.role} />;
}
