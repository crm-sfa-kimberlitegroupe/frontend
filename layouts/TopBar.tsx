import { useLocation, Link } from 'react-router-dom';
import { Bell, Search, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function TopBar() {
  const location = useLocation();
  const [notifications] = useState(3); // Mock notifications count

  // Générer les breadcrumbs depuis le path
  const generateBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    
    const breadcrumbMap: Record<string, string> = {
      dashboard: 'Tableau de bord',
      users: 'Utilisateurs',
      pdv: 'Points de Vente',
      routes: 'Routes',
      products: 'Produits',
      tasks: 'Tâches',
      performance: 'Performances',
      team: 'Équipe',
      reports: 'Rapports',
      profile: 'Profil',
    };

    return paths.map((path, index) => ({
      label: breadcrumbMap[path] || path,
      path: '/' + paths.slice(0, index + 1).join('/'),
      isLast: index === paths.length - 1,
    }));
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Breadcrumbs */}
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <div key={crumb.path} className="flex items-center">
              {index > 0 && (
                <ChevronRight className="w-4 h-4 text-gray-400 mx-2" />
              )}
              {crumb.isLast ? (
                <span className="font-semibold text-gray-900">
                  {crumb.label}
                </span>
              ) : (
                <Link
                  to={crumb.path}
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                >
                  {crumb.label}
                </Link>
              )}
            </div>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              className="pl-10 pr-4 py-2 w-64 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Notifications */}
          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            {notifications > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 bg-danger text-white text-xs rounded-full flex items-center justify-center">
                {notifications}
              </span>
            )}
          </button>

          {/* Current Time */}
          <div className="hidden lg:block text-sm text-gray-600">
            {new Date().toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
