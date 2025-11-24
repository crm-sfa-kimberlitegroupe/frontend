import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout, Button, Card } from '@/core/ui';
import api from '@/core/api/api';
import { useOrdersStore } from '../stores/ordersStore';

interface SKU {
  id: string;
  code: string;
  shortDescription: string;
  priceHt: number;
  vatRate: number;
  priceTtc: number;
  photo?: string;
}

interface VendorStock {
  skuId: string;
  quantity: number;
  sku: SKU;
}

interface OrderLine {
  skuId: string;
  qty: number;
  unitPrice: number;
  vatRate: number;
  sku?: SKU;
}

export const CreateOrderPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const outletId = searchParams.get('outletId');
  const visitId = searchParams.get('visitId');

  // Store des commandes
  const { addOrder } = useOrdersStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [availableStock, setAvailableStock] = useState<VendorStock[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);

  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const [paymentMethod, setPaymentMethod] = useState<string>('CASH');
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [transactionRef, setTransactionRef] = useState<string>('');

  // Charger le stock disponible du vendeur
  useEffect(() => {
    loadVendorStock();
  }, []);

  const loadVendorStock = async () => {
    try {
      setLoadingStock(true);
      
      // Utiliser le service api comme dans ProductHierarchy
      const response = await api.get('/vendor-stock/my-stock');
      
      
      // L'API retourne directement le tableau ou dans response.data
      const stockData = Array.isArray(response) ? response : (response.data || response);
      
      setAvailableStock(stockData);
    } catch (error) {
      console.error('Erreur chargement stock:', error);
      setError('Erreur lors du chargement du stock');
    } finally {
      setLoadingStock(false);
    }
  };

  const handleAddLine = () => {
    if (!selectedSKU || quantity <= 0) {
      setError('Veuillez sélectionner un produit et une quantité valide');
      return;
    }

    const stock = availableStock.find((s) => s.skuId === selectedSKU);
    if (!stock) {
      setError('Produit introuvable dans votre stock');
      return;
    }

    // Vérifier le stock disponible
    const alreadyInCart = orderLines.find((line) => line.skuId === selectedSKU);
    const totalQtyInCart = alreadyInCart ? alreadyInCart.qty + quantity : quantity;

    if (totalQtyInCart > stock.quantity) {
      setError(
        `Stock insuffisant. Disponible: ${stock.quantity}, déjà dans le panier: ${alreadyInCart?.qty || 0}`
      );
      return;
    }

    // Ajouter ou mettre à jour la ligne
    if (alreadyInCart) {
      setOrderLines(
        orderLines.map((line) =>
          line.skuId === selectedSKU ? { ...line, qty: line.qty + quantity } : line
        )
      );
    } else {
      const newLine: OrderLine = {
        skuId: selectedSKU,
        qty: quantity,
        unitPrice: Number(stock.sku.priceHt),
        vatRate: Number(stock.sku.vatRate),
        sku: stock.sku,
      };
      setOrderLines([...orderLines, newLine]);
    }

    // Réinitialiser la sélection
    setSelectedSKU('');
    setQuantity(1);
    setError(null);
  };

  const handleRemoveLine = (skuId: string) => {
    setOrderLines(orderLines.filter((line) => line.skuId !== skuId));
  };

  const calculateTotals = () => {
    let totalHt = 0;
    let totalTtc = 0;

    orderLines.forEach((line) => {
      const lineHt = Number(line.unitPrice || 0) * line.qty;
      const lineTtc = lineHt * (1 + Number(line.vatRate || 0) / 100);
      totalHt += lineHt;
      totalTtc += lineTtc;
    });

    return { totalHt, totalTtc, taxTotal: totalTtc - totalHt };
  };

  const handleSubmit = async () => {
    if (!outletId) {
      setError('Point de vente non spécifié');
      return;
    }

    if (orderLines.length === 0) {
      setError('Veuillez ajouter au moins un produit');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const orderData = {
        outletId,
        visitId: visitId || undefined,
        orderLines: orderLines.map((line) => ({
          skuId: line.skuId,
          qty: line.qty,
          unitPrice: line.unitPrice,
          vatRate: line.vatRate,
        })),
        payments: paymentAmount > 0 ? [{
          method: paymentMethod,
          amount: paymentAmount,
          transactionRef: transactionRef || undefined,
        }] : undefined,
      };

      
      // Utiliser le service api comme dans ProductHierarchy
      const response = await api.post('/orders', orderData);
      
      // ✅ SAUVEGARDER DANS LE STORE (automatique)
      const newOrder = response.data?.data || response.data;
      if (newOrder) {
        addOrder(newOrder);
        console.log('[CreateOrderPage] Vente créée et ajoutée au store:', newOrder.id);
      }
      
      // Sauvegarder l'ID de la commande dans localStorage pour la visite
      if (newOrder?.id && visitId) {
        localStorage.setItem(`visit_${visitId}_venteId`, newOrder.id);
        console.log('[CreateOrderPage] ID commande sauvegardé pour la visite:', newOrder.id);
      }
      
      setSuccess(true);
      
      // Logs de débogage pour la redirection
      const fromVisit = searchParams.get('fromVisit');
      console.log('🔍 Paramètres de redirection:', {
        visitId,
        fromVisit,
        fromVisitCheck: fromVisit === 'true',
        shouldReturnToVisit: visitId && fromVisit === 'true'
      });
      
      setTimeout(() => {
        // Si on a un visitId, on vient forcément d'une visite
        // Donc on retourne à la page précédente (détail de visite)
        if (visitId) {
          console.log('🔄 Redirection vers la page de visite précédente (visitId présent)');
          navigate(-1); // Retour à la page précédente (détail de la visite)
        } else {
          console.log('🔄 Redirection vers la liste des commandes (pas de visitId)');
          navigate('/dashboard/orders');
        }
      }, 2000);
    } catch (err: unknown) {
      console.error('❌ Erreur création vente:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string } } }).response;
        setError(response?.data?.message || 'Erreur lors de la création de la vente');
      } else if (err && typeof err === 'object' && 'message' in err) {
        setError((err as { message: string }).message);
      } else {
        setError('Erreur lors de la création de la vente');
      }
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <PageLayout>
      <div className="min-h-screen bg-gray-50 pb-20">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10 p-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                // Si on vient d'une visite, retourner à la page précédente (détail de visite)
                // Sinon retourner à la liste des commandes
                if (visitId && searchParams.get('fromVisit') === 'true') {
                  navigate(-1); // Retour à la page précédente (détail de visite)
                } else {
                  navigate('/dashboard/orders'); // Retour à la liste des commandes
                }
              }}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <span className="text-xl">←</span>
              <span>Retour {visitId ? 'à la visite' : 'aux commandes'}</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900">🛒 Nouvelle Vente</h1>
              <p className="text-sm text-gray-500">Enregistrer une vente sur le terrain</p>
            </div>
          </div>
        </div>

        <div className="p-4 space-y-4">
          {/* Messages */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">⚠️ {error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">✅ Vente enregistrée avec succès ! Redirection...</p>
            </div>
          )}

          {/* Info PDV et Visite */}
          {outletId && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900">📍 PDV sélectionné</p>
              <p className="text-xs text-blue-700 mt-1">ID: {outletId}</p>
              {visitId && (
                <div className="mt-2 pt-2 border-t border-blue-200">
                  <p className="text-xs text-blue-700">
                    🎯 Vente liée à la visite #{visitId}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Sélection de produit */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">📦 Ajouter des produits</h2>
            </div>

            <div className="p-4 space-y-4">
              {loadingStock ? (
                <div className="text-center py-8 text-gray-500">
                  Chargement de votre stock...
                </div>
              ) : availableStock.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-sm text-amber-800">
                    ⚠️ Votre stock est vide. Veuillez contacter votre administrateur.
                  </p>
                </div>
              ) : (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Produit
                      </label>
                      <select
                        value={selectedSKU}
                        onChange={(e) => setSelectedSKU(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      >
                        <option value="">Sélectionner un produit</option>
                        {availableStock.map((stock) => (
                          <option key={stock.skuId} value={stock.skuId}>
                            {stock.sku.shortDescription} - Stock: {stock.quantity} - Prix: {Number(stock.sku.priceTtc || stock.sku.priceHt || 0).toFixed(0)} XOF
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddLine} variant="primary" size="md" fullWidth>
                    ➕ Ajouter au panier
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Panier */}
          {orderLines.length > 0 && (
            <Card>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                  🛒 Panier ({orderLines.length} produit{orderLines.length > 1 ? 's' : ''})
                </h2>
              </div>

              <div className="divide-y divide-gray-200">
                {orderLines.map((line) => (
                  <div key={line.skuId} className="p-4 flex items-center gap-4">
                    {line.sku?.photo && (
                      <img
                        src={line.sku.photo}
                        alt={line.sku.shortDescription}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}

                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">
                        {line.sku?.shortDescription}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {line.qty} x {Number(line.unitPrice || 0).toFixed(0)} XOF = {(Number(line.unitPrice || 0) * line.qty).toFixed(0)} XOF HT
                      </p>
                    </div>

                    <button
                      onClick={() => handleRemoveLine(line.skuId)}
                      className="text-red-600 hover:text-red-700 p-2"
                    >
                      🗑️
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Total HT</span>
                  <span className="font-medium">{totals.totalHt.toFixed(0)} XOF</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">TVA</span>
                  <span className="font-medium">{totals.taxTotal.toFixed(0)} XOF</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>Total TTC</span>
                  <span className="text-sky-600">{totals.totalTtc.toFixed(0)} XOF</span>
                </div>
              </div>
            </Card>
          )}

          {/* Paiement */}
          {orderLines.length > 0 && (
            <Card>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">💳 Paiement (optionnel)</h2>
              </div>

              <div className="p-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Méthode de paiement
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  >
                    <option value="CASH">Espèces</option>
                    <option value="MOBILE_MONEY">Mobile Money</option>
                    <option value="BANK_TRANSFER">Virement bancaire</option>
                    <option value="CREDIT">Crédit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Montant payé (XOF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                  />
                </div>

                {(paymentMethod === 'MOBILE_MONEY' || paymentMethod === 'BANK_TRANSFER') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Référence de transaction
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Ex: TRX123456789"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Actions */}
          {orderLines.length > 0 && (
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => navigate('/dashboard/visits')}
                disabled={loading}
                fullWidth
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                variant="primary"
                fullWidth
              >
                {loading ? 'Enregistrement...' : '💾 Enregistrer la vente'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
