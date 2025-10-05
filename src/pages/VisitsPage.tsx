import type { UserRole } from '../types';
import VisitsREP from './visits/VisitsREP';
import VisitsADMIN from './visits/VisitsADMIN';

interface VisitsPageProps {
  userRole: UserRole;
}

export default function VisitsPage({ userRole }: VisitsPageProps) {
  if (userRole === 'SUP') {
    return (
      <div className="pb-20 px-4 pt-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-5xl mb-4">🚫</p>
          <p className="text-lg font-semibold text-gray-900">Accès non autorisé</p>
          <p className="text-sm text-gray-600 mt-2">Cette section est réservée aux REP et ADMIN</p>
        </div>
      </div>
    );
  }

  return userRole === 'REP' ? <VisitsREP /> : <VisitsADMIN />;
}
