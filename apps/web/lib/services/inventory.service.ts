import { api } from '../api-client';

export interface InventoryItem {
  productId: string;
  name: string;
  unit: string;
  quantity: number;
}

export interface OpnameInput {
  productId: string;
  unit: string;
  countedQuantity: number;
  reason: string;
}

export interface WasteInput {
  productId: string;
  unit: string;
  quantity: number;
  reason: string;
}

function idempotencyHeaders() {
  return { headers: { 'Idempotency-Key': crypto.randomUUID() } };
}

export const inventoryService = {
  current(): Promise<InventoryItem[]> {
    return api.get('/inventory/current');
  },

  opname(input: OpnameInput) {
    return api.post('/inventory/opname', input, idempotencyHeaders());
  },

  waste(input: WasteInput) {
    return api.post('/inventory/waste', input, idempotencyHeaders());
  },
};
