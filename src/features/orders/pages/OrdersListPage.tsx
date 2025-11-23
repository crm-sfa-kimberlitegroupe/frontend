import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, Plus, Eye, Calendar, TrendingUp } from 'lucide-react';
import { ordersService } from '../services/orders.service';
import { Order, OrderStats } from '../types/order.types';

export const OrdersListPage: React.FC = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<'day' | 'week' | 'month'>('week');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ordersData, statsData] = await Promise.all([
        ordersService.getMyOrders(),
        ordersService.getMyStats(period),
      ]);
      setOrders(ordersData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Erreur chargement données:', error);
      setOrders([]); // S'assurer que orders est toujours un tableau
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    loadData();
  }, [period, loadData]);

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

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-100 rounded-lg flex items-center justify-center">
                <ShoppingCart className="w-6 h-6 text-sky-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Mes Ventes</h1>
                <p className="text-sm text-gray-500">Historique et statistiques</p>
              </div>
            </div>
            <button
              onClick={() => navigate('/dashboard/orders/create')}
              className="w-10 h-10 bg-sky-600 text-white rounded-lg flex items-center justify-center hover:bg-sky-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          {/* Période */}
          <div className="flex gap-2">
            {(['day', 'week', 'month'] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  period === p
                    ? 'bg-sky-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p === 'day' ? 'Aujourd\'hui' : p === 'week' ? 'Semaine' : 'Mois'}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Statistiques */}
        {stats && (
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <ShoppingCart className="w-4 h-4" />
                <span>Ventes</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Chiffre d'affaires</span>
              </div>
              <div className="text-2xl font-bold text-sky-600">
                {stats.totalRevenue.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">XOF</div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <Calendar className="w-4 h-4" />
                <span>Articles vendus</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{stats.totalItems}</div>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
                <TrendingUp className="w-4 h-4" />
                <span>Panier moyen</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">
                {stats.averageOrderValue.toFixed(0)}
              </div>
              <div className="text-xs text-gray-500">XOF</div>
            </div>
          </div>
        )}

        {/* Liste des ventes */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Historique</h2>

          {loading ? (
            <div className="text-center py-12 text-gray-500">Chargement...</div>
          ) : (!orders || orders.length === 0) ? (
            <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500 mb-4">Aucune vente enregistrée</p>
              <button
                onClick={() => navigate('/dashboard/orders/create')}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
              >
                Créer ma première vente
              </button>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                onClick={() => navigate(`/dashboard/orders/${order.id}`)}
                className="bg-white rounded-lg p-4 border border-gray-200 hover:border-sky-300 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-medium text-gray-900">{order.outlet?.name}</h3>
                    <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusBadge(order.status)}`}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {order.orderLines.length} produit{order.orderLines.length > 1 ? 's' : ''}
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-sky-600">
                      {order.totalTtc.toFixed(0)} XOF
                    </div>
                    {order.payments.length > 0 && (
                      <div className="text-xs text-green-600">
                        Payé: {order.payments.reduce((sum, p) => sum + p.amount, 0).toFixed(0)} XOF
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-end">
                  <button className="text-sm text-sky-600 hover:text-sky-700 flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    Voir détails
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
