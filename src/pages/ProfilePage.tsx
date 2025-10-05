import { useAuth } from '../contexts/AuthContext';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Informations du profil
          </h3>
          <div className="mt-6 max-w-xl">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Prénom
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={user?.firstName || ''}
                    disabled
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Nom
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={user?.lastName || ''}
                    disabled
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <div className="mt-1">
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  ID utilisateur
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    value={user?.id || ''}
                    disabled
                    className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md bg-gray-50 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 px-4 py-3 sm:px-6 rounded-b-lg">
          <p className="text-sm text-gray-500">
            La modification du profil sera disponible prochainement.
          </p>
        </div>
      </div>
    </div>
  );
}
