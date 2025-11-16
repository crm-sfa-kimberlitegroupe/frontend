import React, { useState, useEffect } from 'react';
import { Modal, Button } from '@/core/ui';
import { SubCategory, Category } from '../../services/productHierarchy.service';

interface SubCategoryDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<SubCategory>) => Promise<void>;
  subCategory?: SubCategory | null;
  categories: Category[];
}

export default function SubCategoryDialog({ 
  open, 
  onClose, 
  onSave, 
  subCategory,
  categories 
}: SubCategoryDialogProps) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    categoryId: '',
    active: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (subCategory) {
      setFormData({
        code: subCategory.code,
        name: subCategory.name,
        description: subCategory.description || '',
        categoryId: subCategory.categoryId,
        active: subCategory.active,
      });
    } else {
      setFormData({
        code: '',
        name: '',
        description: '',
        categoryId: categories[0]?.id || '',
        active: true,
      });
    }
  }, [subCategory, categories, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    console.log('📝 [SubCategoryDialog] Soumission formulaire:', {
      formData: formData,
      categoriesAvailable: categories.length,
      categoryIdIsEmpty: !formData.categoryId
    });

    // Validation
    if (!formData.categoryId) {
      console.error('❌ [SubCategoryDialog] categoryId est vide!');
      setError('Veuillez sélectionner une catégorie parente');
      setLoading(false);
      return;
    }

    // Nettoyer les champs vides (ne pas envoyer de chaînes vides)
    const cleanData: any = {
      code: formData.code,
      name: formData.name,
      categoryId: formData.categoryId,
      active: formData.active,
    };

    // N'ajouter description que si elle n'est pas vide
    if (formData.description && formData.description.trim() !== '') {
      cleanData.description = formData.description;
    }

    console.log('🧹 [SubCategoryDialog] Données nettoyées:', cleanData);

    try {
      await onSave(cleanData);
      onClose();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('❌ [SubCategoryDialog] Erreur sauvegarde:', {
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
      title={subCategory ? 'Modifier la sous-catégorie' : 'Nouvelle sous-catégorie'}
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
            Catégorie parente <span className="text-red-500">*</span>
          </label>
          <select
            required
            value={formData.categoryId}
            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.code})
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
            placeholder="Ex: SCAT001"
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
            placeholder="Ex: Boissons gazeuses"
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
            placeholder="Description de la sous-catégorie..."
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
            Sous-catégorie active
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
            {loading ? 'Enregistrement...' : subCategory ? 'Modifier' : 'Créer'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
