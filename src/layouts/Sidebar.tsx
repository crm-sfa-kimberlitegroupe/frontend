import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  MapPin, 
  Map, 
  Package, 
  BarChart3,
  ClipboardList,
  TrendingUp,
  LogOut
} from 'lucide-react';
import type { UserRole } from '../types';
import { useAuthStore } from '../store/authStore';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    label: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    roles: ['ADMIN', 'SUP'],
  },
  {
    label: 'Utilisateurs',
    icon: Users,
    path: '/dashboard/users',
    roles: ['ADMIN'],
  },
  {
    label: 'Points de Vente',
    icon: MapPin,
    path: '/dashboard/pdv',
    roles: ['ADMIN'],
  },
  {
    label: 'Routes',
    icon: Map,
    path: '/dashboard/routes',
    roles: ['ADMIN'],
  },
  {
    label: 'Produits',
    icon: Package,
    path: '/dashboard/products',
    roles: ['ADMIN'],
  },
  {
    label: 'Tâches',
    icon: ClipboardList,
    path: '/dashboard/tasks',
    roles: ['ADMIN'],
  },
  {
    label: 'Performances',
    icon: TrendingUp,
    path: '/dashboard/performance',
    roles: ['SUP'],
  },
  {
    label: 'Équipe',
    icon: Users,
    path: '/dashboard/team',
    roles: ['SUP'],
  },
  {
    label: 'Rapports',
    icon: BarChart3,
    path: '/dashboard/reports',
    roles: ['ADMIN', 'SUP'],
  },
];

interface SidebarProps {
  userRole: UserRole;
}

export default function Sidebar({ userRole }: SidebarProps) {
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);
  const user = useAuthStore((state) => state.user);

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  const handleLogout = async () => {
    await logout();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-slate-900 text-white flex flex-col">
      {/* Logo / Brand */}
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-bold text-white">SFA CRM</h1>
        <p className="text-sm text-slate-400 mt-1">
          {userRole === 'ADMIN' ? 'Administration' : 'Supervision'}
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg
                    transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary text-white shadow-lg'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-slate-800">
        <Link 
          to="/dashboard/profile"
          className="flex items-center gap-3 mb-3 px-2 py-2 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center group-hover:ring-2 group-hover:ring-primary/50 transition-all">
            <span className="text-white font-semibold">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
