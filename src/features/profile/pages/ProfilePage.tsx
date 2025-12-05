import { useState } from 'react';
import { useAuthStore } from '../../../core/auth';
import { useUsersStore } from '@/features/users/stores/usersStore';
import type { UserPerformance } from '@/features/users/services';
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

  // Utiliser le store préchargé
  const { currentUser, userPerformance, managerInfo, updateUser } = useUsersStore();

  const userRole: UserRole = (user?.role as UserRole) || 'REP';

  // États pour les données du profil (depuis le store ou user)
  const [profileData, setProfileData] = useState({
    firstName: currentUser?.firstName || user?.firstName || '',
    lastName: currentUser?.lastName || user?.lastName || '',
    email: currentUser?.email || user?.email || '',
    phone: currentUser?.phone || user?.phone || '',
    photo: currentUser?.photoUrl || user?.photo || null,
    territory: currentUser?.territoryName || user?.territory || '',
    matricule: currentUser?.matricule || user?.matricule || '',
    hireDate: currentUser?.hireDate || user?.hireDate || '',
    manager: currentUser?.manager || user?.manager || '',
    isActive: currentUser?.isActive ?? user?.isActive ?? true,
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

  // Plus besoin de useEffect - les données sont déjà dans le store
  // Les données ont été préchargées par le DataPreloader
  
  // Utiliser les performances depuis le store
  const performanceKPIs: UserPerformance = userPerformance || {
    coverage: 0,
    strikeRate: 0,
    visitsThisMonth: 0,
    salesThisMonth: 0,
    perfectStoreScore: 0,
    totalOutlets: 0,
    visitedOutlets: 0,
    ordersThisMonth: 0,
    averageOrderValue: 0,
  };

  const handleSave = async () => {
    if (!user?.id) return;
    
    try {
      await updateUser(user.id, {
        firstName: profileData.firstName,
        lastName: profileData.lastName,
        phone: profileData.phone || '',
        matricule: profileData.matricule || '',
        hireDate: profileData.hireDate || '',
      });
      alert('Modifications enregistrées avec succès');
    } catch {
      alert('Erreur lors de la sauvegarde');
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
