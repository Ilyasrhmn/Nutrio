"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Button } from "@workspace/ui/components/button";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Info,
  Loader2,
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface ScoreEvent {
  id: string;
  eventType: string;
  delta: number;
  createdAt: string;
}

interface ScoreRecord {
  scoreCurrent: number;
  scoreDate: string;
}

interface TodayScore {
  score: number;
  record: ScoreRecord | null;
  events: ScoreEvent[];
  disbursementEstimate: number;
}

const CP_LABELS: Record<string, string> = {
  CP1: "Bahan Mentah",
  CP2: "Proses Masak",
  CP3: "Makanan Siap",
  CP4: "Serah Terima",
};

export default function DailyScorePage() {
  const [data, setData] = useState<TodayScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<TodayScore>("/scoring/today")
      .then((r) => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader title="Skor Harian" />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col min-h-screen">
        <PageHeader title="Skor Harian" />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-3">
          <Info className="h-10 w-10 text-slate-300" />
          <p className="font-bold text-slate-500">Data skor belum tersedia</p>
          <p className="text-xs text-slate-400">Selesaikan minimal 1 checkpoint hari ini</p>
        </div>
      </div>
    );
  }

  const score = data.score ?? 0;
  const penaltyEvents = data.events.filter((e) => e.delta < 0);
  const bonusEvents = data.events.filter((e) => e.delta > 0 && !e.eventType.startsWith("CP"));
  const cpEvents = data.events.filter((e) => e.eventType.startsWith("CP"));

  const scoreLabel = score >= 90 ? "Performa Sangat Baik" : score >= 75 ? "Performa Baik" : "Perlu Peningkatan";
  const scoreLabelColor = score >= 90 ? "text-green-600" : score >= 75 ? "text-amber-600" : "text-red-600";

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Skor Harian" />

      <div className="p-4 space-y-6">
        <section className="flex flex-col items-center justify-center py-8 space-y-2">
          <div className="relative h-40 w-40 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90">
              <circle cx="80" cy="80" r="70" fill="none" stroke="#e2e8f0" strokeWidth="12" />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#16a34a"
                strokeWidth="12"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * Math.min(score, 100)) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-900">{score}</span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Poin</span>
            </div>
          </div>
          <p className={`font-bold flex items-center gap-1.5 ${scoreLabelColor}`}>
            <TrendingUp className="h-4 w-4" /> {scoreLabel}
          </p>
        </section>

        {cpEvents.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-bold text-slate-900">Checkpoint Selesai</h3>
            <div className="space-y-2">
              {cpEvents.map((ev) => (
                <Card key={ev.id} className="border-none shadow-sm">
                  <CardContent className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      <p className="text-sm font-bold text-slate-900">
                        {ev.eventType}: {CP_LABELS[ev.eventType] ?? ev.eventType}
                      </p>
                    </div>
                    <span className="font-black text-green-600">+{ev.delta}</span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {penaltyEvents.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-bold text-slate-900">Penalti & Pengurangan</h3>
            <div className="space-y-2">
              {penaltyEvents.map((ev) => (
                <div key={ev.id} className="p-4 bg-red-50 rounded-2xl border border-red-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <XCircle className="h-5 w-5 text-red-500" />
                    <p className="text-sm font-bold text-red-900">{ev.eventType.replace(/_/g, " ")}</p>
                  </div>
                  <span className="font-black text-red-600">{ev.delta}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {bonusEvents.length > 0 && (
          <section className="space-y-3">
            <h3 className="font-bold text-slate-900">Bonus</h3>
            <div className="space-y-2">
              {bonusEvents.map((ev) => (
                <div key={ev.id} className="p-4 bg-green-50 rounded-2xl border border-green-100 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-green-500" />
                    <p className="text-sm font-bold text-green-900">{ev.eventType.replace(/_/g, " ")}</p>
                  </div>
                  <span className="font-black text-green-600">+{ev.delta}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {data.disbursementEstimate > 0 && (
          <Card className="bg-slate-900 text-white border-none shadow-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                    Estimasi Dana Cair
                  </p>
                  <h3 className="text-2xl font-black mt-1">
                    Rp {data.disbursementEstimate.toLocaleString()}
                  </h3>
                </div>
                <Button size="icon" variant="ghost" className="text-slate-400">
                  <Info className="h-5 w-5" />
                </Button>
              </div>
              <div className="mt-4 pt-4 border-t border-white/10">
                <p className="text-[10px] text-slate-400">
                  Dana akan ditransfer otomatis ke wallet vendor setelah verifikasi akhir jam 18:00 WIB.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="pb-8">
          <Button variant="outline" className="w-full h-12 border-slate-200 font-bold" asChild>
            <Link href="/operasional/history">Lihat Riwayat Lengkap</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
