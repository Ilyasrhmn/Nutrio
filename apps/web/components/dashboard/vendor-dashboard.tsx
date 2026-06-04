"use client"

import React from "react"
import { 
  CookingPot, 
  Users, 
  ShieldCheck, 
  Package, 
  CheckCircle2, 
  Clock, 
  ArrowRight, 
  Wallet,
  AlertTriangle,
  ChevronRight,
  Info
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

export function VendorDashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Dapur Operasional</h1>
          <p className="text-slate-500 text-sm mt-1">Monitor kepatuhan masak dan estimasi pencairan dana hari ini.</p>
        </div>
        <div className="flex gap-3">
          <div className="text-right px-4 py-2 bg-white rounded-xl border border-slate-200/60 shadow-sm flex flex-col justify-center">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Dapur</p>
            <p className="text-sm font-bold text-emerald-600 flex items-center gap-1.5 justify-end mt-0.5">
              <div className="size-2 rounded-full bg-emerald-500 animate-pulse" /> TERVERIFIKASI
            </p>
          </div>
        </div>
      </div>

      {/* Production & Revenue Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Main Stat Card */}
        <div className="p-5 bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-xl text-white space-y-4 shadow-md shadow-indigo-200">
          <div className="flex items-center justify-between">
            <div className="size-10 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">
              <Wallet className="size-5" />
            </div>
            <Badge className="bg-white/20 text-white border-none hover:bg-white/30 transition-colors">Hari Ini</Badge>
          </div>
          <div>
            <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Estimasi Pendapatan</p>
            <h3 className="text-2xl font-black mt-1">Rp 12.450.000</h3>
            <p className="text-[10px] text-indigo-300 mt-2 flex items-center gap-1">
              <ShieldCheck className="size-3" /> Berdasarkan porsi terverifikasi AI
            </p>
          </div>
        </div>

        {/* Other Stat Cards */}
        {[
          { label: "Target Porsi", value: "850", sub: "Siswa Terdaftar", icon: Users, color: "blue" },
          { label: "Skor Gizi AI", value: "98", sub: "/100 (Sesuai Juknis)", icon: ShieldCheck, color: "emerald" },
          { label: "Stok Bahan", value: "82%", sub: "Aman untuk 3 hari", icon: Package, color: "amber" },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200/60 shadow-sm rounded-xl">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className={`size-10 bg-${stat.color}-50 flex items-center justify-center rounded-lg text-${stat.color}-600`}>
                  <stat.icon className="size-5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                <p className="text-[10px] text-slate-500 mt-1 font-medium">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Checkpoints & Daily Menu */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Checkpoint Progress */}
          <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Timeline Kepatuhan (Checkpoints)</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Pemantauan validasi AI secara real-time</p>
              </div>
              <Badge variant="outline" className="bg-white font-semibold text-indigo-600 border-indigo-100">
                Senin, 20 Mar
              </Badge>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-4 gap-4 relative">
                <div className="absolute top-5 left-[10%] right-[10%] h-0.5 bg-slate-100 -z-0" />
                {[
                  { id: "CP1", label: "Bahan Masuk", time: "04:00", status: "done" },
                  { id: "CP2", label: "Proses Masak", time: "06:30", status: "done" },
                  { id: "CP3", label: "Porsi Siap", time: "09:00", status: "current" },
                  { id: "CP4", label: "Distribusi", time: "10:30", status: "waiting" },
                ].map((cp, i) => (
                  <div key={i} className="flex flex-col items-center text-center gap-3 relative z-10">
                    <div className={cn(
                      "size-10 rounded-xl flex items-center justify-center border-2 shadow-sm transition-all bg-white",
                      cp.status === 'done' ? "border-emerald-500 text-emerald-500" : 
                      cp.status === 'current' ? "border-indigo-600 text-indigo-600 ring-4 ring-indigo-50" : "border-slate-200 text-slate-300"
                    )}>
                      {cp.status === 'done' ? <CheckCircle2 className="size-5" /> : <span className="text-xs font-bold">{cp.id}</span>}
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-700 uppercase tracking-widest">{cp.label}</p>
                      <p className="text-[10px] text-slate-400 font-semibold flex items-center justify-center gap-1 mt-0.5">
                        <Clock className="size-3" /> {cp.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Menu */}
          <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Menu Harian</CardTitle>
                <p className="text-xs text-slate-500 mt-1">Nasi Ayam Teriyaki & Sayur Brokoli</p>
              </div>
              <Button variant="ghost" size="sm" className="text-indigo-600 font-semibold gap-1 hover:bg-indigo-50">
                Detail Resep <ChevronRight className="size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-100">
                {[
                  { name: "Daging Ayam Fillet", qty: "85 kg", source: "PT Tani Makmur Sejahtera", status: "Tiba 04:15" },
                  { name: "Beras Premium", qty: "120 kg", source: "Koperasi Tani Lokal", status: "Stok Gudang" },
                  { name: "Sayur Brokoli & Wortel", qty: "40 kg", source: "PT Tani Makmur Sejahtera", status: "Tiba 04:15" },
                ].map((ing, i) => (
                  <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="size-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-500 font-bold text-xs">
                        {i+1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{ing.name}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Package className="size-3" /> {ing.source}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-indigo-600 text-sm">{ing.qty}</p>
                      <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{ing.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Real-time Alerts */}
        <div className="space-y-6">
          <Card className="border-red-100 bg-red-50/30 shadow-sm rounded-xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <AlertTriangle className="size-24 text-red-900" />
            </div>
            <CardHeader className="p-5 pb-0">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <div className="size-2 bg-red-500 rounded-full animate-ping" /> Alert Sistem AI
              </h3>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              <div className="p-4 bg-white rounded-xl border border-red-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="size-4 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-red-700 uppercase tracking-widest mb-1">Anomali Foto CP2</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      AI mendeteksi foto masakan blur. Segera ulangi upload untuk menghindari pemotongan skor harian.
                    </p>
                    <Button size="sm" className="mt-3 bg-red-100 text-red-700 hover:bg-red-200 border-none h-7 text-[10px] font-bold px-3">
                      Upload Ulang
                    </Button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white rounded-xl border border-amber-100 shadow-sm">
                <div className="flex items-start gap-3">
                  <Info className="size-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest mb-1">Info Logistik</p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Jadwal pengiriman gas LPG dari supplier mundur ke pukul 14:00 WIB.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-200/60 shadow-sm rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-2">Pusat Bantuan Juknis</h3>
              <p className="text-xs text-slate-400 mb-6">Akses panduan teknis operasional dapur tersertifikasi BGN.</p>
              <Button className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold rounded-lg h-10">
                Tanya Asisten AI
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
