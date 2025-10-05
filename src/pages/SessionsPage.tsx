import { useState } from 'react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export default function SessionsPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const logout = useAuthStore((state) => state.logout);

  const handleLogoutAll = async () => {
    if (!confirm('Êtes-vous sûr de vouloir vous déconnecter de tous les appareils ? Vous devrez vous reconnecter sur cet appareil.')) {
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      await authService.logoutAll();
      setMessage('Déconnecté de tous les appareils avec succès');
      
      // Rediriger vers la page de connexion après 2 secondes
      setTimeout(() => {
        logout();
      }, 2000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Erreur lors de la déconnexion');
      } else {
        setError('Erreur lors de la déconnexion');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Gestion des sessions
          </h3>

          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {message && (
            <div className="mb-4 rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Session actuelle
              </h4>
              <div className="flex items-center text-sm text-gray-600">
                <span className="mr-2">💻</span>
                <span>Cet appareil (actif)</span>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">
                Déconnexion de tous les appareils
              </h4>
              <p className="text-sm text-gray-600 mb-4">
                Cette action vous déconnectera de tous les appareils où vous êtes actuellement connecté,
                y compris cet appareil. Vous devrez vous reconnecter.
              </p>
              <button
                onClick={handleLogoutAll}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Déconnexion...' : 'Se déconnecter de tous les appareils'}
              </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <span className="text-xl">ℹ️</span>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Conseil de sécurité
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <p>
                      Si vous pensez que votre compte a été compromis, déconnectez-vous de tous les appareils
                      et changez votre mot de passe immédiatement.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
