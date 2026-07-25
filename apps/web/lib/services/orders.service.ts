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

  async detail(id: string): Promise<OrderDetail> {
    // Backend returns top-level fields camelCased but items/history raw
    // snake_case with numeric columns as strings — normalize here.
    const raw = await api.get<any>(`/orders/${id}`);
    return {
      id: raw.id,
      poNumber: raw.poNumber,
      supplierId: raw.supplierId,
      vendorId: raw.vendorId,
      status: raw.status,
      requestedDeliveryDate: raw.requestedDeliveryDate,
      totalAmount: Number(raw.totalAmount),
      rejectionReason: raw.rejectionReason,
      invoiceNumber: raw.invoiceNumber,
      items: (raw.items ?? []).map((i: any) => ({
        productId: i.productId ?? i.product_id,
        productName: i.productName ?? i.product_name,
        unit: i.unit,
        qty: Number(i.qty),
        unitPrice: Number(i.unitPrice ?? i.unit_price),
        lineTotal: Number(i.lineTotal ?? i.line_total),
      })),
      history: (raw.history ?? []).map((h: any) => ({
        fromStatus: h.fromStatus ?? h.from_status,
        toStatus: h.toStatus ?? h.to_status,
        notes: h.notes,
        createdAt: h.createdAt ?? h.created_at,
      })),
    };
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
