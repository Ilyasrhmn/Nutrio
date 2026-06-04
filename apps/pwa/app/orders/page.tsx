"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { CheckCircle2, Circle, Loader2, Package } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface CheckpointEvent {
  id: string;
  cpType: string;
  cpStatus: string;
  completedAt: string | null;
  createdAt: string;
}

const CP_LABELS: Record<string, string> = {
  CP1: "Bahan Mentah Diterima",
  CP2: "Proses Memasak",
  CP3: "Makanan Siap Kemas",
  CP4: "Serah Terima ke Sekolah",
};

const CP_ORDER = ["CP1", "CP2", "CP3", "CP4"];

export default function OrdersListPage() {
  const [events, setEvents] = useState<CheckpointEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<CheckpointEvent[]>("/checkpoints/today")
      .then((r) => setEvents(r.data ?? []))
      .catch(() => setEvents([]))
      .finally(() => setLoading(false));
  }, []);

  const eventMap = new Map(events.map((e) => [e.cpType, e]));
  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Progress Operasional" />

      <div className="p-4 space-y-6">
        <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
          <Package className="h-6 w-6 text-slate-400" />
          <div>
            <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Hari Ini</p>
            <p className="text-sm font-bold text-slate-900">{today}</p>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <div className="space-y-3">
            {CP_ORDER.map((cpType, i) => {
              const ev = eventMap.get(cpType);
              const done = ev?.cpStatus === "done";
              const isNext = !done && CP_ORDER.slice(0, i).every((c) => eventMap.get(c)?.cpStatus === "done");

              return (
                <Card key={cpType} className={`border-none shadow-sm transition-all ${done ? "bg-green-50" : isNext ? "bg-blue-50 ring-1 ring-blue-200" : ""}`}>
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${done ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-400"}`}>
                      {done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${done ? "text-green-900" : "text-slate-700"}`}>
                        {cpType}: {CP_LABELS[cpType]}
                      </p>
                      {done && ev?.completedAt && (
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                          Selesai {new Date(ev.completedAt).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} WIB
                        </p>
                      )}
                      {isNext && (
                        <p className="text-[10px] text-blue-600 font-bold mt-0.5">Selanjutnya →</p>
                      )}
                    </div>
                    <Badge
                      className={`border-none text-[10px] font-bold ${
                        done ? "bg-green-100 text-green-700" : isNext ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {done ? "Selesai" : isNext ? "Pending" : "Menunggu"}
                    </Badge>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {!loading && events.length === 0 && (
          <div className="text-center py-8 space-y-2">
            <p className="font-bold text-slate-400">Belum ada checkpoint hari ini</p>
            <p className="text-xs text-slate-500">Mulai dari CP1 untuk mencatat progres operasional</p>
          </div>
        )}
      </div>
    </div>
  );
}
