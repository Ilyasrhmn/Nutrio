"use client"

import React, { useState } from "react"
import { 
  TrendingUp, 
  ShieldAlert, 
  MapPin, 
  Store,
  DollarSign, 
  FileText,
  Activity,
  AlertCircle,
  Download,
  Wallet,
  ChevronRight,
  Truck,
  CheckCircle2,
  Clock,
  Landmark,
  ShieldCheck,
  Package
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("all");

  return (
    <div className="min-h-screen bg-[#F0F3F7] animate-in fade-in duration-700 pb-12">
      
      {/* VIBRANT HERO SECTION */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 pt-12 pb-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2000&auto=format&fit=crop')] mix-blend-overlay opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -bottom-24 -right-24 size-96 bg-indigo-500/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="bg-indigo-500/20 text-indigo-200 border border-indigo-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5">
                  <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse" /> Live Sync
                </Badge>
                <Badge className="bg-white/10 text-white border-none font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
                  Ringkasan Ekosistem
                </Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Command Center Nasional
              </h1>
              <p className="text-slate-300 font-medium text-sm max-w-2xl">
                Pantau seluruh metrik operasional MBG: Penyerapan Anggaran (Smart Contract), Aktivitas Marketplace B2B, Logistik Armada, dan Laporan Kepatuhan Gizi AI.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="h-12 px-6 bg-white text-slate-900 hover:bg-slate-50 shadow-lg shadow-black/20 font-bold rounded-2xl gap-2 transition-transform active:scale-95">
                <Download className="size-4" />
                Unduh Rekap Harian
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (Overlapping Hero) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 -mt-20 space-y-6">
        
        {/* 4 PILLAR METRICS (Grid 4 Cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Pillar 1: Finance / Kelola Dana */}
          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group bg-gradient-to-br from-emerald-600 to-teal-700 text-white">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Landmark className="size-32" />
            </div>
            <CardContent className="p-6 relative h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20">
                  <Wallet className="size-5 text-emerald-100" />
                </div>
                <p className="text-[10px] font-bold text-emerald-100 uppercase tracking-widest">Penyerapan APBN</p>
              </div>
              <div>
                <h3 className="text-3xl font-black tracking-tighter">Rp 10.2 <span className="text-base text-emerald-200 font-bold">T</span></h3>
                <div className="mt-3 bg-black/20 rounded-lg p-2.5 backdrop-blur-sm border border-white/10">
                  <div className="flex justify-between items-center mb-1.5 text-[9px] font-bold uppercase tracking-widest text-emerald-100">
                    <span>Progres</span>
                    <span>14%</span>
                  </div>
                  <Progress value={14} className="h-1.5 bg-white/10 [&>div]:bg-emerald-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pillar 2: Marketplace B2B */}
          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group bg-white">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Store className="size-32" />
            </div>
            <CardContent className="p-6 relative h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-violet-50 rounded-xl flex items-center justify-center text-violet-600">
                  <Store className="size-5" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Transaksi B2B</p>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">4,892</h3>
                <p className="text-xs font-bold text-slate-400 mt-1 mb-3">Pesanan Selesai Hari Ini</p>
                <div className="flex items-center gap-1.5 text-violet-700 text-[10px] font-bold bg-violet-50 px-2 py-1 rounded-md w-fit uppercase tracking-widest">
                  <TrendingUp className="size-3" /> AI Nego Berhasil: 86%
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pillar 3: Logistics */}
          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group bg-white">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Truck className="size-32" />
            </div>
            <CardContent className="p-6 relative h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Truck className="size-5" />
                </div>
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Distribusi Logistik</p>
              </div>
              <div>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black text-slate-900 tracking-tighter">1,248</h3>
                  <span className="text-sm font-bold text-slate-400">Titik</span>
                </div>
                <p className="text-xs font-bold text-slate-400 mt-1 mb-3">Terkirim Sesuai SLA</p>
                <div className="flex items-center gap-1.5 text-blue-700 text-[10px] font-bold bg-blue-50 px-2 py-1 rounded-md w-fit uppercase tracking-widest">
                  <MapPin className="size-3" /> 42 Armada Bergerak
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Pillar 4: AI Reports & Compliance */}
          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group bg-red-50">
            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <ShieldAlert className="size-32" />
            </div>
            <CardContent className="p-6 relative h-full flex flex-col justify-between">
              <div className="flex items-center gap-3 mb-6">
                <div className="size-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                  <ShieldAlert className="size-5" />
                </div>
                <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Anomali & Fraud</p>
              </div>
              <div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tighter">12 <span className="text-base text-slate-500 font-bold">Kasus</span></h3>
                <p className="text-xs font-bold text-slate-500 mt-1 mb-3">Menunggu Tinjauan Audit</p>
                <div className="flex items-center gap-1.5 text-red-700 text-[10px] font-bold bg-red-100 px-2 py-1 rounded-md w-fit uppercase tracking-widest">
                  <AlertCircle className="size-3" /> Rp 142.8M Tertahan
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* SECONDARY GRID: CROSS-FUNCTIONAL OVERVIEW */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
          
          {/* Main List: Unified Activities (Takes 2 cols) */}
          <Card className="lg:col-span-2 rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden flex flex-col">
            <CardHeader className="p-6 md:px-8 border-b border-slate-100 shrink-0">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg font-bold">Ringkasan Aktivitas Terkini</CardTitle>
                  <CardDescription className="text-xs font-medium mt-1">Gabungan data Marketplace, Logistik, dan Keuangan.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Badge 
                    onClick={() => setActiveTab("all")}
                    className={cn("cursor-pointer border-none px-3 py-1 font-bold", activeTab === "all" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200")}
                  >
                    Semua
                  </Badge>
                  <Badge 
                    onClick={() => setActiveTab("fraud")}
                    className={cn("cursor-pointer border-none px-3 py-1 font-bold", activeTab === "fraud" ? "bg-red-500 text-white" : "bg-red-50 text-red-500 hover:bg-red-100")}
                  >
                    Fraud Alerts
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <div className="divide-y divide-slate-100 p-2 flex-1">
              {[
                { type: "marketplace", title: "PO-2938 Disetujui (AI Nego)", desc: "PT Beras Unggul menyetujui harga Rp 11.500/kg", status: "Selesai", icon: Store, color: "violet", time: "5 mnt lalu", flag: "all" },
                { type: "logistics", title: "Keterlambatan Armada #TRX-9915", desc: "Deviasi rute terdeteksi di area Tanah Abang", status: "Investigasi", icon: Truck, color: "orange", time: "12 mnt lalu", flag: "all" },
                { type: "finance", title: "Pencairan Smart Contract (Rp 45M)", desc: "Validasi Gizi dan GPS selesai untuk 32 Vendor", status: "Tercairkan", icon: Landmark, color: "emerald", time: "28 mnt lalu", flag: "all" },
                { type: "fraud", title: "Anomali Porsi (Ghost Portion)", desc: "Dapur Ibu Budi: Selisih 50 porsi dari target", status: "Tertahan", icon: ShieldAlert, color: "red", time: "1 jam lalu", flag: "fraud" },
                { type: "reports", title: "Indeks Gizi Wilayah Jabar Keluar", desc: "Kepatuhan protein mencapai 94% hari ini", status: "Tervalidasi", icon: Activity, color: "blue", time: "2 jam lalu", flag: "all" },
              ].filter(item => activeTab === "all" || item.flag === activeTab).map((item, i) => (
                <div key={i} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 hover:bg-slate-50 transition-colors rounded-xl m-1 cursor-pointer group">
                  <div className="flex-1 flex gap-4 min-w-0">
                    <div className={cn(
                      "size-10 rounded-full flex items-center justify-center shrink-0 border",
                      `bg-${item.color}-50 border-${item.color}-100 text-${item.color}-600`
                    )}>
                      <item.icon className="size-5" />
                    </div>
                    <div className="min-w-0 py-0.5">
                      <p className="font-bold text-slate-900 text-sm truncate pr-4 group-hover:text-indigo-600 transition-colors">{item.title}</p>
                      <p className="text-[11px] font-medium text-slate-500 mt-1 truncate">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 shrink-0">
                    <p className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="size-3" /> {item.time}
                    </p>
                    <Badge className={cn(
                      "border-none text-[9px] uppercase font-bold tracking-widest px-2.5 py-1",
                      `bg-${item.color}-100 text-${item.color}-700`
                    )}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Ecosystem Health (1 col) */}
          <div className="space-y-6 flex flex-col h-full">
            {/* Security/AI Health */}
            <Card className="rounded-[24px] border-none bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-lg overflow-hidden relative shrink-0">
               <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:14px_24px]" />
               <CardContent className="p-6 relative z-10 flex items-center gap-4">
                 <div className="size-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/10 shrink-0">
                   <ShieldCheck className="size-6 text-emerald-400" />
                 </div>
                 <div>
                   <h3 className="text-sm font-bold mb-0.5">Sistem Pengawasan AI</h3>
                   <p className="text-xs font-medium text-slate-300">Status: <span className="text-emerald-400 font-bold">Optimal (99.9% Uptime)</span></p>
                 </div>
               </CardContent>
            </Card>

            {/* Micro Stats List */}
            <Card className="rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden flex-1">
              <CardHeader className="p-6 border-b border-slate-100">
                <CardTitle className="text-base font-bold">Kinerja Sistem</CardTitle>
              </CardHeader>
              <CardContent className="p-0 divide-y divide-slate-100">
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                      <Package className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Volume Transaksi</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">+12%</span>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Akurasi Gizi AI</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">98.5%</span>
                </div>
                <div className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-8 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                      <Activity className="size-4" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Kecepatan Logistik</span>
                  </div>
                  <span className="text-sm font-black text-slate-900">45 mnt rata-rata</span>
                </div>
              </CardContent>
            </Card>
          </div>

        </div>
      </div>
    </div>
  )
}
