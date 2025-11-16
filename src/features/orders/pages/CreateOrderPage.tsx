import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../core/ui/Button';
import Card from '../../../core/ui/Card';
import { ordersService } from '../services/orders.service';
import { CreateOrderRequest, OrderLine, PaymentMethod } from '../types/order.types';
import { PageHeader } from '@/core/ui';
import { Alert } from '@/core/ui';
import { Package, ShoppingCart, Plus, Trash2, Save, CreditCard } from 'lucide-react';

interface SKU {
  id: string;
  code: string;
  shortDescription: string;
  priceHt: number;
  vatRate: number;
  priceTtc: number;
  photo?: string;
  packSize?: {
    name: string;
    packFormat?: {
      name: string;
      brand?: {
        name: string;
      };
    };
  };
}

interface VendorStock {
  skuId: string;
  quantity: number;
  sku: SKU;
}

export const CreateOrderPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const outletId = searchParams.get('outletId');
  const visitId = searchParams.get('visitId');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [availableStock, setAvailableStock] = useState<VendorStock[]>([]);
  const [loadingStock, setLoadingStock] = useState(true);

  const [orderLines, setOrderLines] = useState<OrderLine[]>([]);
  const [selectedSKU, setSelectedSKU] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.CASH);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [transactionRef, setTransactionRef] = useState<string>('');

  // Charger le stock disponible du vendeur
  useEffect(() => {
    loadVendorStock();
  }, []);

  const loadVendorStock = async () => {
    try {
      setLoadingStock(true);
      // Appeler l'API pour récupérer le stock du vendeur
      const response = await fetch('/api/vendor-stock/my-stock', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setAvailableStock(data);
    } catch (err) {
      console.error('Erreur chargement stock:', err);
      setError('Impossible de charger votre stock');
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
        `Stock insuffisant. Disponible: ${stock.quantity}, déjà dans le panier: ${alreadyInCart?.qty || 0}`,
      );
      return;
    }

    // Ajouter ou mettre à jour la ligne
    if (alreadyInCart) {
      setOrderLines(
        orderLines.map((line) =>
          line.skuId === selectedSKU ? { ...line, qty: line.qty + quantity } : line,
        ),
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

      const orderData: CreateOrderRequest = {
        outletId,
        visitId: visitId || undefined,
        orderLines: orderLines.map((line) => ({
          skuId: line.skuId,
          qty: line.qty,
          unitPrice: line.unitPrice,
          vatRate: line.vatRate,
        })),
      };

      // Ajouter le paiement si montant > 0
      if (paymentAmount > 0) {
        orderData.payments = [
          {
            method: paymentMethod,
            amount: paymentAmount,
            transactionRef: transactionRef || undefined,
          },
        ];
      }

      await ordersService.createOrder(orderData);

      setSuccess(true);
      setTimeout(() => {
        navigate('/dashboard/orders');
      }, 2000);
    } catch (err: unknown) {
      console.error('Erreur création vente:', err);
      if (err && typeof err === 'object' && 'response' in err) {
        const response = (err as { response?: { data?: { message?: string; errors?: string[] } } }).response;
        if (response?.data?.errors) {
          setError(response.data.errors.join(', '));
        } else {
          setError(response?.data?.message || 'Erreur lors de la création de la vente');
        }
      } else {
        setError('Erreur lors de la création de la vente');
      }
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <PageHeader
        title="Nouvelle Vente"
        subtitle="Enregistrer une vente sur le terrain"
      />

      <div className="max-w-4xl mx-auto p-4 space-y-4">
        {error && (
          <Alert variant="error">
            {error}
          </Alert>
        )}

        {success && (
          <Alert variant="success">
            Vente enregistrée avec succès ! Redirection...
          </Alert>
        )}

        {/* Sélection de produit */}
        <Card className="shadow-sm border border-gray-200">
          <div className="bg-gradient-to-r from-sky-50 to-blue-50 p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-sky-100 rounded-lg">
                <Package className="w-6 h-6 text-sky-600" />
              </div>
              Ajouter des produits
            </h2>
            <p className="text-sm text-gray-600 mt-1">Sélectionnez les produits depuis votre stock disponible</p>
          </div>

          <div className="p-6 space-y-6">
            {loadingStock ? (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-sky-100 rounded-full mb-4">
                  <Package className="w-8 h-8 text-sky-600 animate-pulse" />
                </div>
                <p className="text-gray-500 font-medium">Chargement de votre stock...</p>
              </div>
            ) : availableStock.length === 0 ? (
              <Alert variant="warning">
                Votre stock est vide. Veuillez contacter votre administrateur.
              </Alert>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Produit *
                    </label>
                    <div className="relative">
                      <select
                        value={selectedSKU}
                        onChange={(e) => setSelectedSKU(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm font-medium"
                      >
                        <option value="" className="text-gray-400">Sélectionner un produit...</option>
                        {availableStock.map((stock) => (
                          <option key={stock.skuId} value={stock.skuId} className="py-2">
                            {stock.sku.shortDescription} • Stock: {stock.quantity} • {stock.sku.priceTtc.toFixed(0)} XOF
                          </option>
                        ))}
                      </select>
                      <Package className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-gray-700">
                      Quantité *
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 text-sm font-medium"
                        placeholder="1"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button 
                    onClick={handleAddLine} 
                    className="px-6 py-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Ajouter au panier
                  </Button>
                </div>
              </>
            )}
          </div>
        </Card>

        {/* Panier */}
        {orderLines.length > 0 && (
          <Card className="shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-100 rounded-lg">
                    <ShoppingCart className="w-6 h-6 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      Panier ({orderLines.length} produit{orderLines.length > 1 ? 's' : ''})
                    </h2>
                    <p className="text-sm text-gray-600">Vérifiez vos articles avant validation</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="divide-y divide-gray-100">
              {orderLines.map((line) => (
                <div key={line.skuId} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {line.sku?.photo ? (
                        <img
                          src={line.sku.photo}
                          alt={line.sku.shortDescription}
                          className="w-20 h-20 object-cover rounded-xl border-2 border-gray-200 shadow-sm"
                        />
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded-xl border-2 border-gray-200 flex items-center justify-center">
                          <Package className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1">
                        {line.sku?.shortDescription}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <span className="bg-gray-100 px-3 py-1 rounded-full font-medium">
                          Qté: {line.qty}
                        </span>
                        <span className="bg-blue-100 px-3 py-1 rounded-full font-medium text-blue-700">
                          {Number(line.unitPrice || 0).toFixed(0)} XOF/unité
                        </span>
                        <span className="bg-emerald-100 px-3 py-1 rounded-full font-medium text-emerald-700">
                          Total: {(Number(line.unitPrice || 0) * line.qty).toFixed(0)} XOF HT
                        </span>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveLine(line.skuId)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-3 rounded-xl transition-all duration-200 border-red-200 hover:border-red-300"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 border-t border-gray-200">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">Sous-total HT</span>
                  <span className="font-semibold text-gray-900">{totals.totalHt.toFixed(0)} XOF</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-600 font-medium">TVA</span>
                  <span className="font-semibold text-gray-900">{totals.taxTotal.toFixed(0)} XOF</span>
                </div>
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-gray-900">Total TTC</span>
                    <span className="text-2xl font-bold text-sky-600">{totals.totalTtc.toFixed(0)} XOF</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Paiement */}
        {orderLines.length > 0 && (
          <Card className="shadow-sm border border-gray-200">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <CreditCard className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Paiement
                  </h2>
                  <p className="text-sm text-gray-600">Optionnel - Vous pouvez enregistrer un paiement partiel ou total</p>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Méthode de paiement
                  </label>
                  <div className="relative">
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full pl-4 pr-10 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm font-medium appearance-none"
                    >
                      <option value={PaymentMethod.CASH}>💵 Espèces</option>
                      <option value={PaymentMethod.MOBILE_MONEY}>📱 Mobile Money</option>
                      <option value={PaymentMethod.BANK_TRANSFER}>🏦 Virement bancaire</option>
                      <option value={PaymentMethod.CREDIT}>📋 Crédit</option>
                    </select>
                    <CreditCard className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Montant payé (XOF)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max={totals.totalTtc}
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm font-medium"
                      placeholder={`Max: ${totals.totalTtc.toFixed(0)} XOF`}
                    />
                  </div>
                  {paymentAmount > 0 && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex justify-between text-sm">
                        <span className="text-blue-700 font-medium">Montant payé:</span>
                        <span className="text-blue-900 font-bold">{paymentAmount.toFixed(0)} XOF</span>
                      </div>
                      <div className="flex justify-between text-sm mt-1">
                        <span className="text-blue-700 font-medium">Reste à payer:</span>
                        <span className="text-red-600 font-bold">{Math.max(0, totals.totalTtc - paymentAmount).toFixed(0)} XOF</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(paymentMethod === PaymentMethod.MOBILE_MONEY ||
                paymentMethod === PaymentMethod.BANK_TRANSFER) && (
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Référence de transaction
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Ex: TRX123456789, REF-MOMO-001"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-white shadow-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 text-sm font-medium"
                    />
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Actions */}
        {orderLines.length > 0 && (
          <div className="bg-white border-t border-gray-200 p-6 -mx-4 -mb-4 rounded-b-lg">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                disabled={loading}
                className="flex-1 py-3 px-6 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl transition-all duration-200"
              >
                Annuler
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {!loading && <Save className="w-4 h-4" />}
                {loading ? 'Enregistrement...' : 'Enregistrer la vente'}
              </Button>
            </div>
            
            {/* Résumé rapide */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-600 font-medium">
                  {orderLines.length} produit{orderLines.length > 1 ? 's' : ''} • Total: {totals.totalTtc.toFixed(0)} XOF
                </span>
                {paymentAmount > 0 && (
                  <span className="text-emerald-600 font-semibold">
                    Paiement: {paymentAmount.toFixed(0)} XOF
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
