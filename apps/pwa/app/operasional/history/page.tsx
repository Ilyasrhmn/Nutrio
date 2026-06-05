"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ChevronRight, Calendar, Loader2, ClipboardList } from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface ScoreHistory {
  date: string;
  score: number;
  cpDone: number;
}

export default function CheckpointHistoryPage() {
  const [history, setHistory] = useState<ScoreHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<ScoreHistory[]>("/scoring/history?days=7")
      .then((r) => setHistory(r.data ?? []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false));
  }, []);

  const avg =
    history.length > 0
      ? Math.round(history.reduce((s, h) => s + (h.score ?? 0), 0) / history.length)
      : null;

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Riwayat Checkpoint" />

      <div className="p-4 space-y-4">
        <section className="bg-green-600 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-xs font-bold text-green-100 uppercase tracking-widest">Rata-rata Minggu Ini</p>
          <div className="flex items-end gap-2 mt-1">
            {loading ? (
              <Loader2 className="h-8 w-8 animate-spin text-green-200" />
            ) : avg !== null ? (
              <>
                <h3 className="text-4xl font-black">{avg}</h3>
                <span className="text-lg font-bold text-green-100 mb-1">/ 100</span>
              </>
            ) : (
              <h3 className="text-2xl font-black text-green-100">Belum ada data</h3>
            )}
          </div>
          {avg !== null && !loading && (
            <div className="mt-4 h-2 w-full bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${avg}%` }} />
            </div>
          )}
        </section>

        <div className="space-y-3">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="h-4 w-4 text-slate-400" /> 7 Hari Terakhir
          </h3>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center py-12 gap-3 text-slate-400">
              <ClipboardList className="h-10 w-10 opacity-30" />
              <p className="text-sm font-medium">Belum ada riwayat skor</p>
              <p className="text-xs">Selesaikan checkpoint harian untuk melihat riwayat</p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((item, i) => {
                const score = item.score ?? 0;
                const cpDone = item.cpDone ?? 0;
                const status = score >= 80 ? "Lengkap" : score >= 60 ? "Partial" : "Review";
                const statusColor = score >= 80 ? "text-green-600" : score >= 60 ? "text-amber-600" : "text-red-600";

                return (
                  <Card key={i} className="border-none shadow-sm active:scale-[0.98] transition-transform">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-center">
                        <div className="space-y-1.5">
                          <p className="text-sm font-bold text-slate-900">
                            {new Date(item.date).toLocaleDateString("id-ID", {
                              weekday: "long",
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </p>
                          <div className="flex gap-1">
                            {Array.from({ length: 4 }).map((_, idx) => (
                              <div
                                key={idx}
                                className={`h-1.5 w-6 rounded-full ${idx < cpDone ? "bg-green-500" : "bg-slate-200"}`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="text-lg font-black text-slate-900 leading-none">{score}</p>
                            <p className={`text-[10px] font-bold ${statusColor}`}>{status}</p>
                          </div>
                          <ChevronRight className="h-5 w-5 text-slate-300" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
