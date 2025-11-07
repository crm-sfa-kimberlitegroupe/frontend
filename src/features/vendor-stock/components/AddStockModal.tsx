import { useState, useEffect } from 'react';
import { Icon } from '@/core/ui/Icon';
import Button from '@/core/ui/Button';
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
}

interface AddStockModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddStockModal({ onClose, onSuccess }: AddStockModalProps) {
  const [skus, setSkus] = useState<SKU[]>([]);
  const [items, setItems] = useState<StockItem[]>([{ skuId: '', quantity: 0 }]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingSKUs, setIsLoadingSKUs] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSKUs();
  }, []);

  const loadSKUs = async () => {
    try {
      setIsLoadingSKUs(true);
      const response = await api.get('/skus', { params: { active: true } });
      setSkus(response.data);
    } catch (err) {
      console.error('Erreur chargement SKUs:', err);
      setError('Erreur lors du chargement des produits');
    } finally {
      setIsLoadingSKUs(false);
    }
  };

  const handleAddLine = () => {
    setItems([...items, { skuId: '', quantity: 0 }]);
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
    } catch (err: any) {
      console.error('Erreur ajout stock:', err);
      setError(err.response?.data?.message || 'Erreur lors de l\'ajout du stock');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedSKUIds = () => items.map(item => item.skuId).filter(Boolean);
  const getAvailableSKUs = (currentSkuId: string) => {
    const selectedIds = getSelectedSKUIds();
    return skus?.filter(sku => sku.id === currentSkuId || !selectedIds.includes(sku.id)) || [];
  };

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
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <Icon name="package" size="lg" variant="primary" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Ajouter du Stock</h2>
              <p className="text-sm text-gray-600">Stock pour ma journée</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Icon name="x" size="lg" variant="grey" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 140px)' }}>
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <Icon name="warning" size="lg" variant="danger" />
              <p className="text-sm text-red-700 flex-1">{error}</p>
            </div>
          )}

          {/* Liste des produits */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">
                Produits à ajouter
              </label>
              <button
                type="button"
                onClick={handleAddLine}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <Icon name="plus" size="sm" />
                Ajouter une ligne
              </button>
            </div>

            {isLoadingSKUs ? (
              <div className="text-center py-8">
                <Icon name="refresh" size="2xl" variant="primary" className="animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-600">Chargement des produits...</p>
              </div>
            ) : (
              items.map((item, index) => (
                <div key={index} className="flex gap-3 items-start">
                  <div className="flex-1 space-y-3">
                    {/* Sélection produit */}
                    <select
                      value={item.skuId}
                      onChange={(e) => handleItemChange(index, 'skuId', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="">Sélectionner un produit...</option>
                      {getAvailableSKUs(item.skuId).map((sku) => (
                        <option key={sku.id} value={sku.id}>
                          {sku.name} - {sku.brand} ({sku.priceHt} FCFA)
                        </option>
                      ))}
                    </select>

                    {/* Quantité */}
                    <input
                      type="number"
                      min="1"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                      placeholder="Quantité"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />

                    {/* Seuil d'alerte */}
                    <input
                      type="number"
                      min="0"
                      value={item.alertThreshold || ''}
                      onChange={(e) => handleItemChange(index, 'alertThreshold', e.target.value)}
                      placeholder="Seuil d'alerte (optionnel, ex: 10)"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>

                  {/* Bouton supprimer */}
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveLine(index)}
                      className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors mt-1"
                    >
                      <Icon name="trash" size="md" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optionnel)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Stock reçu ce matin..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              disabled={isLoading || isLoadingSKUs}
            >
              {isLoading ? (
                <>
                  <Icon name="refresh" size="md" className="animate-spin mr-2" />
                  Ajout en cours...
                </>
              ) : (
                <>
                  <Icon name="checkCircle" size="md" className="mr-2" />
                  Ajouter le stock
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
