import { useState, useRef } from 'react';
import Badge from '../../../core/ui/Badge';
import { Icon } from '../../../core/ui/Icon';
import { usersService } from '../../../services/usersService';
import { useAuthStore } from '../../../core/auth';

interface ProfileHeaderProps {
  firstName: string;
  lastName: string;
  email: string;
  photo: string | null;
  role: string;
  isActive: boolean;
  onPhotoUpdate?: (photoUrl: string) => void;
}

export default function ProfileHeader({ 
  firstName, 
  lastName, 
  email, 
  photo, 
  role, 
  isActive,
  onPhotoUpdate 
}: ProfileHeaderProps) {
  const { user } = useAuthStore();
  const [uploading, setUploading] = useState(false);
  const [currentPhoto, setCurrentPhoto] = useState(photo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user?.id) return;

    // Vérifier le type de fichier
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Type de fichier non supporté. Utilisez JPG, PNG ou WEBP');
      return;
    }

    // Vérifier la taille (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('Le fichier est trop volumineux (max 5MB)');
      return;
    }

    try {
      setUploading(true);
      const photoUrl = await usersService.uploadPhoto(user.id, file);
      setCurrentPhoto(photoUrl);
      onPhotoUpdate?.(photoUrl);
      
      // Mettre à jour le store d'authentification
      const { updateUserPhoto } = useAuthStore.getState();
      updateUserPhoto(photoUrl);
      
      alert('Photo de profil mise à jour avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'upload:', error);
      alert('Erreur lors de l\'upload de la photo');
    } finally {
      setUploading(false);
    }
  };
  return (
    <div className="bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex items-start gap-6">
          {/* Photo de profil minimaliste */}
          <div className="relative group">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-2xl font-semibold text-slate-600 border-2 border-slate-200">
              {currentPhoto ? (
                <img src={currentPhoto} alt="Profile" className="w-full h-full rounded-full object-cover" />
              ) : (
                `${firstName[0]}${lastName[0]}`
              )}
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
              )}
            </div>
            <button 
              onClick={handlePhotoClick}
              disabled={uploading}
              className="absolute bottom-0 right-0 w-7 h-7 bg-slate-900 text-white rounded-full flex items-center justify-center text-xs hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Icon name="edit" size="xs" variant="white" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* Informations principales */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-semibold text-slate-900 mb-1">
              {firstName} {lastName}
            </h1>
            <p className="text-sm text-slate-600 mb-3">{email}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{role}</Badge>
              {isActive && <Badge variant="success">Actif</Badge>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
