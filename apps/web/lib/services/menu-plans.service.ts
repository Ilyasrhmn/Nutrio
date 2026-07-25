import { api } from '../api-client';

export interface MenuPlanItemInput {
  productId: string;
  unit: string;
  quantityPerPax: number;
}

export interface UpsertMenuPlanInput {
  operationDate: string;
  targetPax: number;
  items: MenuPlanItemInput[];
}

export interface MenuPlanItemResult {
  productId: string;
  name: string;
  unit: string;
  requiredQuantity: number;
  availableQuantity: number;
  shortageQuantity: number;
}

export interface MenuPlan {
  id: string;
  operationDate: string;
  targetPax: number;
  items: MenuPlanItemResult[];
}

function idempotencyHeaders() {
  return { headers: { 'Idempotency-Key': crypto.randomUUID() } };
}

export const menuPlansService = {
  get(date: string): Promise<MenuPlan> {
    return api.get(`/menu-plans/${date}`);
  },

  upsert(input: UpsertMenuPlanInput) {
    return api.post('/menu-plans', input, idempotencyHeaders());
  },
};
