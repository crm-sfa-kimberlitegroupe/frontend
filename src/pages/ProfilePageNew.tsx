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

  const [syncStatus] = useState({
    isOnline: true,
    lastSync: new Date(),
    pendingItems: 3,
    storageUsed: 45.2,
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
      <div className="pb-20 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement du profil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-24 safe-area-inset-bottom bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 min-h-screen">
      {/* Indicateur de connexion permanent */}
      <div className="fixed top-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200 px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${syncStatus.isOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
          <span className="text-xs font-medium text-gray-700">
            {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
          </span>
        </div>
        {syncStatus.pendingItems > 0 && (
          <span className="text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-semibold">
            {syncStatus.pendingItems} en attente
          </span>
        )}
      </div>

      {/* En-tête */}
      <div className="bg-gradient-to-br from-primary via-blue-600 to-sky-500 px-4 pt-16 pb-16 relative overflow-hidden mt-10">
        {/* Decorative elements - optimisés pour mobile */}
        <div className="absolute top-0 right-0 w-40 h-40 md:w-64 md:h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="absolute bottom-0 left-0 w-32 h-32 md:w-48 md:h-48 bg-white/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-4">
            {/* Photo de profil */}
            <div className="relative group">
              <div className="w-28 h-28 bg-white rounded-2xl flex items-center justify-center text-5xl shadow-2xl ring-4 ring-white/30 transition-transform group-hover:scale-105">
                {profileData.photo ? (
                  <img src={profileData.photo} alt="Profile" className="w-full h-full rounded-2xl object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <button className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg hover:bg-gray-50 transition-all hover:scale-110">
                <span className="text-xl">📷</span>
              </button>
            </div>

            {/* Infos principales */}
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold mb-2 drop-shadow-sm">
                {profileData.firstName} {profileData.lastName}
              </h1>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="bg-white/25 backdrop-blur-sm text-white border border-white/30 shadow-sm">
                  {userRole}
                </Badge>
                {profileData.isActive && (
                  <Badge variant="success" className="bg-green-500/30 backdrop-blur-sm text-white border border-white/30 shadow-sm">
                    ✓ Actif
                  </Badge>
                )}
              </div>
              <p className="text-sm opacity-95 drop-shadow-sm">{profileData.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-12 relative z-20">
        {/* Section 1: Informations personnelles */}
        <Card className="p-5 mb-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-primary/10 to-blue-500/10 rounded-xl flex items-center justify-center">
                <span className="text-xl">👤</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Informations personnelles</h2>
            </div>
            <button 
              onClick={() => setIsEditing(isEditing ? null : 'personal')}
              className="px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              <span>{isEditing === 'personal' ? '✕' : '✏️'}</span>
              {isEditing === 'personal' ? 'Annuler' : 'Éditer'}
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Prénom</label>
              {isEditing === 'personal' ? (
                <input
                  type="text"
                  value={profileData.firstName}
                  onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                  className="w-full border-2 border-primary/30 focus:border-primary rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{profileData.firstName}</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Nom</label>
              {isEditing === 'personal' ? (
                <input
                  type="text"
                  value={profileData.lastName}
                  onChange={(e) => setProfileData({ ...profileData, lastName: e.target.value })}
                  className="w-full border-2 border-primary/30 focus:border-primary rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{profileData.lastName}</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Email</label>
              {isEditing === 'personal' ? (
                <input
                  type="email"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  className="w-full border-2 border-primary/30 focus:border-primary rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{profileData.email}</p>
              )}
            </div>

            <div className="bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Téléphone</label>
              {isEditing === 'personal' ? (
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                  className="w-full border-2 border-primary/30 focus:border-primary rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                />
              ) : (
                <p className="text-sm font-medium text-gray-900">{profileData.phone}</p>
              )}
            </div>
          </div>

          {isEditing === 'personal' && (
            <Button 
              variant="primary" 
              size="md" 
              fullWidth 
              className="mt-5 shadow-lg hover:shadow-xl transition-shadow"
              onClick={handleSave}
            >
              <span className="flex items-center justify-center gap-2">
                <span>✓</span>
                <span>Enregistrer les modifications</span>
              </span>
            </Button>
          )}
        </Card>

        {/* Section 2: Informations professionnelles */}
        <Card className="p-5 mb-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/10 to-sky-500/10 rounded-xl flex items-center justify-center">
              <span className="text-xl">💼</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Informations professionnelles</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-gray-100 transition-colors">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <span>📍</span>
                <span>Territoire affecté</span>
              </span>
              <span className="text-sm font-semibold text-gray-900">{profileData.territory}</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-gray-100 transition-colors">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <span>🆔</span>
                <span>Matricule</span>
              </span>
              <span className="text-sm font-semibold text-gray-900">{profileData.employeeId}</span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-gray-100 transition-colors">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <span>📅</span>
                <span>Date d'embauche</span>
              </span>
              <span className="text-sm font-semibold text-gray-900">
                {new Date(profileData.hireDate).toLocaleDateString('fr-FR')}
              </span>
            </div>
            <div className="flex items-center justify-between py-3 px-4 bg-gradient-to-r from-gray-50 to-transparent rounded-xl hover:from-gray-100 transition-colors">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <span>👨‍💼</span>
                <span>Manager/Superviseur</span>
              </span>
              <span className="text-sm font-semibold text-gray-900">{profileData.manager}</span>
            </div>
          </div>
        </Card>

        {/* Section 3: Performances (si REP ou SUP) */}
        {(userRole === 'REP' || userRole === 'SUP') && (
          <Card className="p-5 mb-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100 bg-gradient-to-br from-white to-blue-50/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl flex items-center justify-center">
                <span className="text-xl">📈</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Mes performances</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all active:scale-95">
                <div className="text-4xl font-black text-white mb-1 drop-shadow-md">
                  {performanceKPIs.coverage}%
                </div>
                <p className="text-xs font-semibold text-white/90 mb-2">Taux de couverture</p>
                <div className="w-full bg-white/30 rounded-full h-2.5 backdrop-blur-sm">
                  <div 
                    className="bg-white h-2.5 rounded-full shadow-sm transition-all duration-500" 
                    style={{ width: `${performanceKPIs.coverage}%` }}
                  />
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-sky-600 rounded-2xl p-4 text-center shadow-md hover:shadow-lg transition-all active:scale-95">
                <div className="text-4xl font-black text-white mb-1 drop-shadow-md">
                  {performanceKPIs.strikeRate}%
                </div>
                <p className="text-xs font-semibold text-white/90 mb-2">Strike Rate</p>
                <div className="w-full bg-white/30 rounded-full h-2.5 backdrop-blur-sm">
                  <div 
                    className="bg-white h-2.5 rounded-full shadow-sm transition-all duration-500" 
                    style={{ width: `${performanceKPIs.strikeRate}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">🏪</span>
                  <p className="text-xs font-semibold text-gray-500 uppercase">Visites</p>
                </div>
                <p className="text-3xl font-black text-gray-900">{performanceKPIs.visitsThisMonth}</p>
                <p className="text-xs text-gray-500 mt-1">Ce mois</p>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💰</span>
                  <p className="text-xs font-semibold text-gray-500 uppercase">CA généré</p>
                </div>
                <p className="text-3xl font-black text-gray-900">
                  {(performanceKPIs.salesThisMonth / 1000000).toFixed(1)}M
                </p>
                <p className="text-xs text-gray-500 mt-1">FCFA</p>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl shadow-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⭐</span>
                  <span className="text-sm font-semibold text-white">Perfect Store Score</span>
                </div>
                <span className="text-2xl font-black text-white drop-shadow-md">{performanceKPIs.perfectStoreScore}%</span>
              </div>
            </div>
          </Card>
        )}

        {/* Section 4: Paramètres */}
        <Card className="p-5 mb-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl flex items-center justify-center">
              <span className="text-xl">⚙️</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Paramètres</h2>
          </div>
          
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>⚡</span>
                <span>Préférences</span>
              </p>
              <div className="space-y-2">
                <label className="flex items-center justify-between py-3 px-3 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <span>🌙</span>
                    <span>Mode sombre</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.darkMode}
                    onChange={(e) => setSettings({ ...settings, darkMode: e.target.checked })}
                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                <label className="flex items-center justify-between py-3 px-3 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                  <span className="text-sm text-gray-700 flex items-center gap-2">
                    <span>🔄</span>
                    <span>Synchronisation auto</span>
                  </span>
                  <input
                    type="checkbox"
                    checked={settings.autoSync}
                    onChange={(e) => setSettings({ ...settings, autoSync: e.target.checked })}
                    className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary/20"
                  />
                </label>
                {userRole === 'REP' && (
                  <label className="flex items-center justify-between py-3 px-3 bg-white rounded-lg opacity-60 cursor-not-allowed">
                    <span className="text-sm text-gray-700 flex items-center gap-2">
                      <span>📍</span>
                      <span>Géolocalisation</span>
                    </span>
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
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <span>📸</span>
                <span>Qualité des photos</span>
              </label>
              <div className="space-y-2">
                {[
                  { value: 'high', label: 'Haute', desc: 'Meilleure qualité', icon: '⭐⭐⭐' },
                  { value: 'medium', label: 'Moyenne', desc: 'Équilibrée', icon: '⭐⭐' },
                  { value: 'low', label: 'Basse', desc: 'Économie de données', icon: '⭐' },
                ].map((quality) => (
                  <label key={quality.value} className="flex items-center gap-3 py-3 px-3 bg-white rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <input
                      type="radio"
                      name="photoQuality"
                      value={quality.value}
                      checked={settings.photoQuality === quality.value}
                      onChange={(e) => setSettings({ ...settings, photoQuality: e.target.value })}
                      className="w-4 h-4 text-primary focus:ring-2 focus:ring-primary/20"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{quality.label}</span>
                        <span className="text-xs">{quality.icon}</span>
                      </div>
                      <span className="text-xs text-gray-500">{quality.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Section 5: Synchronisation (si REP) */}
        {userRole === 'REP' && (
          <Card className="p-5 mb-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100 bg-gradient-to-br from-white to-cyan-50/30">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 rounded-xl flex items-center justify-center">
                <span className="text-xl">🔄</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900">Synchronisation</h2>
            </div>
            
            <div className="space-y-3 mb-5">
              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl shadow-sm">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>📡</span>
                  <span>Statut connexion</span>
                </span>
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${syncStatus.isOnline ? 'bg-green-500 animate-pulse shadow-lg shadow-green-500/50' : 'bg-red-500'}`} />
                  <span className={`text-sm font-semibold ${syncStatus.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                    {syncStatus.isOnline ? 'En ligne' : 'Hors ligne'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl shadow-sm">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>🕐</span>
                  <span>Dernière sync</span>
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {syncStatus.lastSync.toLocaleTimeString('fr-FR')}
                </span>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl shadow-sm">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>⏳</span>
                  <span>Données en attente</span>
                </span>
                <Badge variant="warning" className="font-bold">{syncStatus.pendingItems}</Badge>
              </div>

              <div className="flex items-center justify-between py-3 px-4 bg-white rounded-xl shadow-sm">
                <span className="text-sm text-gray-600 flex items-center gap-2">
                  <span>💾</span>
                  <span>Stockage local</span>
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {syncStatus.storageUsed} MB
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <Button variant="primary" size="lg" fullWidth onClick={handleSync} className="bg-primary text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all active:scale-95 py-4 font-semibold">
                <span className="flex items-center justify-center gap-2">
                  <span className="text-lg">🔄</span>
                  <span>Synchroniser maintenant</span>
                </span>
              </Button>
              <Button variant="outline" size="md" fullWidth className="bg-white border-2 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 transition-colors py-3 font-medium">
                <span className="flex items-center justify-center gap-2">
                  <span>🗑️</span>
                  <span>Vider le cache</span>
                </span>
              </Button>
            </div>
          </Card>
        )}

        {/* Section 6: Sécurité */}
        <Card className="p-5 mb-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-red-500/10 to-pink-500/10 rounded-xl flex items-center justify-center">
              <span className="text-xl">🔒</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Sécurité</h2>
          </div>
          
          <Button 
            variant="outline" 
            size="md" 
            fullWidth
            onClick={() => setShowPasswordModal(true)}
            className="bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white transition-all py-4 font-semibold"
          >
            <span className="flex items-center justify-center gap-2">
              <span>🔑</span>
              <span>Changer le mot de passe</span>
            </span>
          </Button>
        </Card>

        {/* Section 7: Support & Légal */}
        <Card className="p-5 mb-4 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl flex items-center justify-center">
              <span className="text-xl">📚</span>
            </div>
            <h2 className="text-lg font-bold text-gray-900">Support & Légal</h2>
          </div>
          
          <div className="space-y-3">
            <button className="w-full text-left px-4 py-4 bg-white border-2 border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 rounded-xl transition-all hover:shadow-md group">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-3">
                  <span className="text-xl">📖</span>
                  <span>Tutoriels / Guide utilisateur</span>
                </span>
                <span className="text-gray-400 group-hover:text-indigo-500 group-hover:translate-x-1 transition-all font-bold">→</span>
              </div>
            </button>
            <button className="w-full text-left px-4 py-4 bg-white border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all hover:shadow-md group">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-3">
                  <span className="text-xl">💬</span>
                  <span>Contacter le support</span>
                </span>
                <span className="text-gray-400 group-hover:text-blue-500 group-hover:translate-x-1 transition-all font-bold">→</span>
              </div>
            </button>
            <button className="w-full text-left px-4 py-4 bg-white border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 rounded-xl transition-all hover:shadow-md group">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-800 flex items-center gap-3">
                  <span className="text-xl">📄</span>
                  <span>CGU / Politique de confidentialité</span>
                </span>
                <span className="text-gray-400 group-hover:text-purple-500 group-hover:translate-x-1 transition-all font-bold">→</span>
              </div>
            </button>
            <div className="px-4 py-3 bg-gray-50 rounded-xl">
              <span className="text-xs font-medium text-gray-500 flex items-center gap-2">
                <span>ℹ️</span>
                <span>Version de l'application: <span className="font-bold text-gray-700">v1.2.3</span></span>
              </span>
            </div>
          </div>
        </Card>

        {/* Section 8: Actions */}
        <div className="space-y-4 mb-6">
          <Button 
            variant="danger" 
            size="lg" 
            fullWidth
            onClick={handleLogout}
            className="border-2 border-red-500 bg-red-500 text-white hover:bg-red-600 hover:border-red-600 shadow-md hover:shadow-lg transition-all active:scale-95 font-bold py-4"
          >
            <span className="flex items-center justify-center gap-2">
              <span className="text-xl">🚪</span>
              <span>Déconnexion</span>
            </span>
          </Button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="w-full text-sm text-red-600 hover:text-red-700 font-medium hover:underline py-2 transition-colors"
          >
            ⚠️ Supprimer mon compte
          </button>
        </div>
      </div>

      {/* Modal changement mot de passe */}
      {showPasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={(e) => e.target === e.currentTarget && setShowPasswordModal(false)}>
          <Card className="w-full max-w-md p-6 shadow-xl animate-slideUp">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🔑</span>
                <span>Changer le mot de passe</span>
              </h3>
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe actuel
                </label>
                <input
                  type="password"
                  className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  type="password"
                  className="w-full border-2 border-gray-200 focus:border-primary rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => setShowPasswordModal(false)}
                className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors py-3 font-semibold"
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
                className="bg-primary text-white hover:bg-blue-700 shadow-md hover:shadow-lg transition-all py-3 font-semibold"
              >
                ✓ Confirmer
              </Button>
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

      {/* Modal suppression compte */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn" onClick={(e) => e.target === e.currentTarget && setShowDeleteModal(false)}>
          <Card className="w-full max-w-md p-6 shadow-xl animate-slideUp">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <p className="text-5xl">⚠️</p>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Supprimer le compte</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Cette action est <span className="font-bold text-red-600">irréversible</span>. Toutes vos données seront définitivement supprimées.
              </p>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Tapez <span className="font-bold text-red-600">"SUPPRIMER"</span> pour confirmer
              </label>
              <input
                type="text"
                className="w-full border-2 border-red-200 focus:border-red-500 rounded-xl px-4 py-3 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all"
                placeholder="SUPPRIMER"
              />
            </div>
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                fullWidth
                onClick={() => setShowDeleteModal(false)}
                className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-100 hover:border-gray-400 transition-colors py-3 font-semibold"
              >
                Annuler
              </Button>
              <Button 
                variant="danger" 
                fullWidth
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white hover:bg-red-600 shadow-md hover:shadow-lg transition-all py-3 font-bold"
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
