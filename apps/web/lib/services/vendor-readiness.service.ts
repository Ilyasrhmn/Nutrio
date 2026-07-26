import { api } from "../api-client";

export type ReadinessSnapshot = {
  ready: boolean;
  missingRequirements: Array<{ code: string; message: string }>;
  nextAction: string | null;
  lifecycleStatus: string;
};

export const vendorReadinessService = {
  get: () => api.get<ReadinessSnapshot>("/onboarding/readiness"),
  complete: () => api.post<ReadinessSnapshot>("/onboarding/complete", {}),
};
