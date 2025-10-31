import Card from '../../../core/ui/Card';
import type { ManagerInfo } from '../../users/services';

interface ManagerInfoSectionProps {
  manager: ManagerInfo | null;
  userRole: 'REP' | 'ADMIN' | 'SUP';
}

export default function ManagerInfoSection({ manager, userRole }: ManagerInfoSectionProps) {
  // Déterminer le titre selon le rôle de l'utilisateur
  const getManagerTitle = (role: 'REP' | 'ADMIN' | 'SUP') => {
    switch (role) {
      case 'REP':
        return 'Mon Administrateur';
      case 'ADMIN':
        return 'Mon Manager';
      case 'SUP':
        return 'Supérieur hiérarchique';
      default:
        return 'Supérieur hiérarchique';
    }
  };

  const getRoleLabel = (role: 'REP' | 'ADMIN' | 'SUP') => {
    switch (role) {
      case 'REP':
        return 'Vendeur';
      case 'ADMIN':
        return 'Administrateur';
      case 'SUP':
        return 'Manager';
      default:
        return role;
    }
  };

  if (!manager) {
    return (
      <Card className="border border-slate-200">
        <div className="p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-6">
            {getManagerTitle(userRole)}
          </h2>
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-slate-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <p className="text-sm text-slate-500 italic">Aucun supérieur hiérarchique assigné</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="border border-slate-200">
      <div className="p-6">
        <h2 className="text-base font-semibold text-slate-900 mb-6">
          {getManagerTitle(userRole)}
        </h2>
        
        <div className="flex items-start space-x-4">
          {/* Photo du manager */}
          <div className="flex-shrink-0">
            {manager.photoUrl ? (
              <img
                src={manager.photoUrl}
                alt={`${manager.firstName} ${manager.lastName}`}
                className="w-16 h-16 rounded-full object-cover border-2 border-slate-200"
              />
            ) : (
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center border-2 border-slate-200">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            )}
          </div>

          {/* Informations du manager */}
          <div className="flex-1 min-w-0">
            <div className="space-y-3">
              <div>
                <h3 className="text-lg font-medium text-slate-900">
                  {manager.firstName} {manager.lastName}
                </h3>
                <p className="text-sm text-slate-500">
                  {getRoleLabel(manager.role)}
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm text-slate-600">{manager.email}</span>
                </div>

                {manager.phone && (
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-sm text-slate-600">{manager.phone}</span>
                  </div>
                )}
              </div>

              {/* Actions de contact */}
              <div className="flex space-x-2 pt-2">
                <a
                  href={`mailto:${manager.email}`}
                  className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Email
                </a>
                
                {manager.phone && (
                  <a
                    href={`tel:${manager.phone}`}
                    className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    Appeler
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
