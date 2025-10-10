import { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { authService } from '../services/authService';
import { usersService, type UserPerformance } from '../services/usersService';
import type { UserRole } from '../types';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';

export default function ProfilePageNew() {
  const { user, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // États pour 2FA
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [loading2FA, setLoading2FA] = useState(false);
  const [error2FA, setError2FA] = useState('');
  const [message2FA, setMessage2FA] = useState('');

  // Données du profil depuis la base de données
  const userRole: UserRole = (user?.role as UserRole) || 'REP';
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    photo: user?.photo || null,
    territory: user?.territory || '',
    employeeId: user?.employeeId || '',
    hireDate: user?.hireDate || '',
    manager: user?.manager || '',
    isActive: user?.isActive ?? true,
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

  const [performanceKPIs, setPerformanceKPIs] = useState<UserPerformance>({
    coverage: 0,
    strikeRate: 0,
    visitsThisMonth: 0,
    salesThisMonth: 0,
    perfectStoreScore: 0,
    totalOutlets: 0,
    visitedOutlets: 0,
    ordersThisMonth: 0,
    averageOrderValue: 0,
  });

  // Charger les données utilisateur au montage
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          
          // Charger les données du profil
          const userData = await usersService.getById(user.id);
          setProfileData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone || '',
            photo: userData.photo || null,
            territory: userData.territory || '',
            employeeId: userData.employeeId || '',
            hireDate: userData.hireDate || '',
            manager: userData.manager || '',
            isActive: userData.isActive,
          });
          
          // Charger les performances (seulement pour REP et SUP)
          if (userData.role === 'REP' || userData.role === 'SUP') {
            try {
              const performance = await usersService.getPerformance(user.id);
              setPerformanceKPIs(performance);
            } catch (perfError) {
              console.error('Erreur lors du chargement des performances:', perfError);
              // Garder les valeurs par défaut en cas d'erreur
            }
          }
        } catch (error) {
          console.error('Erreur lors du chargement des données:', error);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      // Mettre à jour via l'API
      await usersService.update(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || undefined,
        employeeId: profileData.employeeId || undefined,
        hireDate: profileData.hireDate || undefined,
      });
      setIsEditing(null);
      alert('✓ Modifications enregistrées avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      alert('❌ Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
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

  // Afficher un indicateur de chargement
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-sm text-slate-600">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* En-tête épuré */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="flex items-start gap-6">
            {/* Photo de profil minimaliste */}
            <div className="relative group">
              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-semibold text-slate-600 border-2 border-slate-200">
                {profileData.photo ? (
                  <img src={profileData.photo} alt="Profile" className="w-full h-full rounded-full object-cover" />
                ) : (
                  `${profileData.firstName[0]}${profileData.lastName[0]}`
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs hover:bg-slate-800 transition-colors">
                ✎
              </button>
            </div>

            {/* Informations principales */}
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-slate-900 mb-1">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <p className="text-sm text-slate-600 mb-3">{profileData.email}</p>
              <div className="flex items-center gap-2">
                <Badge variant="secondary">{userRole}</Badge>
                {profileData.isActive && <Badge variant="success">Actif</Badge>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Informations personnelles */}
        <Card className="border border-slate-200">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-semibold text-slate-900">Informations personnelles</h2>
              <button 
                onClick={() => setIsEditing(isEditing === 'personal' ? null : 'personal')}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                {isEditing === 'personal' ? 'Annuler' : 'Modifier'}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Prénom</label>
                {isEditing === 'personal' ? (
                  <input
                    type="text"
                    value={profileData.firstName}
                    onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-slate-900">{profileData.firstName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Nom</label>
                {isEditing === 'personal' ? (
                  <input
                    type="text"
                    value={profileData.lastName}
                    onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-slate-900">{profileData.lastName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Email</label>
                <p className="text-sm text-slate-900">{profileData.email}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Téléphone</label>
                {isEditing === 'personal' ? (
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                  />
                ) : (
                  <p className="text-sm text-slate-900">{profileData.phone}</p>
                )}
              </div>
            </div>

            {isEditing === 'personal' && (
              <div className="mt-6 flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setIsEditing(null)}>
                  Annuler
                </Button>
                <Button variant="primary" fullWidth onClick={handleSave}>
                  Enregistrer
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Informations professionnelles */}
        <Card className="border border-slate-200">
          <div className="p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-6">Informations professionnelles</h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Territoire</span>
                <span className="text-sm font-medium text-slate-900">{profileData.territory}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Matricule</span>
                <span className="text-sm font-medium text-slate-900">{profileData.employeeId}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-sm text-slate-600">Date d'embauche</span>
                <span className="text-sm font-medium text-slate-900">
                  {new Date(profileData.hireDate).toLocaleDateString('fr-FR')}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-slate-600">Manager</span>
                <span className="text-sm font-medium text-slate-900">{profileData.manager}</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Performances (si REP ou SUP) */}
        {(userRole === 'REP' || userRole === 'SUP') && (
          <Card className="border border-slate-200">
            <div className="p-6">
              <h2 className="text-base font-semibold text-slate-900 mb-6">Performances</h2>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900 mb-1">{performanceKPIs.coverage}%</div>
                  <p className="text-xs text-slate-600">Couverture</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900 mb-1">{performanceKPIs.strikeRate}%</div>
                  <p className="text-xs text-slate-600">Strike Rate</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900 mb-1">{performanceKPIs.visitsThisMonth}</div>
                  <p className="text-xs text-slate-600">Visites</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <div className="text-2xl font-bold text-slate-900 mb-1">
                    {(performanceKPIs.salesThisMonth / 1000000).toFixed(1)}M
                  </div>
                  <p className="text-xs text-slate-600">CA (FCFA)</p>
                </div>
              </div>

              <div className="p-4 bg-slate-900 text-white rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Perfect Store Score</span>
                  <span className="text-xl font-bold">{performanceKPIs.perfectStoreScore}%</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Paramètres */}
        <Card className="border border-slate-200">
          <div className="p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-6">Paramètres</h2>
            
            <div className="space-y-3">
              <label className="flex items-center justify-between py-3 cursor-pointer group">
                <span className="text-sm text-slate-700 group-hover:text-slate-900">Mode sombre</span>
                <input
                  type="checkbox"
                  checked={settings.darkMode}
                  onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                  className="w-4 h-4 text-slate-900 rounded focus:ring-2 focus:ring-slate-900"
                />
              </label>
              
              <label className="flex items-center justify-between py-3 cursor-pointer group">
                <span className="text-sm text-slate-700 group-hover:text-slate-900">Synchronisation auto</span>
                <input
                  type="checkbox"
                  checked={settings.autoSync}
                  onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                  className="w-4 h-4 text-slate-900 rounded focus:ring-2 focus:ring-slate-900"
                />
              </label>

              {userRole === 'REP' && (
                <label className="flex items-center justify-between py-3 opacity-50 cursor-not-allowed">
                  <span className="text-sm text-slate-700">Géolocalisation</span>
                  <input
                    type="checkbox"
                    checked={settings.geoLocation}
                    disabled
                    className="w-4 h-4 text-slate-900 rounded"
                  />
                </label>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-slate-100">
              <label className="block text-sm font-medium text-slate-700 mb-3">Qualité des photos</label>
              <div className="space-y-2">
                {[
                  { value: 'high', label: 'Haute qualité' },
                  { value: 'medium', label: 'Moyenne' },
                  { value: 'low', label: 'Économie de données' },
                ].map((quality) => (
                  <label key={quality.value} className="flex items-center gap-3 py-2 cursor-pointer">
                    <input
                      type="radio"
                      name="photoQuality"
                      value={quality.value}
                      checked={settings.photoQuality === quality.value}
                      onChange={(e) => setSettings({ ...settings, photoQuality: e.target.value })}
                      className="w-4 h-4 text-slate-900 focus:ring-2 focus:ring-slate-900"
                    />
                    <span className="text-sm text-slate-700">{quality.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Sécurité */}
        <Card className="border border-slate-200">
          <div className="p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Sécurité</h2>
            <Button 
              variant="outline" 
              fullWidth
              onClick={() => setShowPasswordModal(true)}
            >
              Changer le mot de passe
            </Button>
          </div>
        </Card>

        {/* Support */}
        <Card className="border border-slate-200">
          <div className="p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Support & Aide</h2>
            <div className="space-y-2">
              <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                Guide utilisateur
              </button>
              <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                Contacter le support
              </button>
              <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 rounded-lg transition-colors">
                Politique de confidentialité
              </button>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-center">Version 1.2.3</p>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-3">
          <Button variant="primary" fullWidth onClick={handleLogout}>
            Déconnexion
          </Button>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full text-sm text-red-600 hover:text-red-700 py-2"
          >
            Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Modal changement mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowPasswordModal(false)}>
          <Card className="w-full max-w-md border border-slate-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">Changer le mot de passe</h3>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Mot de passe actuel
                  </label>
                  <input
                    type="password"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nouveau mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Confirmer le mot de passe
                  </label>
                  <input
                    type="password"
                    className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setShowPasswordModal(false)}>
                  Annuler
                </Button>
                <Button variant="primary" fullWidth onClick={() => {
                  alert('Mot de passe modifié');
                  setShowPasswordModal(false);
                }}>
                  Confirmer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Modal 2FA */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={(e) => e.target === e.currentTarget && setShow2FAModal(false)}>
          <Card className="w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-xl animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🔐</span>
                <span>Authentification 2FA</span>
              </h3>
              <button 
                onClick={() => {
                  setShow2FAModal(false);
                  setQrCode('');
                  setSecret('');
                  setTwoFactorCode('');
                  setError2FA('');
                  setMessage2FA('');
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors text-xl"
              >
                ✕
              </button>
            </div>

            {error2FA && (
              <div className="mb-4 bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-2">
                <span className="text-xl">❌</span>
                <p className="text-sm text-red-600 font-medium flex-1">{error2FA}</p>
              </div>
            )}

            {message2FA && (
              <div className="mb-4 bg-green-50 border-2 border-green-200 rounded-xl p-4 flex items-start gap-2">
                <span className="text-xl">✅</span>
                <p className="text-sm text-green-600 font-medium flex-1">{message2FA}</p>
              </div>
            )}

            {!qrCode ? (
              <div>
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  L'authentification à deux facteurs ajoute une couche de sécurité supplémentaire à votre compte.
                </p>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 mb-5 border border-blue-100">
                  <p className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <span>💡</span>
                    <span>Comment ça marche ?</span>
                  </p>
                  <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                    <li>Installez une app d'authentification (Google Authenticator, Authy, etc.)</li>
                    <li>Scannez le QR code généré</li>
                    <li>Entrez le code à 6 chiffres pour activer</li>
                  </ol>
                </div>
                <Button
                  variant="primary"
                  fullWidth
                  size="lg"
                  onClick={handleGenerate2FA}
                  disabled={loading2FA}
                  className="bg-primary text-white hover:bg-blue-700 disabled:bg-gray-400 shadow-md hover:shadow-lg transition-all py-4 font-semibold"
                >
                  {loading2FA ? '⏳ Génération...' : '🔐 Générer le QR Code'}
                </Button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">1</span>
                    <span>Scannez ce QR code avec votre application</span>
                  </p>
                  <div className="flex justify-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl shadow-inner">
                    <img src={qrCode} alt="QR Code 2FA" className="w-48 h-48 rounded-xl" />
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-gray-900 mb-2">
                    Ou entrez ce code manuellement :
                  </p>
                  <div className="bg-gray-100 p-4 rounded-xl border border-gray-200">
                    <code className="text-sm font-mono break-all text-gray-800 font-semibold">{secret}</code>
                  </div>
                </div>

                <form onSubmit={handleEnable2FA} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                      <span className="bg-primary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs">2</span>
                      <span>Entrez le code à 6 chiffres</span>
                    </label>
                    <input
                      type="text"
                      value={twoFactorCode}
                      onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="000000"
                      maxLength={6}
                      required
                      className="w-full border-2 border-gray-300 focus:border-primary rounded-xl px-4 py-4 text-center text-3xl font-mono tracking-widest bg-white focus:outline-none focus:ring-4 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button
                      variant="outline"
                      fullWidth
                      onClick={() => {
                        setQrCode('');
                        setSecret('');
                        setTwoFactorCode('');
                      }}
                      type="button"
                      className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors py-3 font-semibold"
                    >
                      Annuler
                    </Button>
                    <Button
                      variant="success"
                      fullWidth
                      type="submit"
                      disabled={loading2FA || twoFactorCode.length !== 6}
                      className="bg-green-500 text-white hover:bg-green-600 disabled:bg-gray-400 shadow-md hover:shadow-lg transition-all py-3 font-semibold"
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

      {/* Modal suppression */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <Card className="w-full max-w-md border border-slate-200">
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-red-600 text-xl">⚠</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">Supprimer le compte</h3>
                <p className="text-sm text-slate-600">
                  Cette action est irréversible. Toutes vos données seront définitivement supprimées.
                </p>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Tapez <span className="font-bold">SUPPRIMER</span> pour confirmer
                </label>
                <input
                  type="text"
                  className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent"
                  placeholder="SUPPRIMER"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="outline" fullWidth onClick={() => setShowDeleteModal(false)}>
                  Annuler
                </Button>
                <Button variant="danger" fullWidth onClick={handleDeleteAccount}>
                  Confirmer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
