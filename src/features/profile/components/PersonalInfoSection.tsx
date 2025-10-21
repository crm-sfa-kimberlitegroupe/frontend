import { useState } from 'react';
import Card from '../../../core/ui/Card';
import Button from '../../../core/ui/Button';
import type { UserRole } from '../../../core/types';

interface PersonalInfoSectionProps {
  profileData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  onUpdate: (data: Partial<PersonalInfoSectionProps['profileData']>) => void;
  onSave: () => Promise<void>;
  userRole: UserRole;
}

export default function PersonalInfoSection({ profileData, onUpdate, onSave, userRole }: PersonalInfoSectionProps) {
  const [isEditing, setIsEditing] = useState(false);
  
  // Les REP ne peuvent pas modifier leurs informations personnelles
  const canEdit = userRole !== 'REP';

  const handleSave = async () => {
    await onSave();
    setIsEditing(false);
  };

  return (
    <Card className="border border-slate-200">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-semibold text-slate-900">Informations personnelles</h2>
          {canEdit && (
            <button 
              onClick={() => setIsEditing(!isEditing)}
              className="text-sm text-slate-600 hover:text-slate-900 font-medium"
            >
              {isEditing ? 'Annuler' : 'Modifier'}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Prénom</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.firstName}
                onChange={(e) => onUpdate({ firstName: e.target.value })}
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            ) : (
              <p className="text-sm text-slate-900">{profileData.firstName}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1.5">Nom</label>
            {isEditing ? (
              <input
                type="text"
                value={profileData.lastName}
                onChange={(e) => onUpdate({ lastName: e.target.value })}
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
            {isEditing ? (
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => onUpdate({ phone: e.target.value })}
                placeholder="+225 07 12 34 56 78"
                className="w-full border border-slate-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent"
              />
            ) : (
              <p className="text-sm text-slate-900">
                {profileData.phone || <span className="text-slate-400 italic">Non renseigné</span>}
              </p>
            )}
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex gap-3">
            <Button variant="outline" fullWidth onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button variant="primary" fullWidth onClick={handleSave}>
              Enregistrer
            </Button>
          </div>
        )}
      </div>
    </Card>
  );
}
