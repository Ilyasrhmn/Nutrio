import { api } from "../api-client";
import type { ReadinessSnapshot } from "./vendor-readiness.service";

export type AdminVendor = {
  id: string;
  businessName: string;
  ownerName: string;
  province: string;
  lifecycleStatus: string;
  ready: boolean;
};

export type AdminVendorDetail = AdminVendor & {
  status: string;
  statusReason: string | null;
  readiness: ReadinessSnapshot;
  timeline: Array<{
    from: string;
    to: string;
    reason: string | null;
    createdAt: string;
  }>;
  team: Array<{
    id: string;
    role: string;
    inviteEmail: string | null;
    status: string;
  }>;
  documents: Array<{
    id: string;
    docType: string;
    status: string;
    uploadedAt: string;
  }>;
};

type Action = { reason: string };

export const adminVendorsService = {
  list: (params = "") =>
    api.get<{ items: AdminVendor[]; total: number }>(`/admin/vendors${params}`),
  get: (id: string) => api.get<AdminVendorDetail>(`/admin/vendors/${id}`),
  suspend: (id: string, body: Action) =>
    api.post(`/admin/vendors/${id}/suspend`, body),
  resume: (id: string, body: Action) =>
    api.post(`/admin/vendors/${id}/resume`, body),
  revision: (id: string, body: Action & { missingRequirements: string[] }) =>
    api.post(`/admin/vendors/${id}/revision`, body),
};
