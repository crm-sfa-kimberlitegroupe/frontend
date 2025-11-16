import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/core/ui';
import { PackSize, PackFormat } from '../../services/productHierarchy.service';

interface PackSizeDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<PackSize>) => Promise<void>;
  packSize?: PackSize | null;
  packFormats: PackFormat[];
}

export default function PackSizeDialog({ 
  open, 
  onClose, 
  onSave, 
  packSize,
  packFormats 
}: PackSizeDialogProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    displayName: '',
    packFormatId: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (packSize) {
      setFormData({
        code: packSize.code,
        name: packSize.name,
        displayName: packSize.displayName || '',
        packFormatId: packSize.packFormatId,
        active: packSize.active,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        displayName: '',
        packFormatId: packFormats[0]?.id || '',
        active: true,
      });
    }
  }, [packSize, packFormats, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('📝 [PackSizeDialog] Soumission formulaire:', { formData });

    // Validation
    if (!formData.packFormatId) {
      console.error('❌ [PackSizeDialog] packFormatId est vide!');
      setError('Veuillez sélectionner un format de pack');
      setLoading(false);
      return;
    }

    // Nettoyer les champs vides
    const cleanData: any = {
      code: formData.code,
      name: formData.name,
      packFormatId: formData.packFormatId,
      active: formData.active,
    };

    if (formData.displayName && formData.displayName.trim() !== '') {
      cleanData.displayName = formData.displayName;
    }

    console.log('🧹 [PackSizeDialog] Données nettoyées:', cleanData);

    try {
      await onSave(cleanData);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('❌ [PackSizeDialog] Erreur sauvegarde:', {
        error: err,
        errorMessage: error.response?.data?.message
      });
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={packSize ? 'Modifier la taille de pack' : 'Nouvelle taille de pack'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Format de pack <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.packFormatId}
            onChange={(e) => setFormData({ ...formData, packFormatId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="">Sélectionner un format</option>
            {packFormats.map((format) => (
              <option key={format.id} value={format.id}>
                {format.name} ({format.code})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Code <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="Ex: 250ML, 500ML, 1L"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="Ex: 250ml, 500ml, 1 Litre"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nom d'affichage
          </label>
          <input
            type="text"
            value={formData.displayName}
            onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="Ex: Bouteille 250ml, Pack de 6"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="active"
            checked={formData.active}
            onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
            className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
          />
          <label htmlFor="active" className="ml-2 text-sm text-gray-700">
            Taille active
          </label>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading}
          >
            {loading ? 'Enregistrement...' : packSize ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
