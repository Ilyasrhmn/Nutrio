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
  Info,
  Calendar,
  Activity
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Card, CardContent, CardHeader, CardTitle } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

export function VendorDashboard() {
  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* 1. Operational Hero Banner (Deep Teal Glassmorphism) */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <CookingPot className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> Dapur Menteng Beroperasi
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Dapur Operasional Utama</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Pemantauan kepatuhan masak dan estimasi logistik hari ini. Seluruh data disinkronisasi ke pusat BGN secara real-time.
            </p>
          </div>
          
          <div className="flex bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-4 gap-6 shrink-0">
            <div>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">Tanggal Validasi</p>
              <p className="text-white font-bold flex items-center gap-2 mt-1 text-sm">
                <Calendar className="size-4 text-teal-400" /> 16 Mar 2026
              </p>
            </div>
            <div className="w-px bg-white/10" />
            <div>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">SLA Pengiriman</p>
              <p className="text-emerald-400 font-bold flex items-center gap-2 mt-1 text-sm">
                <Clock className="size-4" /> 10:30 WIB
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Top Bento Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Main Revenue Card */}
        <Card className="bg-teal-50/90 backdrop-blur-xl border border-teal-100 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300">
          <CardContent className="p-6 md:p-8">
            <div className="flex items-center justify-between mb-4">
              <div className="size-10 bg-teal-100/80 rounded-xl flex items-center justify-center text-teal-700">
                <Wallet className="size-5" />
              </div>
              <Badge className="bg-white text-teal-700 border-none font-bold shadow-sm">Hari Ini</Badge>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Estimasi Pendapatan</p>
              <h3 className="text-3xl font-extrabold text-slate-900 mt-1 tracking-tighter">Rp 12.45M</h3>
              <p className="text-xs text-teal-700 font-bold mt-2 flex items-center gap-1.5">
                <ShieldCheck className="size-3.5" /> Terverifikasi AI
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Other Stat Cards */}
        {[
          { label: "Target Porsi", value: "850", sub: "Siswa Terdaftar", icon: Users, iconBg: "bg-blue-50", iconColor: "text-blue-600" },
          { label: "Skor Gizi AI", value: "98/100", sub: "Sesuai Juknis BGN", icon: Activity, iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
          { label: "Kapasitas Stok", value: "82%", sub: "Aman 3 hari kedepan", icon: Package, iconBg: "bg-amber-50", iconColor: "text-amber-600" },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200/60 shadow-sm rounded-2xl bg-white hover:border-slate-300 transition-colors">
            <CardContent className="p-6 md:p-8">
              <div className="flex items-center justify-between mb-4">
                <div className={cn("size-10 rounded-xl flex items-center justify-center", stat.iconBg, stat.iconColor)}>
                  <stat.icon className="size-5" />
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1 tracking-tight">{stat.value}</h3>
                <p className="text-xs font-semibold text-slate-500 mt-2">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 3. Main Bento Layout (2 Cols: Wide Left, Narrow Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Left Col (Takes 2 spaces) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* Horizontal Checkpoint Timeline */}
          <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 p-6 flex flex-row items-center justify-between bg-slate-50/50">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Timeline Kepatuhan SOP</CardTitle>
                <p className="text-xs font-semibold text-slate-500 mt-1">Status tahapan validasi dapur</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl font-bold border-slate-200 text-slate-600">
                Lihat Detail Log
              </Button>
            </CardHeader>
            <CardContent className="p-8">
              <div className="relative flex justify-between max-w-2xl mx-auto">
                {/* Connecting Line */}
                <div className="absolute top-6 left-12 right-12 h-1 bg-slate-100 rounded-full -z-0">
                  <div className="absolute top-0 left-0 h-full bg-teal-500 rounded-full w-[65%]" />
                </div>
                
                {[
                  { id: "CP1", label: "Bahan Masuk", time: "04:00", status: "done", desc: "Verif Foto" },
                  { id: "CP2", label: "Proses Masak", time: "06:30", status: "done", desc: "Verif AI" },
                  { id: "CP3", label: "Porsi Siap", time: "09:00", status: "current", desc: "Timbang" },
                  { id: "CP4", label: "Distribusi", time: "10:30", status: "waiting", desc: "Kurir" },
                ].map((cp, i) => (
                  <div key={i} className="flex flex-col items-center text-center relative z-10 w-24">
                    <div className={cn(
                      "size-12 rounded-full flex items-center justify-center border-4 bg-white transition-all shadow-sm",
                      cp.status === 'done' ? "border-teal-500 text-teal-600" : 
                      cp.status === 'current' ? "border-teal-600 text-teal-700 ring-4 ring-teal-50" : "border-slate-200 text-slate-400"
                    )}>
                      {cp.status === 'done' ? <CheckCircle2 className="size-5" /> : <span className="text-sm font-bold">{cp.id}</span>}
                    </div>
                    <div className="mt-4 space-y-1">
                      <p className="text-xs font-bold text-slate-800">{cp.label}</p>
                      <p className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md inline-block">{cp.desc}</p>
                      <p className="text-[10px] font-bold text-slate-400 flex items-center justify-center gap-1 mt-1">
                        <Clock className="size-3" /> {cp.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Daily Menu & Logistics */}
          <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-100 p-6 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-slate-900">Logistik Menu Harian</CardTitle>
                <p className="text-xs font-semibold text-slate-500 mt-1">Nasi Ayam Teriyaki & Sayur Brokoli</p>
              </div>
              <Button className="bg-teal-50 text-teal-700 hover:bg-teal-100 font-bold rounded-xl h-9 px-4 gap-2 border-none shadow-none">
                Cetak SOP <ArrowRight className="size-3.5" />
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {[
                  { name: "Daging Ayam Fillet", qty: "85 kg", source: "PT Tani Makmur Sejahtera", status: "Tiba 04:15", statusColor: "text-emerald-600" },
                  { name: "Beras Premium", qty: "120 kg", source: "Koperasi Tani Lokal", status: "Stok Gudang", statusColor: "text-teal-600" },
                  { name: "Sayur Brokoli & Wortel", qty: "40 kg", source: "PT Tani Makmur Sejahtera", status: "Tiba 04:15", statusColor: "text-emerald-600" },
                ].map((ing, i) => (
                  <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 hover:bg-slate-50/80 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="size-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-sm shrink-0">
                        {i+1}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-sm">{ing.name}</p>
                        <p className="text-[11px] font-semibold text-slate-500 mt-1 flex items-center gap-1.5">
                          <Package className="size-3.5 text-slate-400" /> {ing.source}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 sm:mt-0 sm:text-right flex items-center sm:block justify-between pl-16 sm:pl-0">
                      <p className="font-bold text-slate-900 text-base">{ing.qty}</p>
                      <p className={cn("text-[10px] font-bold uppercase tracking-widest mt-0.5", ing.statusColor)}>
                        {ing.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Col (Takes 1 space) */}
        <div className="space-y-6">
          
          {/* Action Center / Alerts */}
          <Card className="border-red-100 shadow-sm rounded-2xl overflow-hidden bg-white">
            <CardHeader className="p-5 border-b border-red-50 bg-red-50/50">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-2">
                <span className="size-2 bg-red-500 rounded-full animate-ping block" /> AI Action Center
              </h3>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-slate-50">
              
              {/* Alert 1 */}
              <div className="p-5 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  <div className="size-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <AlertTriangle className="size-4 text-red-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-red-700 uppercase tracking-widest mb-1">Anomali Foto CP2</p>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed mb-3">
                      AI mendeteksi foto masakan blur. Ulangi agar skor tidak terpotong.
                    </p>
                    <Button size="sm" className="bg-red-50 text-red-700 hover:bg-red-100 border-none rounded-lg font-bold shadow-none h-8 px-4 text-xs">
                      Upload Ulang
                    </Button>
                  </div>
                </div>
              </div>

              {/* Alert 2 */}
              <div className="p-5 bg-white hover:bg-slate-50 transition-colors">
                <div className="flex gap-4">
                  <div className="size-8 bg-amber-100 rounded-lg flex items-center justify-center shrink-0">
                    <Info className="size-4 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-amber-700 uppercase tracking-widest mb-1">Info Logistik</p>
                    <p className="text-xs font-semibold text-slate-600 leading-relaxed">
                      Jadwal pengiriman gas LPG dari supplier mundur ke pukul 14:00 WIB.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Help Card */}
          <Card className="border-none shadow-md rounded-2xl overflow-hidden bg-gradient-to-br from-teal-800 to-teal-900 text-white">
            <CardContent className="p-6 md:p-8">
              <div className="size-12 bg-white/10 rounded-xl flex items-center justify-center mb-5">
                <ShieldCheck className="size-6 text-teal-300" />
              </div>
              <h3 className="font-bold text-base mb-1.5">Pusat Bantuan Juknis</h3>
              <p className="text-xs font-medium text-teal-100/80 mb-6 leading-relaxed">
                Akses panduan teknis operasional dapur tersertifikasi BGN secara instan.
              </p>
              <Button className="w-full bg-white text-teal-900 hover:bg-teal-50 font-bold rounded-xl h-10 text-xs shadow-xl shadow-teal-950/50">
                Tanya Asisten AI
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
