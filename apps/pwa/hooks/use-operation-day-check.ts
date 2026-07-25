"use client";

import { useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";

interface OperationDay {
  id: string;
  status: string;
  allowedNext: string[];
}

interface MenuPlanShortage {
  productId: string;
  unit: string;
  shortage: string | number;
}

export type DayCheckState =
  | { status: "checking" }
  | { status: "ready" }
  | { status: "no-menu-plan" }
  | { status: "insufficient-inventory"; shortages: MenuPlanShortage[] }
  | { status: "error"; message: string };

function todayString() {
  return new Date().toISOString().slice(0, 10);
}

function idempotencyHeaders() {
  return { headers: { "Idempotency-Key": crypto.randomUUID() } };
}

/**
 * CP1 submit requires an active operation_day server-side (409 otherwise).
 * Checks for one on mount, and tries to create it from today's menu plan
 * if missing, surfacing the real reason when it can't (no menu plan yet,
 * or insufficient inventory per the 422 shortage list).
 */
export function useOperationDayCheck() {
  const [check, setCheck] = useState<DayCheckState>({ status: "checking" });

  const run = async () => {
    setCheck({ status: "checking" });
    try {
      const dayRes = await apiClient.get<OperationDay | null>("/operation-days/today");
      if (dayRes.data) {
        setCheck({ status: "ready" });
        return;
      }

      let plan: { id: string } | null = null;
      try {
        const planRes = await apiClient.get<{ id: string }>(`/menu-plans/${todayString()}`);
        plan = planRes.data;
      } catch {
        setCheck({ status: "no-menu-plan" });
        return;
      }

      try {
        await apiClient.post("/operation-days", { menuPlanId: plan.id }, idempotencyHeaders());
        setCheck({ status: "ready" });
      } catch (err: any) {
        const shortages = err?.response?.data?.details?.shortages ?? err?.response?.data?.shortages;
        if (Array.isArray(shortages)) {
          setCheck({ status: "insufficient-inventory", shortages });
        } else {
          setCheck({ status: "error", message: err?.message ?? "Gagal membuat hari operasional" });
        }
      }
    } catch (err: any) {
      setCheck({ status: "error", message: err?.message ?? "Gagal memeriksa status hari operasional" });
    }
  };

  useEffect(() => {
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { check, retry: run };
}
