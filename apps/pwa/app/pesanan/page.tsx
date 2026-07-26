"use client";

import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import { Textarea } from "@workspace/ui/components/textarea";
import { PackageSearch, Loader2, CheckCircle2, XCircle, Truck } from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { cn } from "@workspace/ui/lib/utils";

type OrderStatus = "draft" | "submitted" | "accepted" | "rejected" | "cancelled" | "dispatched" | "received";

interface OrderSummary {
  id: string;
  poNumber: string;
  status: OrderStatus;
  totalAmount: number;
  requestedDeliveryDate: string | null;
}

const STATUS_LABEL: Record<OrderStatus, { label: string; className: string }> = {
  draft: { label: "Draft", className: "bg-slate-100 text-slate-600" },
  submitted: { label: "Perlu Ditinjau", className: "bg-amber-100 text-amber-700" },
  accepted: { label: "Diterima", className: "bg-blue-100 text-blue-700" },
  rejected: { label: "Ditolak", className: "bg-red-100 text-red-700" },
  cancelled: { label: "Dibatalkan Vendor", className: "bg-slate-100 text-slate-500" },
  dispatched: { label: "Dikirim", className: "bg-indigo-100 text-indigo-700" },
  received: { label: "Selesai", className: "bg-emerald-100 text-emerald-700" },
};

function idempotencyHeaders() {
  return { headers: { "Idempotency-Key": crypto.randomUUID() } };
}

export default function SupplierOrdersPage() {
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actingId, setActingId] = useState<string | null>(null);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    apiClient
      .get<OrderSummary[]>("/orders/supplier")
      .then((r) => setOrders(r.data ?? []))
      .catch((err) => setError(err?.message ?? "Gagal memuat pesanan"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function accept(id: string) {
    setActingId(id);
    try {
      await apiClient.post(`/orders/${id}/accept`, undefined, idempotencyHeaders());
      load();
    } catch (err: any) {
      setError(err?.message ?? "Gagal menerima PO");
    } finally {
      setActingId(null);
    }
  }

  async function reject(id: string) {
    if (rejectReason.trim().length < 3) return;
    setActingId(id);
    try {
      await apiClient.post(`/orders/${id}/reject`, { reason: rejectReason.trim() }, idempotencyHeaders());
      setRejectingId(null);
      setRejectReason("");
      load();
    } catch (err: any) {
      setError(err?.message ?? "Gagal menolak PO");
    } finally {
      setActingId(null);
    }
  }

  async function dispatch(id: string) {
    setActingId(id);
    try {
      await apiClient.post(`/orders/${id}/dispatch`, undefined, idempotencyHeaders());
      load();
    } catch (err: any) {
      setError(err?.message ?? "Gagal menandai dikirim");
    } finally {
      setActingId(null);
    }
  }

  const pendingCount = orders.filter((o) => o.status === "submitted").length;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Pesanan" />
      <div className="p-4 space-y-4">
        {pendingCount > 0 && (
          <p className="text-sm font-bold text-amber-700 bg-amber-50 rounded-xl px-3 py-2">
            {pendingCount} PO menunggu keputusan Anda
          </p>
        )}

        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        )}

        {!loading && error && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-4 text-sm text-red-600">{error}</CardContent>
          </Card>
        )}

        {!loading && !error && orders.length === 0 && (
          <Card className="border-none shadow-sm">
            <CardContent className="p-8 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <PackageSearch className="h-7 w-7" />
              </div>
              <p className="font-bold text-slate-900">Belum ada pesanan</p>
              <p className="text-sm text-slate-500">Pesanan dari vendor akan muncul di sini.</p>
            </CardContent>
          </Card>
        )}

        {!loading && orders.map((order) => {
          const status = STATUS_LABEL[order.status];
          return (
            <Card key={order.id} className={cn("border-none shadow-sm", order.status === "submitted" && "ring-2 ring-amber-200")}>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-900 text-sm">{order.poNumber}</p>
                  <Badge className={cn("border-none text-[10px] font-bold", status.className)}>{status.label}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{order.requestedDeliveryDate ? new Date(order.requestedDeliveryDate).toLocaleDateString("id-ID") : "-"}</span>
                  <span className="font-bold text-slate-900">Rp {order.totalAmount.toLocaleString("id-ID")}</span>
                </div>

                {order.status === "submitted" && rejectingId !== order.id && (
                  <div className="flex gap-2 pt-1">
                    <Button size="sm" className="flex-1" disabled={actingId === order.id} onClick={() => accept(order.id)}>
                      <CheckCircle2 className="h-4 w-4 mr-1.5" /> Terima
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" disabled={actingId === order.id} onClick={() => setRejectingId(order.id)}>
                      <XCircle className="h-4 w-4 mr-1.5" /> Tolak
                    </Button>
                  </div>
                )}

                {order.status === "submitted" && rejectingId === order.id && (
                  <div className="space-y-2 pt-1">
                    <Textarea
                      placeholder="Alasan penolakan (min. 3 karakter)"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="flex-1"
                        disabled={actingId === order.id || rejectReason.trim().length < 3}
                        onClick={() => reject(order.id)}
                      >
                        Kirim Penolakan
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => { setRejectingId(null); setRejectReason(""); }}>
                        Batal
                      </Button>
                    </div>
                  </div>
                )}

                {order.status === "accepted" && (
                  <Button size="sm" className="w-full" disabled={actingId === order.id} onClick={() => dispatch(order.id)}>
                    <Truck className="h-4 w-4 mr-1.5" /> Tandai Dikirim
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
