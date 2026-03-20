import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  TrendingUp,
  Info,
} from "lucide-react";
import Link from "next/link";

export default function DailyScorePage() {
  const scoreData = {
    total: 85,
    checkpoints: [
      { id: "CP1", label: "Bahan Mentah", score: 25, status: "pass" },
      { id: "CP2", label: "Proses Masak", score: 25, status: "pass" },
      {
        id: "CP3",
        label: "Makanan Siap",
        score: 18,
        status: "warning",
        note: "Suhu kurang 2°C",
      },
      { id: "CP4", label: "Serah Terima", score: 22, status: "pass" },
    ],
    penalties: [{ label: "Keterlambatan 15 menit", deduction: 5 }],
    payout: 2350000,
  };

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Skor Harian" />

      <div className="p-4 space-y-6">
        <section className="flex flex-col items-center justify-center py-8 space-y-2">
          <div className="relative h-40 w-40 flex items-center justify-center">
            <svg className="h-full w-full -rotate-90">
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="12"
              />
              <circle
                cx="80"
                cy="80"
                r="70"
                fill="none"
                stroke="#16a34a"
                strokeWidth="12"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * scoreData.total) / 100}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-black text-slate-900">
                {scoreData.total}
              </span>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                Poin
              </span>
            </div>
          </div>
          <p className="font-bold text-green-600 flex items-center gap-1.5">
            <TrendingUp className="h-4 w-4" /> Performa Sangat Baik
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-bold text-slate-900">Breakdown Checkpoint</h3>
          <div className="space-y-2">
            {scoreData.checkpoints.map((cp) => (
              <Card key={cp.id} className="border-none shadow-sm">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {cp.status === "pass" ? (
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-amber-500" />
                    )}
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        {cp.id}: {cp.label}
                      </p>
                      {cp.note && (
                        <p className="text-[10px] text-amber-600 font-medium">
                          {cp.note}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className="font-black text-slate-900">+{cp.score}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-bold text-slate-900">Penalti & Pengurangan</h3>
          <div className="p-4 bg-red-50 rounded-2xl border border-red-100 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-red-500" />
              <p className="text-sm font-bold text-red-900">
                {scoreData.penalties[0]?.label}
              </p>
            </div>
            <span className="font-black text-red-600">
              -{scoreData.penalties[0]?.deduction}
            </span>
          </div>
        </section>

        <Card className="bg-slate-900 text-white border-none shadow-xl">
          <CardContent className="p-6">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">
                  Estimasi Dana Cair
                </p>
                <h3 className="text-2xl font-black mt-1">
                  Rp {scoreData.payout.toLocaleString()}
                </h3>
              </div>
              <Button size="icon" variant="ghost" className="text-slate-400">
                <Info className="h-5 w-5" />
              </Button>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-[10px] text-slate-400">
                Dana akan ditransfer otomatis ke wallet vendor setelah
                verifikasi akhir jam 18:00 WIB.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="pb-8">
          <Button
            variant="outline"
            className="w-full h-12 border-slate-200 font-bold"
            asChild
          >
            <Link href="/operasional/history">Lihat Riwayat Lengkap</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
