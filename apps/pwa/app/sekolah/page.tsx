"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import { School, Clock, Utensils, Calendar, ChevronRight, QrCode, Loader2 } from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api-client";

interface SppgInfo {
  id: string;
  name: string;
  score: number;
  targetPorsi: number;
  schoolCount: number;
}

interface OverviewStats {
  totalActiveVendors: number;
  totalPorsiToday: number;
  vendorsExcellent: number;
  confirmationsToday: number;
}

export default function SchoolDashboardPage() {
  const [sppg, setSppg] = useState<SppgInfo | null>(null);
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dateStr = today.toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const dayNames = ["MIN", "SEN", "SEL", "RAB", "KAM", "JUM", "SAB"];
  const next5Days = Array.from({ length: 5 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  useEffect(() => {
    Promise.all([
      apiClient.get<SppgInfo[]>("/public/sppg/search?limit=1"),
      apiClient.get<OverviewStats>("/public/overview"),
    ])
      .then(([sppgRes, overviewRes]) => {
        setSppg(sppgRes.data[0] ?? null);
        setOverview(overviewRes.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Portal Sekolah" />

      <div className="p-4 space-y-6">
        <section className="flex items-center gap-4">
          <div className="h-14 w-14 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600">
            <School className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900">Portal Sekolah MBG</h2>
            <p className="text-sm text-slate-500 font-medium">{dateStr}</p>
          </div>
        </section>

        <Link href="/sekolah/confirm" className="block">
          <Button className="w-full h-20 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl flex items-center justify-between px-6 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="bg-white/10 p-3 rounded-xl">
                <QrCode className="h-6 w-6" />
              </div>
              <div className="text-left">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Kurir Sudah Tiba?</p>
                <p className="text-lg font-black">Scan QR Code</p>
              </div>
            </div>
            <ChevronRight className="h-6 w-6 text-slate-500" />
          </Button>
        </Link>

        <section className="space-y-3">
          <h3 className="font-bold text-slate-900">Pengiriman Hari Ini</h3>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
          ) : sppg ? (
            <Card className="border-blue-100 bg-blue-50/30">
              <CardContent className="p-5 space-y-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] text-blue-700 font-bold uppercase">{sppg.name}</p>
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      <p className="font-bold text-slate-900">Aktif</p>
                    </div>
                  </div>
                  <Badge className="bg-blue-600 text-white border-none font-bold">
                    Skor {sppg.score}
                  </Badge>
                </div>
                <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-blue-100">
                  <Utensils className="h-5 w-5 text-blue-500" />
                  <p className="text-xs font-bold text-slate-700">
                    Target {sppg.targetPorsi} porsi · {sppg.schoolCount} sekolah
                  </p>
                </div>
                {overview && (
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-white p-2 rounded-lg text-center border border-blue-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Konfirmasi</p>
                      <p className="text-xs font-black text-slate-900">{overview.confirmationsToday} hari ini</p>
                    </div>
                    <div className="bg-white p-2 rounded-lg text-center border border-blue-100">
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Vendor Aktif</p>
                      <p className="text-xs font-black text-slate-900">{overview.totalActiveVendors}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="border-slate-100">
              <CardContent className="p-5 text-center text-slate-400">
                <Clock className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm font-medium">Belum ada pengiriman terjadwal hari ini</p>
                <p className="text-xs mt-1">Scan QR Code saat kurir tiba</p>
              </CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-3 pb-8">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-900">Jadwal 5 Hari ke Depan</h3>
            <Calendar className="h-4 w-4 text-slate-400" />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 no-scrollbar">
            {next5Days.map((d, i) => (
              <div
                key={i}
                className={`flex-shrink-0 w-16 h-20 rounded-xl flex flex-col items-center justify-center border-2 transition-colors ${
                  i === 0
                    ? "bg-green-600 border-green-600 text-white"
                    : "bg-white border-slate-100 text-slate-400"
                }`}
              >
                <span className="text-[10px] font-bold uppercase">{dayNames[d.getDay()]}</span>
                <span className="text-lg font-black">{d.getDate()}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
