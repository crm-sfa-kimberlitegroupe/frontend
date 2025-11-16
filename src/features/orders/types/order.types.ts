export enum OrderStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  MOBILE_MONEY = 'MOBILE_MONEY',
  BANK_TRANSFER = 'BANK_TRANSFER',
  CREDIT = 'CREDIT',
}

export interface OrderLine {
  id?: string;
  skuId: string;
  qty: number;
  unitPrice?: number;
  vatRate?: number;
  lineTotalHt?: number;
  lineTotalTtc?: number;
  promotionId?: string;
  originalUnitPrice?: number;
  discountAmount?: number;
  sku?: {
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
  };
}

export interface Payment {
  id?: string;
  method: PaymentMethod;
  amount: number;
  paidAt?: string;
  transactionRef?: string;
  meta?: any;
}

export interface Order {
  id: string;
  outletId: string;
  userId: string;
  visitId?: string;
  status: OrderStatus;
  discountTotal: number;
  taxTotal: number;
  totalHt: number;
  totalTtc: number;
  currency: string;
  createdAt: string;
  updatedAt: string;
  orderLines: OrderLine[];
  payments: Payment[];
  outlet?: {
    id: string;
    name: string;
    address?: string;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateOrderRequest {
  outletId: string;
  visitId?: string;
  status?: OrderStatus;
  orderLines: {
    skuId: string;
    qty: number;
    unitPrice?: number;
    vatRate?: number;
    promotionId?: string;
    originalUnitPrice?: number;
    discountAmount?: number;
  }[];
  payments?: {
    method: PaymentMethod;
    amount: number;
    paidAt?: string;
    transactionRef?: string;
    meta?: any;
  }[];
}

export interface OrderStats {
  period?: 'day' | 'week' | 'month';
  totalOrders: number;
  totalRevenue: number;
  totalItems: number;
  totalPaid: number;
  averageOrderValue: number;
}
