import { api } from '../api-client';

export type OrderStatus =
  | 'draft'
  | 'submitted'
  | 'accepted'
  | 'rejected'
  | 'cancelled'
  | 'dispatched'
  | 'received';

export interface OrderSummary {
  id: string;
  poNumber: string;
  supplierId: string;
  vendorId: string;
  status: OrderStatus;
  requestedDeliveryDate: string | null;
  totalAmount: number;
  rejectionReason: string | null;
  invoiceNumber: string | null;
}

export interface OrderItem {
  productId: string;
  productName: string;
  unit: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface OrderStatusLogEntry {
  fromStatus: string | null;
  toStatus: string;
  notes: string | null;
  createdAt: string;
}

export interface OrderDetail extends OrderSummary {
  items: OrderItem[];
  history: OrderStatusLogEntry[];
}

export interface CreateOrderInput {
  supplierId: string;
  requestedDeliveryDate?: string;
  vendorNotes?: string;
  items: { productId: string; quantity: number }[];
}

function idempotencyHeaders() {
  return { headers: { 'Idempotency-Key': crypto.randomUUID() } };
}

export const ordersService = {
  create(input: CreateOrderInput): Promise<{ body: OrderSummary; eventId: string; replayed: boolean }> {
    return api.post('/orders', input, idempotencyHeaders());
  },

  listVendor(): Promise<OrderSummary[]> {
    return api.get('/orders/my');
  },

  listSupplier(): Promise<OrderSummary[]> {
    return api.get('/orders/supplier');
  },

  detail(id: string): Promise<OrderDetail> {
    return api.get(`/orders/${id}`);
  },

  cancel(id: string, reason: string) {
    return api.post(`/orders/${id}/cancel`, { reason }, idempotencyHeaders());
  },

  accept(id: string) {
    return api.post(`/orders/${id}/accept`, undefined, idempotencyHeaders());
  },

  reject(id: string, reason: string) {
    return api.post(`/orders/${id}/reject`, { reason }, idempotencyHeaders());
  },

  dispatch(id: string) {
    return api.post(`/orders/${id}/dispatch`, undefined, idempotencyHeaders());
  },

  receive(id: string) {
    return api.post(`/orders/${id}/receive`, undefined, idempotencyHeaders());
  },
};
