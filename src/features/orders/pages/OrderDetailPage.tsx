import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  ShoppingCart,
  MapPin,
  Calendar,
  CreditCard,
  Package,
  DollarSign,
} from 'lucide-react';
import { ordersService } from '../services/orders.service';
import { Order } from '../types/order.types';

export const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderId) {
      loadOrder();
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      const data = await ordersService.getOrderById(orderId!);
      setOrder(data);
    } catch (error) {
      console.error('Erreur chargement vente:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      DRAFT: 'bg-gray-100 text-gray-800',
      CONFIRMED: 'bg-blue-100 text-blue-800',
      DELIVERED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };
    return badges[status as keyof typeof badges] || badges.DRAFT;
  };

  const getStatusLabel = (status: string) => {
    const labels = {
      DRAFT: 'Brouillon',
      CONFIRMED: 'Confirmée',
      DELIVERED: 'Livrée',
      CANCELLED: 'Annulée',
    };
    return labels[status as keyof typeof labels] || status;
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels = {
      CASH: 'Espèces',
      MOBILE_MONEY: 'Mobile Money',
      BANK_TRANSFER: 'Virement bancaire',
      CREDIT: 'Crédit',
    };
    return labels[method as keyof typeof labels] || method;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-500">Chargement...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">Vente introuvable</p>
          <button
            onClick={() => navigate('/dashboard/orders')}
            className="mt-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
          >
            Retour aux ventes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate('/dashboard/orders')}
              className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900">Détails de la vente</h1>
              <p className="text-sm text-gray-500">Vente #{order.id.slice(0, 8)}</p>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadge(order.status)}`}
            >
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Informations générales */}
        <div className="bg-white rounded-lg p-4 border border-gray-200 space-y-3">
          <div className="flex items-start gap-3">
            <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-gray-500">Point de vente</div>
              <div className="font-medium text-gray-900">{order.outlet?.name}</div>
              {order.outlet?.address && (
                <div className="text-sm text-gray-500">{order.outlet.address}</div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm text-gray-500">Date de vente</div>
              <div className="font-medium text-gray-900">{formatDate(order.createdAt)}</div>
            </div>
          </div>

          {order.user && (
            <div className="flex items-start gap-3">
              <Package className="w-5 h-5 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <div className="text-sm text-gray-500">Vendeur</div>
                <div className="font-medium text-gray-900">
                  {order.user.firstName} {order.user.lastName}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Produits */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Produits ({order.orderLines.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {order.orderLines.map((line) => (
              <div key={line.id} className="p-4 flex items-start gap-4">
                {line.sku?.photo && (
                  <img
                    src={line.sku.photo}
                    alt={line.sku.shortDescription}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">
                    {line.sku?.shortDescription}
                  </h3>
                  {line.sku?.packSize && (
                    <p className="text-sm text-gray-500">
                      {line.sku.packSize.packFormat?.brand?.name} -{' '}
                      {line.sku.packSize.packFormat?.name} - {line.sku.packSize.name}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Qté:</span>{' '}
                      <span className="font-medium">{line.qty}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Prix unitaire:</span>{' '}
                      <span className="font-medium">{Number(line.unitPrice || 0).toFixed(0)} XOF</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-medium text-gray-900">
                    {line.lineTotalTtc?.toFixed(0)} XOF
                  </div>
                  <div className="text-xs text-gray-500">TTC</div>
                </div>
              </div>
            ))}
          </div>

          {/* Totaux */}
          <div className="p-4 bg-gray-50 border-t border-gray-200 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total HT</span>
              <span className="font-medium">{order.totalHt.toFixed(0)} XOF</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">TVA</span>
              <span className="font-medium">{order.taxTotal.toFixed(0)} XOF</span>
            </div>
            {order.discountTotal > 0 && (
              <div className="flex justify-between text-sm text-red-600">
                <span>Remise</span>
                <span className="font-medium">-{order.discountTotal.toFixed(0)} XOF</span>
              </div>
            )}
            <div className="flex justify-between text-lg font-bold border-t pt-2">
              <span>Total TTC</span>
              <span className="text-sky-600">{order.totalTtc.toFixed(0)} XOF</span>
            </div>
          </div>
        </div>

        {/* Paiements */}
        {order.payments.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                Paiements ({order.payments.length})
              </h2>
            </div>

            <div className="divide-y divide-gray-200">
              {order.payments.map((payment) => (
                <div key={payment.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900">
                      {getPaymentMethodLabel(payment.method)}
                    </div>
                    {payment.transactionRef && (
                      <div className="text-sm text-gray-500">Réf: {payment.transactionRef}</div>
                    )}
                    <div className="text-sm text-gray-500">{formatDate(payment.paidAt!)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {payment.amount.toFixed(0)} XOF
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-green-50 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Total payé</span>
                <span className="text-lg font-bold text-green-600">
                  {order.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(0)} XOF
                </span>
              </div>
              {order.payments.reduce((sum, p) => sum + p.amount, 0) < order.totalTtc && (
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-gray-600">Reste à payer</span>
                  <span className="font-medium text-red-600">
                    {(order.totalTtc - order.payments.reduce((sum, p) => sum + p.amount, 0)).toFixed(0)} XOF
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Pas de paiement */}
        {order.payments.length === 0 && (
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center gap-3">
              <DollarSign className="w-5 h-5 text-amber-600" />
              <div>
                <div className="font-medium text-amber-900">Aucun paiement enregistré</div>
                <div className="text-sm text-amber-700">
                  Montant dû: {order.totalTtc.toFixed(0)} XOF
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
