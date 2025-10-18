// Types globaux pour l'application SFA CRM

export type UserRole = 'REP' | 'ADMIN' | 'SUP';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  phone?: string;
  photo?: string;
  photoUrl?: string;
  territory?: string;
  territoryName?: string;
  employeeId?: string;
  hireDate?: string;
  manager?: string;
  isActive: boolean;
}

export interface KPI {
  label: string;
  value: number;
  unit: string;
  trend?: number; // Pourcentage de variation
  color: string;
}

export interface Visit {
  id: string;
  pdvId: string;
  pdvName: string;
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED';
  scheduledTime: string;
  checkInTime?: string;
  checkOutTime?: string;
  latitude?: number;
  longitude?: number;
  photos?: string[];
  notes?: string;
}

export interface PDV {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  channel: string;
  segment: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  photo?: string;
  phone?: string;
  owner?: string;
}

export interface Order {
  id: string;
  pdvId: string;
  pdvName: string;
  status: 'DRAFT' | 'CONFIRMED' | 'DELIVERED';
  totalAmount: number;
  items: OrderItem[];
  createdAt: string;
  paymentMethod?: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  category: string;
  photo?: string;
  isActive: boolean;
}

export interface SyncStatus {
  isOnline: boolean;
  lastSync?: Date;
  pendingItems: number;
  storageUsed: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: Date;
  read: boolean;
}
