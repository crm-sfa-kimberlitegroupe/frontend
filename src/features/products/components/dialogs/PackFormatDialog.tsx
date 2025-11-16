import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/core/ui';
import { PackFormat } from '../../services/productHierarchy.service';

interface SubBrand {
  id: string;
  code: string;
  name: string;
}

interface PackFormatDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<PackFormat>) => Promise<void>;
  packFormat?: PackFormat | null;
  subBrands: SubBrand[];
}

export default function PackFormatDialog({ 
  open, 
  onClose, 
  onSave, 
  packFormat,
  subBrands 
}: PackFormatDialogProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    displayName: '',
    brandId: '',
    description: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (packFormat) {
      setFormData({
        code: packFormat.code,
        name: packFormat.name,
        displayName: packFormat.displayName || '',
        brandId: packFormat.brandId || '',
        description: packFormat.description || '',
        active: packFormat.active,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        displayName: '',
        brandId: subBrands[0]?.id || '',
        description: '',
        active: true,
      });
    }
  }, [packFormat, subBrands, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('📝 [PackFormatDialog] Soumission formulaire:', { formData });

    // Validation
    if (!formData.brandId) {
      console.error('❌ [PackFormatDialog] brandId est vide!');
      setError('Veuillez sélectionner une marque');
      setLoading(false);
      return;
    }

    // Nettoyer les champs vides
    const cleanData: any = {
      code: formData.code,
      name: formData.name,
      brandId: formData.brandId,
      active: formData.active,
    };

    if (formData.displayName && formData.displayName.trim() !== '') {
      cleanData.displayName = formData.displayName;
    }

    if (formData.description && formData.description.trim() !== '') {
      cleanData.description = formData.description;
    }

    console.log('🧹 [PackFormatDialog] Données nettoyées:', cleanData);

    try {
      await onSave(cleanData);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('❌ [PackFormatDialog] Erreur sauvegarde:', {
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
      title={packFormat ? 'Modifier le format de pack' : 'Nouveau format de pack'}
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
            Marque <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.brandId}
            onChange={(e) => setFormData({ ...formData, brandId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="">Sélectionner une marque</option>
            {subBrands.map((brand) => (
              <option key={brand.id} value={brand.id}>
                {brand.name} ({brand.code})
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
            placeholder="Ex: PACK, CARTON, PALETTE"
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
            placeholder="Ex: Pack, Carton, Palette"
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
            placeholder="Ex: Pack de 6"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
            placeholder="Description du format..."
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
            Format actif
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
            {loading ? 'Enregistrement...' : packFormat ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
