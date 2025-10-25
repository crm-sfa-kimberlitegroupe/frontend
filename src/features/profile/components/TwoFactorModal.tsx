import { useState } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import { authService } from '@/core/auth/authService';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
  is2FAEnabled: boolean;
  onStatusChange: (enabled: boolean) => void;
}

export default function TwoFactorModal({ 
  isOpen, 
  onClose, 
  is2FAEnabled,
  onStatusChange 
}: TwoFactorModalProps) {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

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
      const response = await authService.enable2FA(twoFactorCode);
      setMessage(response.message);
      onStatusChange(true);
      setTimeout(() => {
        onClose();
        setQrCode('');
        setSecret('');
        setTwoFactorCode('');
      }, 2000);
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
      onStatusChange(false);
      setTimeout(() => onClose(), 2000);
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
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-slate-900">
              Authentification 2FA
            </h3>
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ✕
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          {message && (
            <div className="mb-4 bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">
              {message}
            </div>
          )}

          {is2FAEnabled ? (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                L'authentification à deux facteurs est actuellement activée sur votre compte.
              </p>
              <Button
                variant="danger"
                fullWidth
                onClick={handleDisable2FA}
                disabled={loading}
              >
                {loading ? 'Désactivation...' : 'Désactiver 2FA'}
              </Button>
            </div>
          ) : !qrCode ? (
            <div>
              <p className="text-sm text-slate-600 mb-4">
                L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
              </p>
              <div className="bg-slate-50 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-slate-900 mb-2">Comment ça marche ?</p>
                <ol className="text-sm text-slate-600 space-y-1 list-decimal list-inside">
                  <li>Installez une app d'authentification (Google Authenticator, Authy, etc.)</li>
                  <li>Scannez le QR code généré</li>
                  <li>Entrez le code à 6 chiffres pour activer</li>
                </ol>
              </div>
              <Button
                variant="primary"
                fullWidth
                onClick={handleGenerate2FA}
                disabled={loading}
              >
                {loading ? 'Génération...' : 'Générer le QR Code'}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleEnable2FA} className="space-y-4">
              <div>
                <p className="text-sm font-medium text-slate-900 mb-3">
                  Scannez ce QR code avec votre application
                </p>
                <div className="flex justify-center p-4 bg-slate-50 border border-slate-200 rounded-lg">
                  <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48" />
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-slate-900 mb-2">
                  Ou entrez ce code manuellement :
                </p>
                <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                  <code className="text-sm font-mono break-all text-slate-800">{secret}</code>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Entrez le code à 6 chiffres
                </label>
                <input
                  type="text"
                  value={twoFactorCode}
                  onChange={(e) => setTwoFactorCode(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-4 py-2 text-center text-lg font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  fullWidth
                  onClick={onClose}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  fullWidth
                  disabled={loading || twoFactorCode.length !== 6}
                >
                  {loading ? 'Activation...' : 'Activer 2FA'}
                </Button>
              </div>
            </form>
          )}
        </div>
      </Card>
    </div>
  );
}
