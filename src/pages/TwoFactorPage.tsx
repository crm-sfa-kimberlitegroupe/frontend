import { useState } from 'react';
import { authService } from '../services/authService';

export default function TwoFactorPage() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [code, setCode] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleGenerate2FA = async () => {
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authService.generate2FA();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setMessage('QR code généré avec succès. Scannez-le avec votre application d\'authentification.');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Erreur lors de la génération du QR code');
      } else {
        setError('Erreur lors de la génération du QR code');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authService.enable2FA(code);
      setMessage(response.message);
      setIs2FAEnabled(true);
      setQrCode('');
      setSecret('');
      setCode('');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Code invalide');
      } else {
        setError('Code invalide');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver l\'authentification à deux facteurs ?')) {
      return;
    }

    setError('');
    setMessage('');
    setLoading(true);

    try {
      const response = await authService.disable2FA();
      setMessage(response.message);
      setIs2FAEnabled(false);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError(error.response?.data?.message || 'Erreur lors de la désactivation');
      } else {
        setError('Erreur lors de la désactivation');
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
            Authentification à deux facteurs (2FA)
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

          {!is2FAEnabled && !qrCode && (
            <div>
              <p className="text-sm text-gray-600 mb-4">
                L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
              </p>
              <button
                onClick={handleGenerate2FA}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Génération...' : 'Activer 2FA'}
              </button>
            </div>
          )}

          {qrCode && (
            <div className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  1. Scannez ce QR code avec votre application d'authentification
                </h4>
                <div className="flex justify-center p-4 bg-white border-2 border-gray-200 rounded-lg">
                  <img src={qrCode} alt="QR Code 2FA" className="w-64 h-64" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Ou entrez ce code manuellement :
                </h4>
                <div className="bg-gray-50 p-3 rounded-md">
                  <code className="text-sm font-mono">{secret}</code>
                </div>
              </div>

              <form onSubmit={handleEnable2FA} className="space-y-4">
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                    2. Entrez le code à 6 chiffres de votre application
                  </label>
                  <input
                    type="text"
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="000000"
                    maxLength={6}
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || code.length !== 6}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                >
                  {loading ? 'Vérification...' : 'Confirmer et activer'}
                </button>
              </form>
            </div>
          )}

          {is2FAEnabled && (
            <div className="space-y-4">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-2xl">✅</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      L'authentification à deux facteurs est activée
                    </h3>
                    <div className="mt-2 text-sm text-green-700">
                      <p>
                        Votre compte est maintenant protégé par l'authentification à deux facteurs.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <button
                onClick={handleDisable2FA}
                disabled={loading}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
              >
                {loading ? 'Désactivation...' : 'Désactiver 2FA'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
