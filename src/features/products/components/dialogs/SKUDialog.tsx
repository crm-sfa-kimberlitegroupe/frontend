import { useState, useEffect } from 'react';
import { Modal, Button, Alert } from '@/core/ui';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import ImageUpload from '@/core/components/ImageUpload';
import { 
  SKU, 
  Category, 
  SubCategory, 
  Brand,
  PackFormat,
  PackSize 
} from '../../services/productHierarchy.service';
import { productHierarchyService } from '../../services/productHierarchy.service';

interface SKUDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<SKU>) => Promise<void>;
  sku?: SKU | null;
}

export default function SKUDialog({ open, onClose, onSave, sku }: SKUDialogProps) {
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Hierarchy data
  const [categories, setCategories] = useState<Category[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [packFormats, setPackFormats] = useState<PackFormat[]>([]);
  const [packSizes, setPackSizes] = useState<PackSize[]>([]);
  
  // Form data
  const [formData, setFormData] = useState({
    code: '',
    ean: '',
    shortDescription: '',
    fullDescription: '',
    packSizeId: '',
    priceHt: 0,
    vatRate: 19.25,
    active: true,
    photo: '',
  });
  
  // Image upload state
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  
  // Selected hierarchy levels
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedPackFormat, setSelectedPackFormat] = useState('');

  const steps = ['Hiérarchie', 'Informations', 'Prix'];

  useEffect(() => {
    if (open) {
      loadCategories();
      if (sku) {
        setFormData({
          code: sku.code,
          ean: sku.ean,
          shortDescription: sku.shortDescription,
          fullDescription: sku.fullDescription,
          packSizeId: sku.packSizeId,
          priceHt: Number(sku.priceHt), // Conversion string → number
          vatRate: Number(sku.vatRate), // Conversion string → number
          active: sku.active,
          photo: sku.photo || '',
        });
        setImageFile(null);
      } else {
        resetForm();
      }
    }
  }, [sku, open]);

  const resetForm = () => {
    setFormData({
      code: '',
      ean: '',
      shortDescription: '',
      fullDescription: '',
      packSizeId: '',
      priceHt: 0,
      vatRate: 19.25,
      active: true,
      photo: '',
    });
    setSelectedCategory('');
    setSelectedSubCategory('');
    setSelectedBrand('');
    setSelectedPackFormat('');
    setActiveStep(0);
    setError(null);
    setImageFile(null);
    setImageError(null);
    setUploadingImage(false);
  };

  const loadCategories = async () => {
    try {
      const cats = await productHierarchyService.getCategories(true);
      setCategories(cats);
    } catch (err) {
      console.error('Erreur chargement catégories:', err);
    }
  };

  const loadSubCategories = async (categoryId: string) => {
    try {
      const subCats = await productHierarchyService.getSubCategories(categoryId, true);
      setSubCategories(subCats);
    } catch (err) {
      console.error('Erreur chargement sous-catégories:', err);
    }
  };

  const loadBrands = async (subCategoryId: string) => {
    try {
      const brandsData = await productHierarchyService.getBrands(subCategoryId, true);
      setBrands(brandsData);
    } catch (err) {
      console.error('Erreur chargement marques:', err);
    }
  };

  const loadPackFormats = async (brandId: string) => {
    try {
      console.log('🔍 [SKUDialog] Chargement formats pour brandId:', brandId);
      // Utiliser le paramètre brandId pour filtrer directement côté backend
      const formats = await productHierarchyService.getPackFormats(brandId, true);
      console.log('✅ [SKUDialog] Formats chargés:', formats);
      setPackFormats(formats);
    } catch (err) {
      console.error('❌ [SKUDialog] Erreur chargement formats:', err);
    }
  };

  const loadPackSizes = async (packFormatId: string) => {
    try {
      console.log('🔍 [SKUDialog] Chargement tailles pour packFormatId:', packFormatId);
      // Utiliser le paramètre packFormatId pour filtrer directement côté backend
      const sizes = await productHierarchyService.getPackSizes(packFormatId, true);
      console.log('✅ [SKUDialog] Tailles chargées:', sizes);
      setPackSizes(sizes);
    } catch (err) {
      console.error('❌ [SKUDialog] Erreur chargement tailles:', err);
    }
  };

  const handleCategoryChange = async (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubCategory('');
    setSelectedBrand('');
    setFormData(prev => ({ ...prev, packSizeId: '' }));
    
    if (categoryId) {
      await loadSubCategories(categoryId);
    } else {
      setSubCategories([]);
    }
    setBrands([]);
    setPackSizes([]);
  };

  const handleSubCategoryChange = async (subCategoryId: string) => {
    setSelectedSubCategory(subCategoryId);
    setSelectedBrand('');
    setSelectedPackFormat('');
    setFormData(prev => ({ ...prev, packSizeId: '' }));
    
    if (subCategoryId) {
      await loadBrands(subCategoryId);
    } else {
      setBrands([]);
    }
    setPackFormats([]);
    setPackSizes([]);
  };

  const handleBrandChange = async (brandId: string) => {
    setSelectedBrand(brandId);
    setSelectedPackFormat('');
    setFormData(prev => ({ ...prev, packSizeId: '' }));
    
    if (brandId) {
      await loadPackFormats(brandId);
    } else {
      setPackFormats([]);
    }
    setPackSizes([]);
  };

  const handlePackFormatChange = async (packFormatId: string) => {
    setSelectedPackFormat(packFormatId);
    setFormData(prev => ({ ...prev, packSizeId: '' }));
    
    if (packFormatId) {
      await loadPackSizes(packFormatId);
    } else {
      setPackSizes([]);
    }
  };

  const calculatePriceTTC = () => {
    const priceHt = formData.priceHt || 0;
    const vatRate = formData.vatRate || 0;
    return priceHt * (1 + vatRate / 100);
  };

  const canGoNext = () => {
    if (activeStep === 0) {
      return !!formData.packSizeId;
    }
    if (activeStep === 1) {
      // EAN optionnel mais si rempli, doit avoir 13 chiffres
      const eanValid = !formData.ean || formData.ean.length === 13;
      return !!(formData.code && formData.shortDescription && eanValid);
    }
    return true;
  };

  const handleNext = () => {
    if (canGoNext()) {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Upload de l'image si présente
      let photoUrl = formData.photo;
      if (imageFile) {
        setUploadingImage(true);
        try {
          const uploadResult = await productHierarchyService.uploadSKUImage(imageFile);
          photoUrl = uploadResult.imageUrl;
          console.log('✅ [SKUDialog] Image uploadée:', photoUrl);
        } catch (uploadError) {
          console.error('❌ [SKUDialog] Erreur upload image:', uploadError);
          setImageError('Erreur lors de l\'upload de l\'image');
          setUploadingImage(false);
          setLoading(false);
          return;
        }
        setUploadingImage(false);
      }

      // Nettoyer les données avant envoi
      const cleanData: any = {
        code: formData.code,
        shortDescription: formData.shortDescription,
        packSizeId: formData.packSizeId,
        priceHt: formData.priceHt,
        vatRate: formData.vatRate,
        active: formData.active,
      };

      // Ajouter l'URL de la photo si présente
      if (photoUrl) {
        cleanData.photo = photoUrl;
      }

      // Ajouter EAN seulement s'il a 13 chiffres
      if (formData.ean && formData.ean.length === 13) {
        cleanData.ean = formData.ean;
      }

      // Ajouter fullDescription seulement s'il n'est pas vide
      if (formData.fullDescription && formData.fullDescription.trim().length > 0) {
        cleanData.fullDescription = formData.fullDescription;
      }

      console.log('📤 [SKUDialog] Envoi données:', cleanData);
      
      await onSave(cleanData);
      onClose();
      resetForm();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('❌ [SKUDialog] Erreur:', error);
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={sku ? 'Modifier le SKU' : 'Nouveau SKU'}
      size="lg"
    >
      <div className="space-y-6">
        {error && (
          <Alert variant="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Stepper */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                  index <= activeStep 
                    ? 'bg-sky-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1}
                </div>
                <span className={`mt-2 text-sm ${
                  index <= activeStep ? 'text-sky-600 font-medium' : 'text-gray-500'
                }`}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div className={`h-0.5 flex-1 mx-2 ${
                  index < activeStep ? 'bg-sky-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Hiérarchie */}
        {activeStep === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sous-catégorie <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSubCategory}
                  onChange={(e) => handleSubCategoryChange(e.target.value)}
                  disabled={!selectedCategory}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Sélectionner</option>
                  {subCategories.map((subCat) => (
                    <option key={subCat.id} value={subCat.id}>{subCat.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Marque <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => handleBrandChange(e.target.value)}
                  disabled={!selectedSubCategory}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Sélectionner</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>{brand.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Format <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedPackFormat}
                  onChange={(e) => handlePackFormatChange(e.target.value)}
                  disabled={!selectedBrand}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Sélectionner</option>
                  {packFormats.map((format) => (
                    <option key={format.id} value={format.id}>{format.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taille <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.packSizeId}
                  onChange={(e) => setFormData({ ...formData, packSizeId: e.target.value })}
                  disabled={!selectedPackFormat}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent disabled:bg-gray-100"
                >
                  <option value="">Sélectionner</option>
                  {packSizes.map((size) => (
                    <option key={size.id} value={size.id}>{size.name}</option>
                  ))}
                </select>
              </div>
            </div>

          </div>
        )}

        {/* Step 1: Informations */}
        {activeStep === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code SKU <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  maxLength={50}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Ex: SKU001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code EAN (13 chiffres)
                </label>
                <input
                  type="text"
                  value={formData.ean}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, ''); // Seulement des chiffres
                    setFormData({ ...formData, ean: value });
                  }}
                  maxLength={13}
                  pattern="\d{13}"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  placeholder="Ex: 1234567890123"
                />
                {formData.ean && formData.ean.length !== 13 && formData.ean.length > 0 && (
                  <p className="text-xs text-red-600 mt-1">Le code EAN doit contenir exactement 13 chiffres</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description courte <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                maxLength={100}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Description courte du produit"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description complète
              </label>
              <textarea
                value={formData.fullDescription}
                onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
                maxLength={500}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                placeholder="Description détaillée du produit"
              />
            </div>

            <ImageUpload
              value={formData.photo}
              onChange={(file) => {
                setImageFile(file);
                setImageError(null);
              }}
              label="Image du produit"
              error={imageError || undefined}
              disabled={loading || uploadingImage}
              maxSize={5}
            />

            {uploadingImage && (
              <div className="flex items-center gap-2 text-sm text-sky-600">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-sky-600 border-t-transparent"></div>
                <span>Upload de l'image en cours...</span>
              </div>
            )}

            <div className="flex items-center">
              <input
                type="checkbox"
                id="active"
                checked={formData.active}
                onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
              />
              <label htmlFor="active" className="ml-2 text-sm text-gray-700">
                SKU actif
              </label>
            </div>
          </div>
        )}

        {/* Step 2: Prix */}
        {activeStep === 2 && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix HT <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.priceHt}
                    onChange={(e) => setFormData({ ...formData, priceHt: parseFloat(e.target.value) || 0 })}
                    min="0"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">FCFA</span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Taux TVA <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.vatRate}
                    onChange={(e) => setFormData({ ...formData, vatRate: parseFloat(e.target.value) || 0 })}
                    min="0"
                    max="100"
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                  <span className="absolute right-3 top-2 text-gray-500">%</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-sky-50 border border-sky-200 rounded-lg">
              <h4 className="font-semibold text-sky-900 text-lg">
                Prix TTC calculé: {calculatePriceTTC().toFixed(2)} FCFA
              </h4>
              <p className="text-sm text-sky-700 mt-1">
                Prix HT + TVA ({formData.vatRate}%)
              </p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between pt-6 border-t">
          <div>
            {activeStep > 0 && (
              <Button
                variant="outline"
                onClick={handleBack}
                disabled={loading}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Précédent
              </Button>
            )}
          </div>
          
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Annuler
            </Button>
            
            {activeStep < steps.length - 1 ? (
              <Button
                variant="primary"
                onClick={handleNext}
                disabled={!canGoNext()}
              >
                Suivant
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
}
