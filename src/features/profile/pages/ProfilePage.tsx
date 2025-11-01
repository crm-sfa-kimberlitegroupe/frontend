import { useState, useEffect } from 'react';
import { useAuthStore } from '../../../core/auth';
import { usersService, type UserPerformance, type ManagerInfo } from '@/features/users/services';
import type { UserRole } from '../../../core/types';
import Button from '../../../core/ui/Button';

// Import des composants modulaires
import ProfileHeader from '../components/ProfileHeader';
import PersonalInfoSection from '../components/PersonalInfoSection';
import ProfessionalInfoSection from '../components/ProfessionalInfoSection';
import ManagerInfoSection from '../components/ManagerInfoSection';
import PerformanceSection from '../components/PerformanceSection';
import SettingsSection from '../components/SettingsSection';
import SyncSection from '../components/SyncSection';
import SecuritySection from '../components/SecuritySection';
import SupportSection from '../components/SupportSection';
import PasswordModal from '../components/PasswordModal';
import DeleteAccountModal from '../components/DeleteAccountModal';
import TwoFactorModal from '../components/TwoFactorModal';

export default function ProfilePage() {
  const { user, logout } = useAuthStore();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [is2FAEnabled, setIs2FAEnabled] = useState(false);
  const [loading, setLoading] = useState(true);

  const userRole: UserRole = (user?.role as UserRole) || 'REP';

  // États pour les données du profil
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    photo: user?.photo || user?.photo || null,
    territory: user?.territory || '',
    matricule: user?.matricule || '',
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

  const [managerInfo, setManagerInfo] = useState<ManagerInfo | null>(null);

  // Charger les données utilisateur au montage
  useEffect(() => {
    const loadUserData = async () => {
      if (user?.id) {
        try {
          setLoading(true);
          
          const userData = await usersService.getById(user.id);
          
          setProfileData({
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: userData.email,
            phone: userData.phone || '',
            photo: userData.photoUrl || userData.photo || null,
            territory: userData.territoryName || userData.territory || '',
            matricule: userData.matricule || '',
            hireDate: userData.hireDate || '',
            manager: userData.manager || '',
            isActive: userData.isActive,
          });
          
          // Charger les performances (seulement pour REP)
          if (userData.role === 'REP') {
            try {
              const performance = await usersService.getPerformance(user.id);
              setPerformanceKPIs(performance);
            } catch {
              // Erreur silencieuse pour les performances
            }
          }

          // Charger les informations du manager (pour tous les rôles sauf SUP qui n'ont généralement pas de manager)
          try {
            const manager = await usersService.getManager(user.id);
            setManagerInfo(manager);
          } catch {
            // Erreur silencieuse si pas de manager
            setManagerInfo(null);
          }
        } catch {
          alert('Erreur lors du chargement des données');
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
      await usersService.update(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || '',
        matricule: profileData.matricule || undefined,
        hireDate: profileData.hireDate || undefined,
      });
      alert('Modifications enregistrées avec succès');
    } catch {
      alert('Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  const handleSync = () => {
    alert('Synchronisation en cours...');
  };

  const handleLogout = async () => {
    if (confirm('Voulez-vous vraiment vous déconnecter ?')) {
      await logout();
    }
  };

  const handleDeleteAccount = () => {
    if (confirm('ATTENTION: Cette action est irréversible. Confirmer la suppression du compte ?')) {
      alert('Compte supprimé');
      setShowDeleteModal(false);
    }
  };

  const updateProfileData = (updates: Partial<typeof profileData>) => {
    setProfileData(prev => ({ ...prev, ...updates }));
  };

  const updateSettings = (updates: Partial<typeof settings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  };

  const handlePhotoUpdate = (photoUrl: string) => {
    setProfileData(prev => ({ ...prev, photo: photoUrl }));
  };

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
      {/* En-tête */}
      <ProfileHeader
        firstName={profileData.firstName}
        lastName={profileData.lastName}
        email={profileData.email}
        photo={profileData.photo}
        role={userRole}
        isActive={profileData.isActive}
        onPhotoUpdate={handlePhotoUpdate}
      />

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-4">
        {/* Section 1: Informations personnelles */}
        <PersonalInfoSection
          profileData={{
            firstName: profileData.firstName,
            lastName: profileData.lastName,
            email: profileData.email,
            phone: profileData.phone,
          }}
          onUpdate={updateProfileData}
          onSave={handleSave}
          userRole={userRole}
        />

        {/* Section 2: Informations professionnelles */}
        <ProfessionalInfoSection
          territory={profileData.territory}
          matricule={profileData.matricule}
          hireDate={profileData.hireDate}
          manager={profileData.manager}
        />

        {/* Section 2.5: Informations du supérieur hiérarchique */}
        {managerInfo && (
          <ManagerInfoSection
            manager={managerInfo}
            userRole={userRole}
          />
        )}

        {/* Section 3: Performances (seulement pour REP) */}
        {userRole === 'REP' && (
          <PerformanceSection performance={performanceKPIs} />
        )}

        {/* Section 4: Paramètres (seulement pour REP) */}
        {userRole === 'REP' && (
          <SettingsSection
            settings={{
              darkMode: settings.darkMode,
              autoSync: settings.autoSync,
              geoLocation: settings.geoLocation,
              photoQuality: settings.photoQuality,
            }}
            onUpdate={updateSettings}
            userRole={userRole}
          />
        )}

        {/* Section 5: Synchronisation (si REP) */}
        {userRole === 'REP' && (
          <SyncSection syncStatus={syncStatus} onSync={handleSync} />
        )}

        {/* Section 6: Sécurité */}
        <SecuritySection 
          onChangePassword={() => setShowPasswordModal(true)}
          userRole={userRole}
          on2FAClick={() => setShow2FAModal(true)}
          is2FAEnabled={is2FAEnabled}
        />

        {/* Section 7: Support & Légal */}
        <SupportSection />

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            variant="primary" 
            fullWidth
            onClick={handleLogout}
          >
            Déconnexion
          </Button>
        </div>
      </div>

      {/* Modals */}
      <PasswordModal 
        isOpen={showPasswordModal} 
        onClose={() => setShowPasswordModal(false)} 
      />
      
      <DeleteAccountModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
      />

      <TwoFactorModal
        isOpen={show2FAModal}
        onClose={() => setShow2FAModal(false)}
        is2FAEnabled={is2FAEnabled}
        onStatusChange={setIs2FAEnabled}
      />
    </div>
  );
}
