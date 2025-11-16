import { Link, useLocation } from 'react-router-dom';
import type { UserRole } from '@/core/types';
import { Icon } from '../ui/Icon';
import type { IconName } from '../ui/Icon';

interface NavItem {
  id: string;
  label: string;
  icon: IconName;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  {
    id: 'home',
    label: 'Accueil',
    icon: 'home',
    path: '/dashboard',
    roles: ['REP', 'ADMIN', 'SUP'],
  },
  {
    id: 'route',
    label: 'Route',
    icon: 'map',
    path: '/dashboard/route',
    roles: ['REP', 'ADMIN', 'SUP'],
  },
  {
    id: 'visits',
    label: 'Visites',
    icon: 'locationMarker',
    path: '/dashboard/visits',
    roles: ['REP', 'ADMIN'],
  },
  {
    id: 'stock',
    label: 'Stock',
    icon: 'package',
    path: '/dashboard/stock',
    roles: ['REP'],
  },
  {
    id: 'profile',
    label: 'Profil',
    icon: 'user',
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
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 pb-0.5">
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
                <Icon 
                  name={item.icon}
                  variant={isActive ? 'primary' : 'grey'}
                  size="xl"
                  className="mb-1"
                />
                <span className={`text-base font-medium transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`}>
                  {item.label}
                </span>
                {isActive && (
                  <div className="absolute bottom-0 w-14 h-1 bg-primary rounded-t-full" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
