import { Link, useLocation } from 'react-router-dom';
import type { UserRole } from '../types';
import { HiHome, HiMap, HiLocationMarker, HiChartBar, HiUser } from 'react-icons/hi';
import type { IconType } from 'react-icons';

interface NavItem {
  id: string;
  label: string;
  icon: IconType;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: HiHome,
    path: '/dashboard',
    roles: ['REP', 'ADMIN', 'SUP'],
  },
  {
    id: 'route',
    label: 'Route',
    icon: HiMap,
    path: '/dashboard/route',
    roles: ['REP', 'ADMIN', 'SUP'],
  },
  {
    id: 'visits',
    label: 'Visites',
    icon: HiLocationMarker,
    path: '/dashboard/visits',
    roles: ['REP', 'ADMIN'],
  },
  {
    id: 'data',
    label: 'Data',
    icon: HiChartBar,
    path: '/dashboard/data',
    roles: ['REP', 'ADMIN', 'SUP'],
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: HiUser,
    path: '/dashboard/profile',
    roles: ['REP', 'ADMIN', 'SUP'],
  },
];

interface BottomNavigationProps {
  userRole: UserRole;
}

export default function BottomNavigation({ userRole }: BottomNavigationProps) {
  const location = useLocation();

  const filteredItems = navItems.filter((item) =>
    item.roles.includes(userRole)
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-safe-bottom">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around items-center h-16">
          {filteredItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.id}
                to={item.path}
                className="flex flex-col items-center justify-center flex-1 h-full transition-colors relative"
              >
                <item.icon 
                  className={`text-2xl mb-1 transition-colors ${
                    isActive ? 'text-primary' : 'text-gray-500'
                  }`}
                />
                <span className={`text-xs font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-12 h-1 bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
