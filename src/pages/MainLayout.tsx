import { Outlet } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import type { UserRole } from '../types';

export default function MainLayout() {
  // Mock role - à remplacer par user?.role quand le backend sera prêt
  const userRole: UserRole = 'REP'; // Changez en 'ADMIN' ou 'SUP' pour tester

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <BottomNavigation userRole={userRole} />
    </div>
  );
}
