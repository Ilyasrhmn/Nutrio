"use client"

import React, { useState } from "react"
import { 
  TrendingUp, 
  ShieldAlert, 
  MapPin, 
  ArrowUpRight, 
  DollarSign, 
  FileText,
  Activity,
  AlertCircle,
  Download,
  Wallet,
  ChevronRight,
  MoreVertical,
  CheckCircle2,
  Clock,
  LayoutDashboard
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

export function AdminDashboard() {
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-[#F0F3F7] animate-in fade-in duration-700 pb-12">
      
      {/* VIBRANT HERO SECTION */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 pt-12 pb-32 px-6 lg:px-12 overflow-hidden">
        {/* Abstract Background Patterns */}
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
                  Oversight Mode
                </Badge>
              </div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Command Center Nasional
              </h1>
              <p className="text-slate-300 font-medium text-sm max-w-2xl">
                Pemantauan real-time alokasi dana APBN, status logistik, dan mitigasi fraud untuk Program Makan Bergizi Gratis seluruh Indonesia.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Button className="h-12 px-6 bg-white text-slate-900 hover:bg-slate-50 shadow-lg shadow-black/20 font-bold rounded-2xl gap-2 transition-transform active:scale-95">
                <Download className="size-4" />
                Export Laporan
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT (Overlapping Hero) */}
      <div className="relative z-20 max-w-7xl mx-auto px-6 lg:px-12 -mt-20 space-y-8">
        
        {/* Top Main Stats (3 Cols Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Wallet Hero Card */}
          <Card className="md:col-span-2 rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative">
            <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            
            <CardContent className="p-6 md:p-8 relative h-full flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="size-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/10">
                    <Wallet className="size-6 text-indigo-100" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-indigo-200 uppercase tracking-widest">Anggaran MBG 2026</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <CheckCircle2 className="size-3.5 text-emerald-300" />
                      <span className="text-[10px] font-semibold text-indigo-100">APBN Secured</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h2 className="text-4xl md:text-5xl font-black tracking-tighter">
                  Rp 71.40 <span className="text-2xl md:text-3xl text-indigo-200 font-bold">Triliun</span>
                </h2>
                
                <div className="mt-8 bg-black/10 rounded-2xl p-4 backdrop-blur-sm border border-white/10">
                  <div className="flex justify-between items-end mb-2">
                    <div>
                      <p className="text-[10px] font-bold text-indigo-200 uppercase tracking-widest">Penyerapan Nasional</p>
                      <p className="text-sm font-bold text-white mt-0.5">Rp 10.2 Triliun (14%)</p>
                    </div>
                    <Badge className="bg-emerald-500/20 text-emerald-200 border-none font-bold px-2 py-0.5 text-[9px] uppercase tracking-widest">
                      On Track
                    </Badge>
                  </div>
                  <Progress value={14} className="h-2.5 bg-white/10 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-300" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secondary Stats */}
          <div className="flex flex-col gap-6">
            {/* Compliance Score */}
            <Card className="flex-1 rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 bg-white">
              <CardContent className="p-6 md:p-8 flex flex-col justify-center h-full">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                    <Activity className="size-5" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Indeks Kepatuhan</p>
                </div>
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-black text-slate-900 tracking-tight">92.4</h3>
                  <span className="text-sm font-bold text-slate-400 mb-1">/ 100</span>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-600 text-[10px] font-bold mt-3 bg-emerald-50 w-fit px-2.5 py-1 rounded-md uppercase tracking-widest">
                  <TrendingUp className="size-3.5" /> +1.2% vs Bulan Lalu
                </div>
              </CardContent>
            </Card>

            {/* Fraud/Escrow Alert */}
            <Card className="flex-1 rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 bg-red-50 relative overflow-hidden group">
               <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 opacity-[0.03] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <ShieldAlert className="size-40 text-red-900" />
              </div>
              <CardContent className="p-6 md:p-8 relative h-full flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div className="size-10 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
                    <ShieldAlert className="size-5" />
                  </div>
                  <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Dana Tertahan (Fraud)</p>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight">Rp 142.8 <span className="text-xl text-slate-500 font-bold">M</span></h3>
                <p className="text-[10px] font-bold text-red-700 mt-3 flex items-center gap-1.5 bg-red-100 w-fit px-2.5 py-1 rounded-md">
                  <AlertCircle className="size-3.5" /> 12 Vendor Investigasi
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Fraud Queue Table (Takes up 2 columns) */}
          <Card className="lg:col-span-2 rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden">
            <div className="flex items-center justify-between p-6 md:px-8 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Antrian Mitigasi Fraud</h3>
                <p className="text-xs font-medium text-slate-500 mt-0.5">Sistem AI mendeteksi anomali pada vendor berikut.</p>
              </div>
              <Button variant="ghost" className="text-indigo-600 font-bold text-sm hover:bg-indigo-50 rounded-xl px-4">
                Lihat Semua
              </Button>
            </div>
            
            <div className="divide-y divide-slate-100 p-2">
              {[
                { region: "Bogor, Jawa Barat", vendor: "Catering Berkah Nusantara", anomaly: "Ghost Portion (F3.1) - Selisih 50 Porsi", risk: "CRITICAL", color: "red", time: "10 mnt lalu" },
                { region: "Medan, Sumatera Utara", vendor: "UD Maju Jaya Sukses", anomaly: "Recycled Photo (F3.4) - Identik dgn kemarin", risk: "HIGH", color: "orange", time: "45 mnt lalu" },
                { region: "Surabaya, Jawa Timur", vendor: "Dapur Rakyat Sejahtera", anomaly: "Price Mark-up (F2.1) - Telur +15% HET", risk: "MEDIUM", color: "amber", time: "2 jam lalu" },
                { region: "Sleman, DI Yogyakarta", vendor: "Dapur Ibu Budi", anomaly: "Location Spoof (F1.2) - GPS bergeser 2km", risk: "MEDIUM", color: "amber", time: "3 jam lalu" },
                { region: "Bandung, Jawa Barat", vendor: "CV Pangan Sehat", anomaly: "Late Delivery (T1.1) - Telat >30 mnt", risk: "LOW", color: "blue", time: "5 jam lalu" },
              ].map((item, i) => (
                <div 
                  key={i} 
                  className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:px-6 transition-colors cursor-pointer rounded-xl overflow-hidden m-1",
                    hoveredRow === i ? "bg-slate-50" : "bg-transparent"
                  )}
                  onMouseEnter={() => setHoveredRow(i)}
                  onMouseLeave={() => setHoveredRow(null)}
                >
                  <div className="flex-1 flex gap-4 min-w-0">
                    <div className={cn(
                      "size-10 rounded-full flex items-center justify-center shrink-0 border",
                      `bg-${item.color}-50 border-${item.color}-100 text-${item.color}-600 font-bold text-xs`
                    )}>
                      #{i+1}
                    </div>
                    <div className="min-w-0 py-0.5">
                      <p className="font-bold text-slate-900 text-sm truncate pr-4 group-hover:text-indigo-600 transition-colors">{item.vendor}</p>
                      <p className="text-[10px] font-medium text-slate-500 mt-1 flex items-center gap-1.5 truncate">
                        <MapPin className="size-3 text-slate-400 shrink-0" /> {item.region}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0 mt-3 sm:mt-0 sm:px-4 py-0.5">
                    <p className="text-xs font-bold text-slate-700 truncate">{item.anomaly}</p>
                    <p className="text-[10px] font-semibold text-slate-400 mt-1 flex items-center gap-1">
                      <Clock className="size-3" /> {item.time}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 mt-3 sm:mt-0 shrink-0">
                    <Badge className={cn(
                      "border-none text-[9px] uppercase font-bold tracking-widest px-3 py-1",
                      item.risk === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                      item.risk === 'HIGH' ? 'bg-orange-100 text-orange-700' :
                      item.risk === 'MEDIUM' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                    )}>
                      {item.risk}
                    </Badge>
                    <div className={cn(
                      "size-8 rounded-full flex items-center justify-center transition-all",
                      hoveredRow === i ? "bg-white shadow-sm text-slate-900 border border-slate-200" : "text-slate-300"
                    )}>
                      <ChevronRight className="size-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Audit Log (Vertical Timeline) */}
          <Card className="rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden flex flex-col">
            <CardHeader className="p-6 md:px-8 border-b border-slate-100 shrink-0">
              <CardTitle className="text-lg font-bold">System Audit Trail</CardTitle>
              <CardDescription className="text-xs font-medium mt-1">Aktivitas sistem & AI otomatis.</CardDescription>
            </CardHeader>

            <CardContent className="p-6 md:p-8 bg-slate-900 flex-1 relative overflow-hidden flex flex-col justify-between">
              {/* Grid background effect */}
              <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
              
              <div className="relative z-10 space-y-6">
                {[
                  { act: "Pencairan Dana Tahap 2", user: "Admin_Keuangan", time: "2 mnt lalu", type: "finance" },
                  { act: "Pembekuan Akun Vendor #082", user: "AI_Compliance", time: "15 mnt lalu", type: "security" },
                  { act: "Verifikasi Audit Jabar", user: "Inspektur_01", time: "30 mnt lalu", type: "audit" },
                  { act: "Update Juknis Gizi v3.1", user: "Admin_BGN", time: "1 jam lalu", type: "system" },
                ].map((log, i) => (
                  <div key={i} className="flex gap-4 relative">
                    {/* Timeline connecting line */}
                    {i !== 3 && (
                      <div className="absolute left-2.5 top-6 bottom-[-24px] w-px bg-slate-800" />
                    )}
                    
                    <div className="relative mt-1">
                      <div className={cn(
                        "size-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow-sm z-10",
                        log.type === 'finance' ? "bg-emerald-500" :
                        log.type === 'security' ? "bg-red-500" :
                        log.type === 'audit' ? "bg-blue-500" : "bg-indigo-500"
                      )}>
                        <div className="size-1.5 bg-white rounded-full" />
                      </div>
                    </div>
                    
                    <div className="space-y-1 pb-1">
                      <p className="text-xs font-bold text-slate-100 leading-tight">{log.act}</p>
                      <p className="text-[10px] font-medium text-slate-500">
                        Oleh <span className="text-slate-300 font-bold">{log.user}</span> • {log.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <Button className="w-full mt-6 bg-white/10 hover:bg-white/20 border border-white/5 text-white font-bold rounded-xl h-11 text-xs gap-2 backdrop-blur-sm relative z-10 transition-colors">
                <FileText className="size-4" />
                Unduh Log Lengkap (.CSV)
              </Button>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
