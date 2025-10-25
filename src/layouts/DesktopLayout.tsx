import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import type { UserRole } from '@/core/types';

interface DesktopLayoutProps {
  userRole: UserRole;
}

export default function DesktopLayout({ userRole }: DesktopLayoutProps) {
  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <Sidebar userRole={userRole} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col ml-64">
        {/* TopBar */}
        <TopBar />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
