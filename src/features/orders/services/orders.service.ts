import api from '../../../core/api/api';
import {
  Order,
  CreateOrderRequest,
  OrderStats,
  OrderStatus,
} from '../types/order.types';

class OrdersService {
  /**
   * Crée une nouvelle vente
   */
  async createOrder(orderData: CreateOrderRequest): Promise<{
    success: boolean;
    message: string;
    order: Order;
  }> {
    const response = await api.post('/orders', orderData);
    return response.data;
  }

  /**
   * Récupère les ventes du vendeur connecté
   */
  async getMyOrders(filters?: {
    outletId?: string;
    status?: OrderStatus;
    startDate?: string;
    endDate?: string;
  }): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.outletId) params.append('outletId', filters.outletId);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const response = await api.get(`/orders/my-orders?${params.toString()}`);
    return Array.isArray(response) ? response : [];
  }

  /**
   * Récupère les statistiques de ventes du vendeur
   */
  async getMyStats(period?: 'day' | 'week' | 'month'): Promise<OrderStats> {
    const params = period ? `?period=${period}` : '';
    const response = await api.get(`/orders/my-stats${params}`);
    return response.data;
  }

  /**
   * Récupère une vente par ID
   */
  async getOrderById(orderId: string): Promise<Order> {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  }

  /**
   * Récupère les ventes d'un vendeur spécifique (ADMIN/SUP)
   */
  async getVendorOrders(
    vendorId: string,
    filters?: { status?: OrderStatus },
  ): Promise<Order[]> {
    const params = filters?.status ? `?status=${filters.status}` : '';
    const response = await api.get(`/orders/vendor/${vendorId}${params}`);
    return response.data;
  }

  /**
   * Récupère les statistiques d'un vendeur spécifique (ADMIN/SUP)
   */
  async getVendorStats(
    vendorId: string,
    period?: 'day' | 'week' | 'month',
  ): Promise<OrderStats> {
    const params = period ? `?period=${period}` : '';
    const response = await api.get(`/orders/vendor/${vendorId}/stats${params}`);
    return response.data;
  }
}

export const ordersService = new OrdersService();
