import { Outlet } from 'react-router-dom';
import BottomNavigation from '../core/components/BottomNavigation';
import type { UserRole } from '@/core/types';

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
