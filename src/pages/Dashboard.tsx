interface DashboardProps {
  user: {
    email: string;
    firstName: string;
    lastName: string;
  };
  onLogout: () => void;
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            </div>
            <button
              onClick={onLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-red-600 transition"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
              {user.firstName.charAt(0)}{user.lastName.charAt(0)}
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Bienvenue, {user.firstName} {user.lastName} !
            </h2>
            <p className="text-gray-600">{user.email}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl">
              <div className="text-blue-600 text-4xl mb-2">📊</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Statistiques</h3>
              <p className="text-gray-600 text-sm">Consultez vos données</p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl">
              <div className="text-purple-600 text-4xl mb-2">⚙️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Paramètres</h3>
              <p className="text-gray-600 text-sm">Gérez votre compte</p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl">
              <div className="text-green-600 text-4xl mb-2">📝</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">Documents</h3>
              <p className="text-gray-600 text-sm">Accédez à vos fichiers</p>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 p-6 rounded-xl">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Informations du compte</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Prénom :</span>
                <span className="font-semibold text-gray-900">{user.firstName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Nom :</span>
                <span className="font-semibold text-gray-900">{user.lastName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email :</span>
                <span className="font-semibold text-gray-900">{user.email}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
