"use client";

import { useState, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Search,
  Building2,
  ChevronRight,
  TrendingUp,
  Info,
  ArrowLeft,
  Loader2,
  Star,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";

interface SppgItem {
  id: string;
  name: string;
  score: number;
  targetPorsi: number;
  schoolCount: number;
}

interface SppgProfile extends SppgItem {
  scoreHistory30d: { date: string; score: number }[];
}

interface OverviewStats {
  totalActiveVendors: number;
  totalPorsiToday: number;
  vendorsExcellent: number;
  confirmationsToday: number;
}

export default function PublikPage() {
  const [overview, setOverview] = useState<OverviewStats | null>(null);
  const [sppgs, setSppgs] = useState<SppgItem[]>([]);
  const [selected, setSelected] = useState<SppgProfile | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    apiClient.get<OverviewStats>("/public/overview")
      .then((r) => setOverview(r.data))
      .catch(() => {});
  }, []);

  const fetchSppgs = useCallback((q?: string) => {
    setLoadingList(true);
    const qs = q ? `?q=${encodeURIComponent(q)}&limit=20` : "?limit=20";
    apiClient.get<SppgItem[]>(`/public/sppg/search${qs}`)
      .then((r) => setSppgs(r.data))
      .catch(() => setSppgs([]))
      .finally(() => setLoadingList(false));
  }, []);

  useEffect(() => {
    fetchSppgs();
  }, [fetchSppgs]);

  useEffect(() => {
    const t = setTimeout(() => fetchSppgs(searchQuery || undefined), 300);
    return () => clearTimeout(t);
  }, [searchQuery, fetchSppgs]);

  const openDetail = (id: string) => {
    setLoadingDetail(true);
    apiClient.get<SppgProfile>(`/public/sppg/${id}`)
      .then((r) => setSelected(r.data))
      .catch(() => setSelected(null))
      .finally(() => setLoadingDetail(false));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <PageHeader title="Transparansi MBG" showNotifications={false} />

      {selected ? (
        <div className="animate-in fade-in slide-in-from-right-4 duration-300">
          <div className="bg-white border-b border-slate-200 p-4 space-y-4">
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2 text-slate-500 font-bold h-8"
              onClick={() => setSelected(null)}
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> Kembali
            </Button>
            <div className="flex items-start gap-4">
              <div className="h-14 w-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center flex-shrink-0">
                <Building2 className="h-8 w-8" />
              </div>
              <div className="space-y-1">
                <h2 className="text-xl font-black text-slate-900 leading-tight">{selected.name}</h2>
                <p className="text-xs text-slate-500 font-medium">ID: {selected.id.slice(0, 8)}…</p>
              </div>
            </div>
          </div>

          <div className="p-4 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <Card className="border-none shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Skor Hari Ini</p>
                  <p className="text-3xl font-black text-green-600">{selected.score}</p>
                </CardContent>
              </Card>
              <Card className="border-none shadow-sm">
                <CardContent className="p-4 text-center">
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Target Porsi</p>
                  <p className="text-3xl font-black text-slate-900">{selected.targetPorsi}</p>
                </CardContent>
              </Card>
            </div>

            {selected.scoreHistory30d.length > 0 && (
              <Card className="border-none shadow-sm">
                <CardContent className="p-4 space-y-3">
                  <p className="text-xs font-black text-slate-500 uppercase tracking-wider">Tren Skor 30 Hari</p>
                  <div className="flex items-end gap-1 h-20">
                    {selected.scoreHistory30d.slice(-14).map((h, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center justify-end">
                        <div
                          className="w-full rounded-sm bg-green-500"
                          style={{ height: `${(h.score / 100) * 100}%`, opacity: 0.6 + (i / 14) * 0.4 }}
                        />
                      </div>
                    ))}
                  </div>
                  <p className="text-[10px] text-slate-400 text-right">
                    Rata-rata: {Math.round(selected.scoreHistory30d.reduce((s, h) => s + h.score, 0) / selected.scoreHistory30d.length)}
                  </p>
                </CardContent>
              </Card>
            )}

            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
              <Info className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-blue-700 font-medium leading-relaxed">
                Data divalidasi oleh sistem AI dan tercatat secara permanen untuk menjamin transparansi publik.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-4 space-y-6">
          <section className="space-y-4">
            <div className="text-center space-y-2 py-4">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Traceability MBG</h2>
              <p className="text-sm text-slate-500 font-medium">Lacak perjalanan makanan bergizi di daerah Anda.</p>
            </div>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
              <input
                className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-12 pr-4 text-sm font-medium shadow-sm focus:ring-2 focus:ring-green-600 outline-none transition-all"
                placeholder="Cari Vendor / SPPG..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest ml-1">
              Daftar Vendor Aktif
            </h3>
            {loadingList ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
              </div>
            ) : sppgs.length === 0 ? (
              <p className="text-center text-sm text-slate-400 py-8">Tidak ada vendor ditemukan</p>
            ) : (
              <div className="space-y-2">
                {sppgs.map((item) => (
                  <Card
                    key={item.id}
                    className="border-none shadow-sm rounded-2xl active:scale-[0.98] transition-all cursor-pointer"
                    onClick={() => openDetail(item.id)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center">
                          <Building2 className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{item.name}</p>
                          <p className="text-[10px] text-slate-500 font-medium">
                            {item.schoolCount} sekolah · {item.targetPorsi} porsi
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={`border-none font-bold text-[10px] ${item.score >= 80 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
                          <Star className="h-2.5 w-2.5 mr-1" />
                          {item.score}
                        </Badge>
                        <ChevronRight className="h-5 w-5 text-slate-300" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {overview && (
            <section className="pt-4 border-t border-slate-200">
              <div className="bg-slate-900 rounded-3xl p-6 text-white space-y-4 shadow-xl">
                <div className="flex items-center gap-2 text-green-400">
                  <TrendingUp className="h-5 w-5" />
                  <p className="text-xs font-black uppercase tracking-widest">Statistik Hari Ini</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Total Porsi</p>
                    <p className="text-xl font-black">{overview.totalPorsiToday.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Vendor Excellent</p>
                    <p className="text-xl font-black">{overview.vendorsExcellent}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Konfirmasi Sekolah</p>
                    <p className="text-xl font-black">{overview.confirmationsToday}</p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Vendor Aktif</p>
                    <p className="text-xl font-black">{overview.totalActiveVendors}</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      )}

      {loadingDetail && (
        <div className="fixed inset-0 bg-white/70 flex items-center justify-center z-50">
          <Loader2 className="h-8 w-8 animate-spin text-green-600" />
        </div>
      )}
    </div>
  );
}
