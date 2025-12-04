import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { PageLayout, Card, Button } from '@/core/ui';
import { useVisitsStore } from '@/features/visits/stores/visitsStore';
import { vendorStockService, VendorStockItem } from '@/features/vendor-stock/services/vendorStockService';
import { merchandisingService, MerchCheckItem } from '../services/merchandisingService';
import { 
  ArrowLeft, 
  Camera, 
  Package, 
  FileText, 
  AlertTriangle, 
  Save, 
  CheckCircle,
  Plus,
  Trash2,
  Eye,
  Tag,
  ShoppingBag,
  X,
  Loader2
} from 'lucide-react';

// Interface pour un produit selectionne avec ses reponses
interface SelectedProduct {
  skuId: string;
  sku: VendorStockItem['sku'];
  isVisible: boolean;
  isPriceCorrect: boolean;
  isWellStocked: boolean;
  comment: string;
}

// Interface pour une photo
interface UploadedPhoto {
  id: string;
  fileKey: string;
  preview: string;
  uploading: boolean;
}

export default function MerchandisingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const visitId = searchParams.get('visitId');
  const pdvName = searchParams.get('pdvName') || 'Point de vente';
  const fromVisit = searchParams.get('fromVisit') === 'true';
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Store des visites
  const { updateVisitAddMerchId } = useVisitsStore();
  
  // Etats
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  // Produits disponibles et selectionnes
  const [availableProducts, setAvailableProducts] = useState<VendorStockItem[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  
  // Photos
  const [photos, setPhotos] = useState<UploadedPhoto[]>([]);
  
  // Notes
  const [notes, setNotes] = useState('');

  // Charger les produits disponibles (stock du vendeur)
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const portfolio = await vendorStockService.getMyPortfolio();
        console.log('[MerchandisingPage] Produits charges:', portfolio.length);
        setAvailableProducts(portfolio);
      } catch (err) {
        console.error('[MerchandisingPage] Erreur chargement produits:', err);
        setError('Erreur lors du chargement des produits');
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  // Ajouter un produit a la selection
  const handleAddProduct = (product: VendorStockItem) => {
    if (selectedProducts.some(p => p.skuId === product.skuId)) {
      return; // Deja selectionne
    }
    
    setSelectedProducts(prev => [...prev, {
      skuId: product.skuId,
      sku: product.sku,
      isVisible: false,
      isPriceCorrect: false,
      isWellStocked: false,
      comment: '',
    }]);
    setShowProductSelector(false);
  };

  // Retirer un produit de la selection
  const handleRemoveProduct = (skuId: string) => {
    setSelectedProducts(prev => prev.filter(p => p.skuId !== skuId));
  };

  // Mettre a jour une reponse booleenne
  const handleToggleAnswer = (skuId: string, field: 'isVisible' | 'isPriceCorrect' | 'isWellStocked') => {
    setSelectedProducts(prev => prev.map(p => 
      p.skuId === skuId ? { ...p, [field]: !p[field] } : p
    ));
  };

  // Mettre a jour le commentaire
  const handleCommentChange = (skuId: string, comment: string) => {
    setSelectedProducts(prev => prev.map(p => 
      p.skuId === skuId ? { ...p, comment } : p
    ));
  };

  // Calculer le score (pourcentage de reponses positives)
  const calculateScore = () => {
    if (selectedProducts.length === 0) return 0;
    const totalQuestions = selectedProducts.length * 3;
    const positiveAnswers = selectedProducts.reduce((sum, p) => {
      return sum + (p.isVisible ? 1 : 0) + (p.isPriceCorrect ? 1 : 0) + (p.isWellStocked ? 1 : 0);
    }, 0);
    return Math.round((positiveAnswers / totalQuestions) * 100);
  };

  // Gestion des photos
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const tempId = `temp-${Date.now()}-${Math.random()}`;
      const preview = URL.createObjectURL(file);
      
      // Ajouter avec etat uploading
      setPhotos(prev => [...prev, {
        id: tempId,
        fileKey: '',
        preview,
        uploading: true,
      }]);

      try {
        const result = await merchandisingService.uploadPhoto(file);
        // Mettre a jour avec l'URL reelle
        setPhotos(prev => prev.map(p => 
          p.id === tempId 
            ? { ...p, fileKey: result.fileKey, uploading: false }
            : p
        ));
      } catch (err) {
        console.error('[MerchandisingPage] Erreur upload photo:', err);
        // Retirer la photo en erreur
        setPhotos(prev => prev.filter(p => p.id !== tempId));
        setError('Erreur lors de l\'upload de la photo');
      }
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemovePhoto = (id: string) => {
    setPhotos(prev => prev.filter(p => p.id !== id));
  };

  // Sauvegarder le merchandising
  const handleSaveMerchandising = async () => {
    if (!visitId) {
      setError('Aucune visite en cours. Veuillez d\'abord faire un check-in.');
      return;
    }

    if (selectedProducts.length === 0) {
      setError('Veuillez selectionner au moins un produit.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Preparer les items
      const items: MerchCheckItem[] = selectedProducts.map(p => ({
        skuId: p.skuId,
        isVisible: p.isVisible,
        isPriceCorrect: p.isPriceCorrect,
        isWellStocked: p.isWellStocked,
        comment: p.comment || undefined,
      }));

      // Preparer les photos
      const photoData = photos
        .filter(p => p.fileKey && !p.uploading)
        .map(p => ({ fileKey: p.fileKey }));

      console.log('[MerchandisingPage] Envoi merchandising pour visite:', visitId);
      console.log('[MerchandisingPage] Items:', items);
      console.log('[MerchandisingPage] Photos:', photoData);

      const response = await merchandisingService.create({
        visitId,
        items,
        photos: photoData,
        notes: notes || undefined,
      });

      console.log('[MerchandisingPage] Reponse:', response);

      if (response?.id) {
        updateVisitAddMerchId(visitId, response.id);
      }

      setSuccess(true);

      setTimeout(() => {
        if (fromVisit) {
          navigate(-1);
        } else {
          navigate('/dashboard/visits');
        }
      }, 1500);
    } catch (err: unknown) {
      console.error('[MerchandisingPage] Erreur:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        setError(response?.data?.message || 'Erreur lors de l\'enregistrement');
      } else {
        setError('Erreur lors de l\'enregistrement du merchandising');
      }
    } finally {
      setLoading(false);
    }
  };

  const score = calculateScore();

  // Produits disponibles non selectionnes
  const unselectedProducts = availableProducts.filter(
    p => !selectedProducts.some(sp => sp.skuId === p.skuId)
  );

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => fromVisit ? navigate(-1) : navigate('/dashboard/visits')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Merchandising</h1>
              <p className="text-sm text-gray-500">{pdvName}</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">Merchandising enregistre avec succes !</p>
            </div>
          )}

          {/* Score en temps reel */}
          <Card>
            <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-purple-900">Score Perfect Store</h3>
                  <p className="text-sm text-purple-700">
                    {selectedProducts.length} produit{selectedProducts.length > 1 ? 's' : ''} verifie{selectedProducts.length > 1 ? 's' : ''}
                  </p>
                </div>
                <div className="text-4xl font-bold text-purple-600">{score}%</div>
              </div>
              <div className="mt-3 bg-purple-200 rounded-full h-3">
                <div 
                  className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Selection des produits */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  Produits a verifier
                </h2>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowProductSelector(true)}
                  disabled={loadingProducts || unselectedProducts.length === 0}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Ajouter
                </Button>
              </div>
            </div>

            {loadingProducts ? (
              <div className="p-8 text-center">
                <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-500">Chargement des produits...</p>
              </div>
            ) : selectedProducts.length === 0 ? (
              <div className="p-8 text-center">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <p className="text-sm text-gray-500">Aucun produit selectionne</p>
                <p className="text-xs text-gray-400 mt-1">
                  Cliquez sur "Ajouter" pour selectionner des produits
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {selectedProducts.map((product) => (
                  <div key={product.skuId} className="p-4">
                    {/* En-tete produit */}
                    <div className="flex items-start gap-3 mb-3">
                      {product.sku.photo ? (
                        <img
                          src={product.sku.photo}
                          alt={product.sku.shortDescription}
                          className="w-12 h-12 object-cover rounded-lg"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Package className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {product.sku.shortDescription}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {product.sku.packSize?.packFormat?.brand?.name || 'Sans marque'}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveProduct(product.skuId)}
                        className="text-gray-400 hover:text-red-500 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Questions booleennes */}
                    <div className="space-y-2">
                      {/* Question 1: Visibilite */}
                      <button
                        onClick={() => handleToggleAnswer(product.skuId, 'isVisible')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          product.isVisible 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <Eye className={`w-5 h-5 ${product.isVisible ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="flex-1 text-left text-sm">Produit visible en rayon?</span>
                        {product.isVisible ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </button>

                      {/* Question 2: Prix */}
                      <button
                        onClick={() => handleToggleAnswer(product.skuId, 'isPriceCorrect')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          product.isPriceCorrect 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <Tag className={`w-5 h-5 ${product.isPriceCorrect ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="flex-1 text-left text-sm">Prix affiche correct?</span>
                        {product.isPriceCorrect ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </button>

                      {/* Question 3: Stock */}
                      <button
                        onClick={() => handleToggleAnswer(product.skuId, 'isWellStocked')}
                        className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-all ${
                          product.isWellStocked 
                            ? 'bg-green-50 border-green-300' 
                            : 'bg-gray-50 border-gray-200'
                        }`}
                      >
                        <ShoppingBag className={`w-5 h-5 ${product.isWellStocked ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="flex-1 text-left text-sm">Bien approvisionne?</span>
                        {product.isWellStocked ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <div className="w-5 h-5 rounded-full border-2 border-gray-300" />
                        )}
                      </button>
                    </div>

                    {/* Commentaire optionnel */}
                    <input
                      type="text"
                      placeholder="Commentaire (optionnel)..."
                      value={product.comment}
                      onChange={(e) => handleCommentChange(product.skuId, e.target.value)}
                      className="mt-3 w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Photos merchandising */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Camera className="w-5 h-5 text-purple-600" />
                Photos (optionnel)
              </h2>
            </div>
            <div className="p-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoSelect}
                className="hidden"
              />
              
              <div className="grid grid-cols-3 gap-2">
                {/* Photos uploadees */}
                {photos.map((photo) => (
                  <div key={photo.id} className="relative aspect-square">
                    <img
                      src={photo.preview}
                      alt="Photo merchandising"
                      className="w-full h-full object-cover rounded-lg"
                    />
                    {photo.uploading && (
                      <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      </div>
                    )}
                    {!photo.uploading && (
                      <button
                        onClick={() => handleRemovePhoto(photo.id)}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
                
                {/* Bouton ajouter photo */}
                {photos.length < 5 && (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square bg-gray-100 rounded-lg flex flex-col items-center justify-center border-2 border-dashed border-gray-300 hover:border-purple-400 transition-colors"
                  >
                    <Camera className="w-8 h-8 text-gray-400" />
                    <span className="text-xs text-gray-400 mt-1">Ajouter</span>
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">
                {photos.length}/5 photos
              </p>
            </div>
          </Card>

          {/* Notes generales */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Notes generales
              </h2>
            </div>
            <div className="p-4">
              <textarea 
                className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Observations, remarques..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </Card>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loading}
              fullWidth
            >
              Annuler
            </Button>
            <Button
              onClick={handleSaveMerchandising}
              disabled={loading || !visitId || selectedProducts.length === 0}
              variant="primary"
              fullWidth
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-1" />
              {loading ? 'Enregistrement...' : 'Valider'}
            </Button>
          </div>

          {selectedProducts.length === 0 && (
            <p className="text-sm text-amber-600 text-center">
              Veuillez selectionner au moins un produit pour valider.
            </p>
          )}
        </div>

        {/* Modal de selection de produit */}
        {showProductSelector && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center">
            <div className="bg-white w-full sm:max-w-lg sm:rounded-lg max-h-[80vh] flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold">Selectionner un produit</h3>
                <button
                  onClick={() => setShowProductSelector(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto">
                {unselectedProducts.length === 0 ? (
                  <div className="p-8 text-center">
                    <Package className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Aucun produit disponible</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {unselectedProducts.map((product) => (
                      <button
                        key={product.skuId}
                        onClick={() => handleAddProduct(product)}
                        className="w-full p-4 flex items-center gap-3 hover:bg-gray-50 text-left"
                      >
                        {product.sku.photo ? (
                          <img
                            src={product.sku.photo}
                            alt={product.sku.shortDescription}
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {product.sku.shortDescription}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {product.sku.packSize?.packFormat?.brand?.name || 'Sans marque'} 
                            {' - '}
                            Stock: {product.quantity}
                          </p>
                        </div>
                        <Plus className="w-5 h-5 text-purple-600" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}
