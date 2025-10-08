import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import Button from '../ui/Button';
import type { User, CreateUserDto, UpdateUserDto } from '../../services/usersService';

interface UserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDto | UpdateUserDto) => Promise<void>;
  user?: User | null;
  mode: 'create' | 'edit';
}

export default function UserModal({ isOpen, onClose, onSubmit, user, mode }: UserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'REP' as 'REP' | 'ADMIN' | 'SUP',
    territoryId: '',
    phone: '',
    employeeId: '',
    hireDate: '',
    managerId: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Charger les données de l'utilisateur en mode édition
  useEffect(() => {
    if (mode === 'edit' && user) {
      setFormData({
        email: user.email,
        password: '', // Ne pas pré-remplir le mot de passe
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        territoryId: user.territory || '',
        phone: user.phone || '',
        employeeId: user.employeeId || '',
        hireDate: user.hireDate || '',
        managerId: user.manager || '',
      });
    } else {
      // Réinitialiser le formulaire en mode création
      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'REP',
        territoryId: '',
        phone: '',
        employeeId: '',
        hireDate: '',
        managerId: '',
      });
    }
    setError('');
  }, [mode, user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'create') {
        // Validation pour la création
        if (!formData.email || !formData.password || !formData.firstName || !formData.lastName) {
          setError('Tous les champs obligatoires doivent être remplis');
          setLoading(false);
          return;
        }

        await onSubmit(formData as CreateUserDto);
      } else {
        // En mode édition, ne pas envoyer le mot de passe s'il est vide
        const updateData: UpdateUserDto = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          role: formData.role,
          territoryId: formData.territoryId || undefined,
        };

        // Ajouter le mot de passe seulement s'il est fourni
        if (formData.password) {
          updateData.password = formData.password;
        }

        await onSubmit(updateData);
      }

      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Une erreur est survenue');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 my-8" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            {mode === 'create' ? 'Nouvel Utilisateur' : 'Modifier l\'Utilisateur'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={mode === 'edit'} // Email non modifiable en édition
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100 disabled:cursor-not-allowed"
              required={mode === 'create'}
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe {mode === 'create' && <span className="text-red-500">*</span>}
              {mode === 'edit' && <span className="text-gray-500 text-xs">(laisser vide pour ne pas modifier)</span>}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required={mode === 'create'}
              minLength={6}
              placeholder={mode === 'edit' ? 'Laisser vide pour ne pas modifier' : ''}
            />
            <p className="text-xs text-gray-500 mt-1">Minimum 6 caractères</p>
          </div>

          {/* Prénom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Prénom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
          </div>

          {/* Rôle */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rôle <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              required
            >
              <option value="REP">Vendeur (REP)</option>
              <option value="SUP">Superviseur (SUP)</option>
              <option value="ADMIN">Administrateur (ADMIN)</option>
            </select>
          </div>

          {/* Territoire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Territoire
            </label>
            <input
              type="text"
              value={formData.territoryId}
              onChange={(e) => setFormData({ ...formData, territoryId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: Plateau, Cocody, Adjamé..."
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Téléphone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="+225 07 12 34 56 78"
            />
          </div>

          {/* Matricule */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Matricule
            </label>
            <input
              type="text"
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Ex: REP-2024-001"
            />
          </div>

          {/* Date d'embauche */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date d'embauche
            </label>
            <input
              type="date"
              value={formData.hireDate}
              onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Manager (ID) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Manager (ID)
            </label>
            <input
              type="text"
              value={formData.managerId}
              onChange={(e) => setFormData({ ...formData, managerId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="ID du manager"
            />
            <p className="text-xs text-gray-500 mt-1">Laisser vide si pas de manager</p>
          </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={loading}
            >
              {loading ? 'Enregistrement...' : mode === 'create' ? 'Créer' : 'Enregistrer'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
