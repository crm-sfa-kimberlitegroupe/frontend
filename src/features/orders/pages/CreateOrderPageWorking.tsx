import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PageLayout, Button, Card } from '@/core/ui';
import api from '@/core/api/api';
import { useOrdersStore } from '../stores/ordersStore';
import { useVisitsStore } from '@/features/visits/stores/visitsStore';
import { ArrowLeft, ShoppingCart, Package, Trash2, CreditCard, Save, AlertTriangle, CheckCircle, Plus } from 'lucide-react';

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
  
  // Store des visites - update visite existante avec l'ID de la vente
  const { updateVisitAddVenteId } = useVisitsStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [availableStock, setAvailableStock] = useState<VendorStock[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);

  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [paymentError, setPaymentError] = useState<string | null>(null);

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
    } catch {
      setError('Erreur lors du chargement du stock');
    } finally {
      setLoadingStock(false);
    }
  };

  const handleAddLine = () => {
    const qty = parseInt(quantity) || 0;
    if (!selectedSKU || qty <= 0) {
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
    const totalQtyInCart = alreadyInCart ? alreadyInCart.qty + qty : qty;

    if (totalQtyInCart > stock.quantity) {
      setError(
        `Stock insuffisant. Disponible: ${stock.quantity}, deja dans le panier: ${alreadyInCart?.qty || 0}`
      );
      return;
    }

    // Ajouter ou mettre à jour la ligne
    if (alreadyInCart) {
      setOrderLines(
        orderLines.map((line) =>
          line.skuId === selectedSKU ? { ...line, qty: line.qty + qty } : line
        )
      );
    } else {
      const newLine: OrderLine = {
        skuId: selectedSKU,
        qty: qty,
        unitPrice: Number(stock.sku.priceHt),
        vatRate: Number(stock.sku.vatRate),
        sku: stock.sku,
      };
      setOrderLines([...orderLines, newLine]);
    }

    // Reinitialiser la selection
    setSelectedSKU('');
    setQuantity('1');
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

    // Validation du paiement : le montant doit être >= au total TTC
    const { totalTtc } = calculateTotals();
    if (paymentAmount > 0 && paymentAmount < totalTtc) {
      setPaymentError(`Le montant paye (${paymentAmount.toFixed(0)} XOF) est inferieur au total (${totalTtc.toFixed(0)} XOF). Veuillez payer le montant total ou laisser le champ a 0 pour enregistrer sans paiement.`);
      setError('Montant de paiement insuffisant');
      return;
    }
    setPaymentError(null);

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
      
      // Le backend retourne { success, message, order }
      // Extraire l'order correctement selon la structure de reponse
      const newOrder = response?.order || response?.data?.order || response?.data;





      if (newOrder) {
        addOrder(newOrder);
      }
      
      // Mettre a jour la visite existante avec l'ID de la vente
      if (newOrder?.id && visitId) {
        updateVisitAddVenteId(visitId, newOrder.id);
      }
      
      setSuccess(true);
      
      
      setTimeout(() => {
        if (visitId) {
          navigate(-1);
        } else {
          navigate('/dashboard/orders');
        }
      }, 2000);
    } catch (err: unknown) {
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
                if (visitId && searchParams.get('fromVisit') === 'true') {
                  navigate(-1);
                } else {
                  navigate('/dashboard/orders');
                }
              }}
              className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Retour {visitId ? 'a la visite' : 'aux commandes'}</span>
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <ShoppingCart className="w-5 h-5" />
                Nouvelle Vente
              </h1>
              <p className="text-sm text-gray-500">Enregistrer une vente sur le terrain</p>
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

          {paymentError && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800">{paymentError}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">Vente enregistree avec succes ! Redirection...</p>
            </div>
          )}


          {/* Selection de produit */}
          <Card>
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Package className="w-5 h-5" />
                Ajouter des produits
              </h2>
            </div>

            <div className="p-4 space-y-4">
              {loadingStock ? (
                <div className="text-center py-8 text-gray-500">
                  Chargement de votre stock...
                </div>
              ) : availableStock.length === 0 ? (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-800">
                    Votre stock est vide. Veuillez contacter votre administrateur.
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
                        Quantite
                      </label>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={quantity}
                        onChange={(e) => {
                          const val = e.target.value;
                          // Permettre la saisie libre (vide ou chiffres uniquement)
                          if (val === '' || /^\d+$/.test(val)) {
                            setQuantity(val);
                          }
                        }}
                        onBlur={() => {
                          // Si vide ou 0, remettre 1 au blur
                          if (!quantity || parseInt(quantity) <= 0) {
                            setQuantity('1');
                          }
                        }}
                        placeholder="Entrez la quantite"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <Button onClick={handleAddLine} variant="primary" size="md" fullWidth>
                    <Plus className="w-4 h-4 mr-1" />
                    Ajouter au panier
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Panier */}
          {orderLines.length > 0 && (
            <Card>
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5" />
                  Panier ({orderLines.length} produit{orderLines.length > 1 ? 's' : ''})
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
                      <Trash2 className="w-5 h-5" />
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
                <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Paiement
                </h2>
                <p className="text-xs text-gray-500 mt-1">Le montant doit etre egal ou superieur au total TTC</p>
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
                    Montant paye (XOF)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={paymentAmount}
                    onChange={(e) => {
                      const amount = parseFloat(e.target.value) || 0;
                      setPaymentAmount(amount);
                      // Effacer l'erreur de paiement si le montant est corrige
                      if (amount >= totals.totalTtc || amount === 0) {
                        setPaymentError(null);
                      }
                    }}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent ${
                      paymentError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                  />
                  {paymentAmount > 0 && paymentAmount < totals.totalTtc && (
                    <p className="text-xs text-red-600 mt-1">
                      Montant insuffisant. Minimum requis: {totals.totalTtc.toFixed(0)} XOF
                    </p>
                  )}
                  {paymentAmount > totals.totalTtc && (
                    <p className="text-xs text-green-600 mt-1 font-medium">
                      Monnaie a rendre: {(paymentAmount - totals.totalTtc).toFixed(0)} XOF
                    </p>
                  )}
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
                disabled={loading || (paymentAmount > 0 && paymentAmount < totals.totalTtc)}
                variant="primary"
                fullWidth
              >
                <Save className="w-4 h-4 mr-1" />
                {loading ? 'Enregistrement...' : 'Enregistrer la vente'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};
