import { Outlet } from 'react-router-dom';
import BottomNavigation from '../components/BottomNavigation';
import type { UserRole } from '../types';

export default function MobileLayout() {
  // Le rôle sera toujours REP pour ce layout
  const userRole: UserRole = 'REP';

  return (
    <div className="min-h-screen bg-gray-50">
      <Outlet />
      <BottomNavigation userRole={userRole} />
    </div>
  );
}
