import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import type { UserRole } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function ProfilePageNew() {
  // Mock user data - à remplacer par les vraies données
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  
  // États pour 2FA
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading2FA, setLoading2FA] = useState(false);
  const [error2FA, setError2FA] = useState('');
  const [message2FA, setMessage2FA] = useState('');

  // Mock data
  const userRole: UserRole = 'REP'; // À remplacer par user?.role
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || 'Jean',
    lastName: user?.lastName || 'Kouassi',
    email: user?.email || 'jean.kouassi@example.com',
    phone: '+225 07 12 34 56 78',
    photo: null as string | null,
    territory: 'Plateau',
    employeeId: 'REP-2024-001',
    hireDate: '2024-01-15',
    manager: 'Paul Bamba',
    isActive: true,
  });

  const [settings, setSettings] = useState({
    language: 'fr',
    pushNotifications: true,
    emailNotifications: false,
    smsNotifications: true,
    darkMode: false,
    autoSync: true,
    geoLocation: true,
    photoQuality: 'high',
  });

  const [syncStatus] = useState({
    isOnline: true,
    lastSync: new Date(),
    pendingItems: 3,
    storageUsed: 45.2,
  });

  const performanceKPIs = {
    coverage: 87.5,
    strikeRate: 72.3,
    visitsThisMonth: 127,
    salesThisMonth: 1250000,
    perfectStoreScore: 78.5,
  };

  const handleSave = (field: string, value: unknown) => {
    setProfileData({ ...profileData, [field]: value });
    setIsEditing(null);
    // TODO: Appeler l'API pour sauvegarder
    alert('✓ Modifications enregistrées');
  };

  const handleSync = () => {
    alert('🔄 Synchronisation en cours...');
    // TODO: Implémenter la synchronisation
  };

  const handleLogout = async () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      await logout();
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('⚠️ ATTENTION: Cette action est irréversible. Confirmer la suppression du compte ?')) {
      alert('Compte supprimé');
      // TODO: Implémenter la suppression
    }
  };

  // Fonctions pour 2FA
  const handleGenerate2FA = async () => {
    setError2FA('');
    setMessage2FA('');
    setLoading2FA(true);

    try {
      const response = await authService.generate2FA();
      setQrCode(response.qrCode);
      setSecret(response.secret);
      setMessage2FA('QR code généré avec succès. Scannez-le avec votre application d\'authentification.');
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError2FA(error.response?.data?.message || 'Erreur lors de la génération du QR code');
      } else {
        setError2FA('Erreur lors de la génération du QR code');
      }
    } finally {
      setLoading2FA(false);
    }
  };

  const handleEnable2FA = async (e: React.FormEvent) => {
    e.preventDefault();
    setError2FA('');
    setMessage2FA('');
    setLoading2FA(true);

    try {
      const response = await authService.enable2FA(twoFactorCode);
      setMessage2FA(response.message);
      setIs2FAEnabled(true);
      setQrCode('');
      setSecret('');
      setTwoFactorCode('');
      setTimeout(() => setShow2FAModal(false), 2000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError2FA(error.response?.data?.message || 'Code invalide');
      } else {
        setError2FA('Code invalide');
      }
    } finally {
      setLoading2FA(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!confirm('Êtes-vous sûr de vouloir désactiver l\'authentification à deux facteurs ?')) {
      return;
    }

    setError2FA('');
    setMessage2FA('');
    setLoading2FA(true);

    try {
      const response = await authService.disable2FA();
      setMessage2FA(response.message);
      setIs2FAEnabled(false);
      setShow2FAModal(false);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const error = err as { response?: { data?: { message?: string } } };
        setError2FA(error.response?.data?.message || 'Erreur lors de la désactivation');
      } else {
        setError2FA('Erreur lors de la désactivation');
      }
    } finally {
      setLoading2FA(false);
    }
  };

  return (
    <div className="pb-20 bg-gray-50 min-h-screen">
      {/* En-tête */}
      <div className="bg-gradient-to-br from-primary to-sky-500 px-4 pt-8 pb-6">
        <div className="flex items-center gap-4 mb-4">
          {/* Photo de profil */}
          <div className="relative">
            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg">
              {profileData.photo ? (
                <img src={profileData.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                '👤'
              )}
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
              📷
            </button>
          </div>

          {/* Infos principales */}
          <div className="flex-1 text-white">
            <h1 className="text-2xl font-bold mb-1">
              {profileData.firstName} {profileData.lastName}
            </h1>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="bg-white/20 text-white">
                {userRole}
              </Badge>
              {profileData.isActive && (
                <Badge variant="success" className="bg-white/20 text-white">
                  Actif
                </Badge>
              )}
            </div>
            <p className="text-sm opacity-90">{profileData.email}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-4">
        {/* Section 1: Informations personnelles */}
        <Card className="p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Informations personnelles</h2>
            <button 
              onClick={() => setIsEditing(isEditing ? null : 'personal')}
              className="text-primary text-sm font-medium"
            >
              {isEditing === 'personal' ? 'Annuler' : '✏️ Éditer'}
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prénom</label>
              {isEditing === 'personal' ? (
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{profileData.firstName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Nom</label>
              {isEditing === 'personal' ? (
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{profileData.lastName}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
              {isEditing === 'personal' ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{profileData.email}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Téléphone</label>
              {isEditing === 'personal' ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              ) : (
                <p className="text-sm text-gray-900">{profileData.phone}</p>
              )}
            </div>
          </div>

          {isEditing === 'personal' && (
            <Button 
              variant="primary" 
              size="sm" 
              fullWidth 
              className="mt-4"
              onClick={() => handleSave('personal', profileData)}
            >
              ✓ Enregistrer les modifications
            </Button>
          )}
        </Card>

        {/* Section 2: Informations professionnelles */}
        <Card className="p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Informations professionnelles</h2>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Territoire affecté</span>
              <span className="text-sm font-medium text-gray-900">{profileData.territory}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Matricule</span>
              <span className="text-sm font-medium text-gray-900">{profileData.employeeId}</span>
            </div>
            <div className="flex items-center justify-between py-2 border-b border-gray-100">
              <span className="text-sm text-gray-600">Date d'embauche</span>
              <span className="text-sm font-medium text-gray-900">
                {new Date(profileData.hireDate).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-gray-600">Manager/Superviseur</span>
              <span className="text-sm font-medium text-gray-900">{profileData.manager}</span>
            </div>
          </div>
        </Card>

        {/* Section 3: Performances (si REP ou SUP) */}
        {(userRole === 'REP' || userRole === 'SUP') && (
          <Card className="p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Mes performances 📈</h2>
            
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-lg p-3 text-center">
                <div className="text-3xl font-bold text-success mb-1">
                  {performanceKPIs.coverage}%
                </div>
                <p className="text-xs text-gray-600">Taux de couverture</p>
                <div className="w-full bg-success/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-success h-2 rounded-full" 
                    style={{ width: `${performanceKPIs.coverage}%` }}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg p-3 text-center">
                <div className="text-3xl font-bold text-primary mb-1">
                  {performanceKPIs.strikeRate}%
                </div>
                <p className="text-xs text-gray-600">Strike Rate</p>
                <div className="w-full bg-primary/20 rounded-full h-2 mt-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${performanceKPIs.strikeRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">{performanceKPIs.visitsThisMonth}</p>
                <p className="text-xs text-gray-600">Visites ce mois</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-2xl font-bold text-gray-900">
                  {(performanceKPIs.salesThisMonth / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-600">CA généré (FCFA)</p>
              </div>
            </div>

            <div className="mt-3 p-3 bg-warning/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Perfect Store Score</span>
                <span className="text-lg font-bold text-warning">{performanceKPIs.perfectStoreScore}%</span>
              </div>
            </div>
          </Card>
        )}

        {/* Section 4: Paramètres */}
        <Card className="p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Paramètres ⚙️</h2>
          
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Langue</label>
              <select 
                value={settings.language}
                onChange={(e) => setSettings({ ...settings, language: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm font-medium text-gray-700 mb-3">Notifications</p>
              {[
                { key: 'pushNotifications', label: 'Notifications Push', icon: '🔔' },
                { key: 'emailNotifications', label: 'Notifications Email', icon: '📧' },
                { key: 'smsNotifications', label: 'Notifications SMS', icon: '💬' },
              ].map((notif) => (
                <label key={notif.key} className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">
                    {notif.icon} {notif.label}
                  </span>
                  <input
                    type="checkbox"
                    checked={settings[notif.key as keyof typeof settings] as boolean}
                    onChange={(e) => setSettings({ ...settings, [notif.key]: e.target.checked })}
                    className="w-5 h-5 text-primary rounded"
                  />
                </label>
              ))}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <p className="text-sm font-medium text-gray-700 mb-3">Préférences</p>
              <label className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">🌙 Mode sombre</span>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
              <label className="flex items-center justify-between py-2">
                <span className="text-sm text-gray-700">🔄 Synchronisation auto</span>
                <input
                  type="checkbox"
                  checked={settings.autoSync}
                  onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                  className="w-5 h-5 text-primary rounded"
                />
              </label>
              {userRole === 'REP' && (
                <label className="flex items-center justify-between py-2">
                  <span className="text-sm text-gray-700">📍 Géolocalisation</span>
                  <input
                    type="checkbox"
                    checked={settings.geoLocation}
                    onChange={(e) => setSettings({ ...settings, geoLocation: e.target.checked })}
                    className="w-5 h-5 text-primary rounded"
                    disabled
                  />
                </label>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                📸 Qualité des photos
              </label>
              <div className="space-y-2">
                {['high', 'medium', 'low'].map((quality) => (
                  <label key={quality} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="photoQuality"
                      value={quality}
                      checked={settings.photoQuality === quality}
                      onChange={(e) => setSettings({ ...settings, photoQuality: e.target.value })}
                      className="w-4 h-4 text-primary"
                    />
                    <span className="text-sm text-gray-700">
                      {quality === 'high' && 'Haute (meilleure qualité)'}
                      {quality === 'medium' && 'Moyenne (équilibrée)'}
                      {quality === 'low' && 'Basse (économie de données)'}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Section 5: Synchronisation (si REP) */}
        {userRole === 'REP' && (
          <Card className="p-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Synchronisation 🔄</h2>
            
            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Statut connexion</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? 'bg-success animate-pulse' : 'bg-danger'}`} />
                  <span className="text-sm font-medium text-gray-900">
                    {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Dernière synchronisation</span>
                <span className="text-sm font-medium text-gray-900">
                  {syncStatus.lastSync.toLocaleTimeString('fr-FR')}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Données en attente</span>
                <Badge variant="warning">{syncStatus.pendingItems}</Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stockage local utilisé</span>
                <span className="text-sm font-medium text-gray-900">
                  {syncStatus.storageUsed} MB
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="primary" size="md" fullWidth onClick={handleSync}>
                <span className="mr-2">🔄</span>
                Synchroniser maintenant
              </Button>
              <Button variant="outline" size="sm" fullWidth>
                <span className="mr-2">🗑️</span>
                Vider le cache
              </Button>
            </div>
          </Card>
        )}

        {/* Section 6: Sécurité */}
        <Card className="p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Sécurité 🔒</h2>
          
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="md" 
              fullWidth
              onClick={() => setShowPasswordModal(true)}
            >
              <span className="mr-2">🔑</span>
              Changer le mot de passe
            </Button>
            
            {/* Authentification 2FA */}
            {is2FAEnabled ? (
              <div className="rounded-lg p-3" style={{ backgroundColor: '#1875ED15', border: '1px solid #1875ED50' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">✅</span>
                    <span className="text-sm font-medium text-gray-900">2FA Activé</span>
                  </div>
                  <Badge variant="primary" size="sm">Actif</Badge>
                </div>
                <p className="text-xs text-gray-600 mb-3">
                  Votre compte est protégé par l'authentification à deux facteurs
                </p>
                <Button 
                  variant="danger" 
                  size="sm" 
                  fullWidth
                  onClick={handleDisable2FA}
                  disabled={loading2FA}
                >
                  {loading2FA ? '⏳ Désactivation...' : '🔓 Désactiver 2FA'}
                </Button>
              </div>
            ) : (
              <Button 
                variant="outline" 
                size="md" 
                fullWidth
                onClick={() => setShow2FAModal(true)}
              >
                <span className="mr-2">🔐</span>
                Activer l'authentification 2FA
              </Button>
            )}
            
            <Button variant="outline" size="md" fullWidth>
              <span className="mr-2">📱</span>
              Gérer les sessions actives
            </Button>
          </div>
        </Card>

        {/* Section 7: Support & Légal */}
        <Card className="p-4 mb-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Support & Légal 📚</h2>
          
          <div className="space-y-2">
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">📖 Tutoriels / Guide utilisateur</span>
                <span className="text-gray-400">→</span>
              </div>
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">💬 Contacter le support</span>
                <span className="text-gray-400">→</span>
              </div>
            </button>
            <button className="w-full text-left px-3 py-2 hover:bg-gray-50 rounded-lg transition-colors">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">📄 CGU / Politique de confidentialité</span>
                <span className="text-gray-400">→</span>
              </div>
            </button>
            <div className="px-3 py-2">
              <span className="text-xs text-gray-500">Version de l'application: v1.2.3</span>
            </div>
          </div>
        </Card>

        {/* Section 8: Actions */}
        <div className="space-y-3 mb-6">
          <Button 
            variant="danger" 
            size="lg" 
            fullWidth
            onClick={handleLogout}
            className="border-2 border-danger bg-white text-black hover:bg-danger hover:text-white"
          >
            <span className="mr-2">🚪</span>
            Déconnexion
          </Button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full text-sm text-danger hover:underline"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Modal changement mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Changer le mot de passe</h3>
            <div className="space-y-3 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => setShowPasswordModal(false)}
              >
                Annuler
              </Button>
              <Button 
                variant="primary" 
                fullWidth
                onClick={() => {
                  alert('Mot de passe modifié avec succès!');
                  setShowPasswordModal(false);
                }}
              >
                Confirmer
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Modal 2FA */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">Authentification 2FA</h3>
              <button 
                onClick={() => {
                  setShow2FAModal(false);
                  setQrCode('');
                  setSecret('');
                  setTwoFactorCode('');
                  setError2FA('');
                  setMessage2FA('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            {error2FA && (
              <div className="mb-4 bg-danger/10 border border-danger/30 rounded-lg p-3">
                <p className="text-sm text-danger">{error2FA}</p>
              </div>
            )}

            {message2FA && (
              <div className="mb-4 rounded-lg p-3" style={{ backgroundColor: '#1875ED15', border: '1px solid #1875ED50' }}>
                <p className="text-sm" style={{ color: '#1875ED' }}>{message2FA}</p>
              </div>
            )}

            {!qrCode ? (
              <div>
                <p className="text-sm text-gray-600 mb-4">
                  L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
                </p>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-900 mb-2">Comment ça marche ?</p>
                  <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                    <li>Installez une app d'authentification (Google Authenticator, Authy, etc.)</li>
                    <li>Scannez le QR code généré</li>
                    <li>Entrez le code à 6 chiffres pour activer</li>
                  </ol>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={handleGenerate2FA}
                  disabled={loading2FA}
                >
                  {loading2FA ? '⏳ Génération...' : '🔐 Générer le QR Code'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-gray-900 mb-3">
                    1. Scannez ce QR code avec votre application
                  </p>
                  <div className="flex justify-center p-4 bg-white border-2 border-gray-200 rounded-lg">
                    <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium text-gray-900 mb-2">
                    Ou entrez ce code manuellement :
                  </p>
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <code className="text-xs font-mono break-all">{secret}</code>
                  </div>
                </div>

                <form onSubmit={handleEnable2FA} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      2. Entrez le code à 6 chiffres
                    </label>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      maxLength={6}
                      required
                      className="w-full border border-gray-300 rounded-lg px-4 py-3 text-center text-2xl font-mono tracking-widest"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        setQrCode('');
                        setSecret('');
                        setTwoFactorCode('');
                      }}
                      type="button"
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="success"
                      fullWidth
                      type="submit"
                      disabled={loading2FA || twoFactorCode.length !== 6}
                    >
                      {loading2FA ? '⏳ Vérification...' : '✓ Activer'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Modal suppression compte */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md p-6">
            <div className="text-center mb-4">
              <p className="text-4xl mb-3">⚠️</p>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Supprimer le compte</h3>
              <p className="text-sm text-gray-600">
                Cette action est irréversible. Toutes vos données seront définitivement supprimées.
              </p>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tapez "SUPPRIMER" pour confirmer
              </label>
              <input
                type="text"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                placeholder="SUPPRIMER"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => setShowDeleteModal(false)}
              >
                Annuler
              </Button>
              <Button 
                variant="danger" 
                fullWidth
                onClick={handleDeleteAccount}
              >
                Confirmer la suppression
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
