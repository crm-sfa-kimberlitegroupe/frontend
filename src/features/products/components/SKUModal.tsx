import { useState, useEffect } from 'react';
import { X, Upload, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/core/ui';
import api from '@/core/api/api';

interface SKU {
  id: string;
  ean: string;
  name: string;
  brand: string;
  category?: string;
  description?: string;
  photo?: string;
  priceHt: number;
  vatRate: number;
  active: boolean;
}

interface SKUFormData {
  ean: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  photo: string;
  priceHt: number;
  vatRate: number;
  active: boolean;
}

interface SKUModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SKUFormData) => Promise<void>;
  sku?: SKU | null;
  mode: 'create' | 'edit';
}

export default function SKUModal({ isOpen, onClose, onSubmit, sku, mode }: SKUModalProps) {
  const [formData, setFormData] = useState<SKUFormData>({
    ean: '',
    name: '',
    brand: '',
    category: '',
    description: '',
    photo: '',
    priceHt: 0,
    vatRate: 18, // TVA par défaut 18%
    active: true,
  });

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Charger les données du SKU en mode édition
  useEffect(() => {
    if (sku && mode === 'edit') {
      setFormData({
        ean: sku.ean,
        name: sku.name,
        brand: sku.brand,
        category: sku.category || '',
        description: sku.description || '',
        photo: sku.photo || '',
        priceHt: Number(sku.priceHt),
        vatRate: Number(sku.vatRate),
        active: sku.active,
      });
      if (sku.photo) {
        setPhotoPreview(sku.photo);
      }
    } else {
      // Reset en mode création
      setFormData({
        ean: '',
        name: '',
        brand: '',
        category: '',
        description: '',
        photo: '',
        priceHt: 0,
        vatRate: 18,
        active: true,
      });
      setPhotoPreview('');
      setPhotoFile(null);
    }
  }, [sku, mode, isOpen]);

  // Gérer la sélection de photo
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload de la photo vers Cloudinary
  const uploadPhoto = async (): Promise<string> => {
    if (!photoFile) return formData.photo;

    setUploadingPhoto(true);
    try {
      const formDataUpload = new FormData();
      formDataUpload.append('file', photoFile);

      const response = await api.post<{ url: string }>('/cloudinary/upload', formDataUpload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data.url;
    } catch (error) {
      console.error('Erreur upload photo:', error);
      throw new Error('Erreur lors de l\'upload de la photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Soumettre le formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);

      // Upload de la photo si nécessaire
      let photoUrl = formData.photo;
      if (photoFile) {
        photoUrl = await uploadPhoto();
      }

      // Soumettre les données
      await onSubmit({
        ...formData,
        photo: photoUrl,
      });

      onClose();
    } catch (error: any) {
      alert(error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSubmitting(false);
    }
  };

  // Calculer le prix TTC
  const calculatePriceTTC = () => {
    return (formData.priceHt * (1 + formData.vatRate / 100)).toFixed(2);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">
            {mode === 'create' ? 'Nouveau Produit' : 'Modifier le Produit'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
            disabled={submitting || uploadingPhoto}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Photo du produit
            </label>
            <div className="flex items-start gap-4">
              {/* Preview */}
              <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <ImageIcon className="w-12 h-12 text-gray-400" />
                )}
              </div>

              {/* Upload Button */}
              <div className="flex-1">
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                  disabled={uploadingPhoto || submitting}
                />
                <label
                  htmlFor="photo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Choisir une photo
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  JPG, PNG ou WEBP. Max 5MB.
                </p>
                {uploadingPhoto && (
                  <p className="text-sm text-primary mt-2 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Upload en cours...
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* EAN et Nom */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Code EAN (Code-barres) *
              </label>
              <input
                type="text"
                value={formData.ean}
                onChange={(e) => setFormData({ ...formData, ean: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: 3760123456789"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom du produit *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Coca-Cola 33cl"
                required
                disabled={submitting}
              />
            </div>
          </div>

          {/* Marque et Catégorie */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Marque *
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Ex: Coca-Cola"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Catégorie
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                disabled={submitting}
              >
                <option value="">Sélectionner...</option>
                <option value="Boissons">Boissons</option>
                <option value="Snacks">Snacks</option>
                <option value="Hygiène">Hygiène</option>
                <option value="Alimentaire">Alimentaire</option>
                <option value="Entretien">Entretien</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              rows={3}
              placeholder="Description du produit..."
              disabled={submitting}
            />
          </div>

          {/* Prix HT et TVA */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix HT (FCFA) *
              </label>
              <input
                type="number"
                value={formData.priceHt}
                onChange={(e) => setFormData({ ...formData, priceHt: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                step="0.01"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                TVA (%) *
              </label>
              <input
                type="number"
                value={formData.vatRate}
                onChange={(e) => setFormData({ ...formData, vatRate: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                min="0"
                max="100"
                step="0.01"
                required
                disabled={submitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prix TTC (FCFA)
              </label>
              <input
                type="text"
                value={calculatePriceTTC()}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                disabled
                readOnly
              />
            </div>
          </div>

          {/* Statut */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-5 h-5 text-primary rounded focus:ring-2 focus:ring-primary"
                disabled={submitting}
              />
              <span className="text-sm font-medium text-gray-700">
                Produit actif (disponible à la vente)
              </span>
            </label>
          </div>

          {/* Boutons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={submitting || uploadingPhoto}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={submitting || uploadingPhoto}
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enregistrement...
                </>
              ) : (
                mode === 'create' ? 'Créer le produit' : 'Mettre à jour'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
