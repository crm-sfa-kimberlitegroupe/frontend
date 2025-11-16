import { useState, useEffect } from 'react';
import { Icon } from '@/core/ui/Icon';
import Button from '@/core/ui/Button';
import Card from '@/core/ui/Card';
import { vendorStockService, type AddStockDto } from '../services/vendorStockService';
import api from '@/core/api/api';

interface SKU {
  id: string;
  ean: string;
  name: string;
  brand: string;
  category: string | null;
  photo: string | null;
  priceHt: number;
}

interface StockItem {
  skuId: string;
  quantity: number;
  alertThreshold?: number;
  sku?: SKU;
  tempId: string; // Pour identifier les lignes de manière unique
}

interface AddStockModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStockModal({ onClose, onSuccess }: AddStockModalProps) {
  const [skus, setSkus] = useState<SKU[]>([]);
  const [items, setItems] = useState<StockItem[]>([{ skuId: '', quantity: 0, tempId: Date.now().toString() }]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSKUs, setIsLoadingSKUs] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadSKUs();
  }, []);

  const loadSKUs = async () => {
    try {
      setIsLoadingSKUs(true);
      console.log('🔄 Chargement des SKUs depuis /admin/products/skus...');
      
      // api.get() retourne DIRECTEMENT les données (pas dans response.data)
      const data = await api.get('/admin/products/skus', { params: { active: true } });
      
      console.log('📦 Données reçues:', data);
      
      // La réponse est paginée : { items: [], total, page, limit, totalPages }
      const skusList = data.items || data;
      
      // Vérifier que nous avons un tableau
      if (!Array.isArray(skusList)) {
        console.error('❌ skusList n\'est pas un tableau:', skusList);
        setError('Format de réponse invalide du serveur');
        return;
      }
      
      console.log('📦 Nombre de SKUs:', skusList.length);
      
      // Transformer les données pour correspondre au format attendu
      const transformedSkus = skusList.map((sku: any) => ({
        id: String(sku.id || ''),
        ean: String(sku.ean || sku.code || ''),
        name: String(sku.shortDescription || sku.name || ''),
        brand: String((sku.packSize as any)?.packFormat?.brand?.name || 'Sans marque'),
        category: String((sku.packSize as any)?.packFormat?.brand?.subCategory?.category?.name || 'Non catégorisé'),
        photo: String(sku.photo || ''),
        priceHt: Number(sku.priceHt || 0),
      })) as SKU[];
      
      console.log('✅ SKUs transformés:', transformedSkus.length, 'produits');
      setSkus(transformedSkus);
    } catch (err: unknown) {
      console.error('❌ Erreur chargement SKUs:', err);
      setError(err instanceof Error ? err.message : 'Erreur lors du chargement des produits');
    } finally {
      setIsLoadingSKUs(false);
    }
  };

  const handleAddLine = () => {
    setItems([...items, { skuId: '', quantity: 0, tempId: Date.now().toString() }]);
  };

  const handleRemoveLine = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: 'skuId' | 'quantity' | 'alertThreshold', value: string | number) => {
    const newItems = [...items];
    if (field === 'skuId') {
      newItems[index].skuId = value as string;
      const sku = skus.find(s => s.id === value);
      newItems[index].sku = sku;
    } else if (field === 'quantity') {
      newItems[index].quantity = Number(value);
    } else if (field === 'alertThreshold') {
      newItems[index].alertThreshold = value ? Number(value) : undefined;
    }
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    const validItems = items.filter(item => item.skuId && item.quantity > 0);
    if (validItems.length === 0) {
      setError('Veuillez ajouter au moins un produit avec une quantité valide');
      return;
    }

    try {
      setIsLoading(true);
      const data: AddStockDto = {
        items: validItems.map(item => ({
          skuId: item.skuId,
          quantity: item.quantity,
        })),
        notes: notes || undefined,
      };
      
      await vendorStockService.addStock(data);
      onSuccess();
    } catch (err: unknown) {
      console.error('Erreur ajout stock:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err 
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erreur lors de l\'ajout du stock'
        : 'Erreur lors de l\'ajout du stock';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedSKUIds = () => items.map(item => item.skuId).filter(Boolean);
  const getAvailableSKUs = (currentSkuId: string) => {
    const selectedIds = getSelectedSKUIds();
    const availableSkus = skus?.filter(sku => sku.id === currentSkuId || !selectedIds.includes(sku.id)) || [];
    
    // Filtrer par terme de recherche si présent
    if (searchTerm) {
      return availableSkus.filter(sku => 
        sku.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sku.ean.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    return availableSkus;
  };

  // Calculer le total des quantités et la valeur estimée
  const getTotalQuantity = () => items.reduce((sum, item) => sum + (item.quantity || 0), 0);
  const getTotalValue = () => {
    return items.reduce((sum, item) => {
      if (item.sku && item.quantity) {
        return sum + (item.sku.priceHt * item.quantity);
      }
      return sum;
    }, 0);
  };

  const getValidItemsCount = () => items.filter(item => item.skuId && item.quantity > 0).length;

  return (
    <div 
      className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-primary/90 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <Icon name="package" size="xl" className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Ajouter des Produits</h2>
                <p className="text-primary-100 text-sm">Ajoutez des produits à votre portefeuille</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Indicateur de progression */}
              <div className="hidden sm:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                <Icon name="checkCircle" size="sm" className="text-white" />
                <span className="text-sm font-medium">{getValidItemsCount()} produit{getValidItemsCount() > 1 ? 's' : ''}</span>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <Icon name="x" size="lg" className="text-white" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <form id="stock-form" onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-r-lg flex items-start gap-3">
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <Icon name="warning" size="md" className="text-red-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-red-800">Erreur</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Résumé rapide */}
          {getValidItemsCount() > 0 && (
            <Card className="mb-6 p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="chartBar" size="lg" variant="primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Résumé du stock</p>
                    <p className="text-xs text-gray-600">{getValidItemsCount()} produit{getValidItemsCount() > 1 ? 's' : ''} • {getTotalQuantity()} unités</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-primary">{getTotalValue().toLocaleString()} FCFA</p>
                  <p className="text-xs text-gray-600">Valeur estimée</p>
                </div>
              </div>
            </Card>
          )}

          {/* Liste des produits */}
          <div className="space-y-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-lg font-semibold text-gray-900">
                  Produits à ajouter
                </label>
                <p className="text-sm text-gray-600 mt-1">Sélectionnez vos produits et quantités</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddLine}
                className="flex items-center gap-2"
              >
                <Icon name="plus" size="sm" />
                Nouveau produit
              </Button>
            </div>

            {/* Barre de recherche globale */}
            <div className="relative">
              <Icon
                name="search"
                size="md"
                variant="grey"
                className="absolute left-3 top-1/2 -translate-y-1/2"
              />
              <input
                type="text"
                placeholder="Rechercher un produit par nom, marque ou code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
              />
            </div>

            {isLoadingSKUs ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="refresh" size="2xl" variant="primary" className="animate-spin" />
                </div>
                <p className="text-lg font-medium text-gray-900 mb-2">Chargement des produits</p>
                <p className="text-sm text-gray-600">Veuillez patienter...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item, index) => (
                  <Card key={item.tempId} className="p-5 border-2 border-gray-100 hover:border-primary/20 transition-colors">
                    <div className="flex items-start gap-4">
                      {/* Numéro de ligne */}
                      <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span className="text-sm font-bold text-primary">{index + 1}</span>
                      </div>

                      <div className="flex-1 space-y-4">
                        {/* Sélection produit avec design amélioré */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Produit *
                          </label>
                          <select
                            value={item.skuId}
                            onChange={(e) => handleItemChange(index, 'skuId', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent bg-white text-sm"
                            required
                          >
                            <option value="">🔍 Sélectionner un produit...</option>
                            {getAvailableSKUs(item.skuId).map((sku) => (
                              <option key={sku.id} value={sku.id}>
                                📦 {sku.name} - {sku.brand} ({sku.priceHt.toLocaleString()} FCFA)
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Affichage des détails du produit sélectionné */}
                        {item.sku && (
                          <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                            <div className="flex items-center gap-3">
                              {item.sku.photo ? (
                                <img 
                                  src={item.sku.photo} 
                                  alt={item.sku.name}
                                  className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                                />
                              ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Icon name="package" size="lg" variant="grey" />
                                </div>
                              )}
                              <div className="flex-1">
                                <p className="font-medium text-gray-900 text-sm">{item.sku.name}</p>
                                <p className="text-xs text-gray-600">{item.sku.brand} • {item.sku.ean}</p>
                                <p className="text-sm font-semibold text-primary">{item.sku.priceHt.toLocaleString()} FCFA/unité</p>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Quantité et seuil sur la même ligne */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Quantité *
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                value={item.quantity || ''}
                                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                                placeholder="Ex: 50"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent pr-16"
                                required
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">unités</span>
                            </div>
                            {item.sku && item.quantity && (
                              <p className="text-xs text-gray-600 mt-1">
                                Valeur: {(item.sku.priceHt * item.quantity).toLocaleString()} FCFA
                              </p>
                            )}
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Seuil d'alerte
                            </label>
                            <div className="relative">
                              <input
                                type="number"
                                min="0"
                                value={item.alertThreshold || ''}
                                onChange={(e) => handleItemChange(index, 'alertThreshold', e.target.value)}
                                placeholder="Ex: 10"
                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent pr-16"
                              />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">min</span>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">Alerte quand stock &lt; seuil</p>
                          </div>
                        </div>
                      </div>

                      {/* Bouton supprimer */}
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(index)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-xl transition-colors mt-8 flex-shrink-0"
                          title="Supprimer cette ligne"
                        >
                          <Icon name="trash" size="md" />
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-2">
              Notes et commentaires
            </label>
            <p className="text-sm text-gray-600 mb-3">Ajoutez des informations supplémentaires (optionnel)</p>
            <div className="relative">
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ex: Stock reçu ce matin de l'entrepôt central. Produits en parfait état. Prévoir réassort jeudi prochain..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
              />
              <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                {notes.length}/500
              </div>
            </div>
          </div>

          </form>
        </div>

        {/* Actions fixes en bas */}
        <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={isLoading}
              className="h-12"
            >
              <Icon name="x" size="md" className="mr-2" />
              Annuler
            </Button>
            <Button
              type="button"
              variant="primary"
              fullWidth
              disabled={isLoading || isLoadingSKUs || getValidItemsCount() === 0}
              className="h-12"
              onClick={() => document.getElementById('stock-form')?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))}
            >
              {isLoading ? (
                <>
                  <Icon name="refresh" size="md" className="animate-spin mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <Icon name="checkCircle" size="md" className="mr-2" />
                  Ajouter au portefeuille ({getValidItemsCount()} produit{getValidItemsCount() > 1 ? 's' : ''})
                </>
              )}
            </Button>
          </div>
          
          {/* Résumé rapide en bas */}
          {getValidItemsCount() > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600">
                  {getTotalQuantity()} unités • {getValidItemsCount()} produit{getValidItemsCount() > 1 ? 's' : ''}
                </span>
                <span className="font-semibold text-primary">
                  {getTotalValue().toLocaleString()} FCFA
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
