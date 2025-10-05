import { useAuthStore } from '../store/authStore';

export default function DashboardHome() {
  const user = useAuthStore((state) => state.user);

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Bienvenue, {user?.firstName} {user?.lastName} !
        </h2>
        
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-6">
          <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-4xl">👤</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Profil
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Gérer vos informations
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-4xl">🔐</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Sécurité 2FA
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Authentification à deux facteurs
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-4xl">💻</span>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      Sessions
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      Gérer vos appareils
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 bg-gray-50 p-6 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Informations du compte
          </h3>
          <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{user?.email}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Nom complet</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {user?.firstName} {user?.lastName}
              </dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">ID utilisateur</dt>
              <dd className="mt-1 text-sm text-gray-900 font-mono">{user?.id}</dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
