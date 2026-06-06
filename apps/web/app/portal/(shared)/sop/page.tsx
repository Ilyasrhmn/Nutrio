"use client"

import * as React from "react"
import { 
  BookOpen, 
  Target, 
  Camera, 
  Timer, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Clock,
  Info,
  ChevronRight,
  HelpCircle,
  FileText
} from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Badge } from "@workspace/ui/components/badge"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"

export default function SOPPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* 1. Deep Teal Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <BookOpen className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> Digital Manual v2.0
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Pusat Panduan & Kepatuhan (SOP)</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Panduan teknis hulu ke hilir untuk memastikan operasional dapur berjalan tanpa kendala dan memenuhi standar BGN.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-4 shrink-0">
            <ShieldCheck className="size-5 text-emerald-400" />
            <div>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">Status Kepatuhan</p>
              <p className="text-sm font-bold text-emerald-400 mt-0.5">Wajib Diikuti</p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="penalty" className="space-y-8">
        <TabsList className="bg-white/60 backdrop-blur-xl border border-white/40 p-2 rounded-[24px] h-auto flex flex-wrap sm:flex-nowrap gap-2 shadow-lg shadow-teal-900/5 w-full">
          <TabsTrigger value="penalty" className="flex-1 rounded-full py-3.5 gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-transparent border-transparent transition-all font-bold text-xs uppercase tracking-widest text-slate-500">
            <Target className="size-4" />
            Kamus Pinalti
          </TabsTrigger>
          <TabsTrigger value="ai-photo" className="flex-1 rounded-full py-3.5 gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-transparent border-transparent transition-all font-bold text-xs uppercase tracking-widest text-slate-500">
            <Camera className="size-4" />
            Panduan Foto AI
          </TabsTrigger>
          <TabsTrigger value="flow" className="flex-1 rounded-full py-3.5 gap-2 data-[state=active]:bg-teal-600 data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:border-transparent border-transparent transition-all font-bold text-xs uppercase tracking-widest text-slate-500">
            <Timer className="size-4" />
            Alur Checkpoint
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Kamus Pinalti */}
        <TabsContent value="penalty" className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-none shadow-sm bg-white rounded-2xl ring-1 ring-slate-200/60 overflow-hidden">
              <CardHeader className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/50">
                <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-900">
                  <div className="size-10 bg-orange-100 text-orange-600 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="size-5" />
                  </div>
                  Kategori Pelanggaran Waktu
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 md:p-8 space-y-4">
                {[
                  { label: "Telat Ringan (1 - 15m)", point: "-2 Poin", color: "text-amber-700", bg: "bg-amber-50", border: "border-amber-200" },
                  { label: "Telat Sedang (16 - 30m)", point: "-5 Poin", color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-200" },
                  { label: "Telat Parah (> 30m)", point: "-10 Poin", color: "text-red-700", bg: "bg-red-50", border: "border-red-200" },
                  { label: "Lewat 4 Jam (Fatal)", point: "-50 Poin", color: "text-red-900", bg: "bg-red-100", border: "border-red-300" },
                ].map((item, i) => (
                  <div key={i} className={cn("flex items-center justify-between p-4 rounded-xl border transition-all hover:-translate-y-0.5", item.bg, item.border)}>
                    <p className="text-sm font-bold text-slate-800">{item.label}</p>
                    <Badge className={cn("font-black border-none text-xs px-3 py-1 shadow-sm", item.color, "bg-white")}>{item.point}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-2xl ring-1 ring-slate-200/60 overflow-hidden">
              <CardHeader className="p-6 md:p-8 border-b border-slate-50 bg-slate-50/50">
                <CardTitle className="text-lg font-bold flex items-center gap-3 text-slate-900">
                  <div className="size-10 bg-teal-100 text-teal-600 rounded-xl flex items-center justify-center">
                    <Flame className="size-5" />
                  </div>
                  Mekanisme Reward (Streak)
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 md:p-8 md:p-8 space-y-5">
                <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-100 space-y-3 relative overflow-hidden group hover:border-emerald-300 transition-colors">
                  <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Target className="size-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                    <p className="text-xs font-black text-emerald-800 uppercase tracking-widest">Bonus Vendor Gold</p>
                  </div>
                  <p className="text-sm text-emerald-900 leading-relaxed font-semibold relative z-10">
                    Pertahankan skor harian <span className="font-black bg-emerald-200/50 px-1 rounded">{'>'} 95 selama 5 hari berturut-turut</span> untuk mendapatkan kenaikan margin 1% pada Smart Contract hari berikutnya.
                  </p>
                </div>
                <div className="p-5 rounded-2xl bg-teal-50 border border-teal-100 space-y-3 relative overflow-hidden group hover:border-teal-300 transition-colors">
                  <div className="absolute -right-4 -top-4 opacity-10 group-hover:scale-110 transition-transform">
                    <Timer className="size-24" />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="size-2 bg-teal-500 rounded-full" />
                    <p className="text-xs font-black text-teal-800 uppercase tracking-widest">Daily Reset</p>
                  </div>
                  <p className="text-sm text-teal-900 leading-relaxed font-semibold relative z-10">
                    Skor harian akan kembali menjadi <span className="font-black bg-teal-200/50 px-1 rounded">100 Poin</span> setiap pukul 00:00 WIB agar vendor bisa memulai operasional baru dengan kondisi bersih.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert className="bg-red-50 border-red-200 shadow-sm p-6 rounded-2xl flex gap-4">
            <Lock className="size-6 text-red-600 shrink-0 mt-0.5" />
            <div>
              <AlertTitle className="text-xs font-black uppercase tracking-widest text-red-900 mb-1.5">Batas Kritis: 75 Poin</AlertTitle>
              <AlertDescription className="text-sm font-semibold text-red-800 leading-relaxed">
                Jika skor hari itu turun di bawah 75, Smart Contract pencairan dana akan <b>dibekukan otomatis</b> dan status berubah menjadi Manual Review oleh BGN.
              </AlertDescription>
            </div>
          </Alert>
        </TabsContent>

        {/* Tab 2: Panduan Foto AI */}
        <TabsContent value="ai-photo" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="border-none shadow-sm bg-white rounded-2xl ring-1 ring-emerald-200/60 overflow-hidden group">
              <CardContent className="p-0">
                <div className="p-6 bg-emerald-50/50 border-b border-emerald-100 flex items-center gap-3">
                  <CheckCircle2 className="size-6 text-emerald-600" />
                  <h3 className="text-lg font-black text-emerald-900">Contoh Foto BENAR ✅</h3>
                </div>
                <div className="p-6">
                  <div className="aspect-[4/3] bg-emerald-50 rounded-2xl border-4 border-emerald-100 overflow-hidden relative group-hover:border-emerald-300 transition-colors">
                    <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/5">
                      <Camera className="size-16 text-emerald-600/20" />
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm mt-4">
                    <p className="text-xs font-bold text-emerald-800 leading-relaxed text-center">
                      Seluruh bahan baku terlihat jelas, cahaya terang, dan difoto dari atas (Top-Down).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white rounded-2xl ring-1 ring-red-200/60 overflow-hidden group">
              <CardContent className="p-0">
                <div className="p-6 bg-red-50/50 border-b border-red-100 flex items-center gap-3">
                  <XCircle className="size-6 text-red-600" />
                  <h3 className="text-lg font-black text-red-900">Contoh Foto SALAH ❌</h3>
                </div>
                <div className="p-6">
                  <div className="aspect-[4/3] bg-red-50 rounded-2xl border-4 border-red-100 overflow-hidden relative group-hover:border-red-300 transition-colors">
                    <div className="absolute inset-0 flex items-center justify-center bg-red-500/5">
                      <Camera className="size-16 text-red-600/20" />
                    </div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-xl border border-red-100 shadow-sm mt-4">
                    <p className="text-xs font-bold text-red-800 leading-relaxed text-center">
                      Foto blur, bahan baku menumpuk, atau mencoba memfoto layar monitor (FRAUD DETECTED).
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-900 text-white border-none shadow-xl rounded-2xl overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <ShieldCheck className="size-48" />
            </div>
            <CardContent className="p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 relative z-10">
              <div className="size-24 bg-teal-500/20 rounded-full flex items-center justify-center shrink-0 border border-teal-500/30">
                <ShieldCheck className="size-12 text-teal-400" />
              </div>
              <div className="space-y-3 text-center md:text-left">
                <h4 className="text-2xl font-black tracking-tight text-white">Teknologi Computer Vision BGN</h4>
                <p className="text-sm text-slate-300 font-medium leading-relaxed max-w-3xl">
                  AI kami mampu menghitung estimasi berat bahan (kg) dan mendeteksi kelengkapan nutrisi (Nasi, Protein, Serat) secara instan. Pastikan pengambilan gambar dari sudut pandang atas (<strong className="text-white">Top-down View</strong>).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Alur Checkpoint */}
        <TabsContent value="flow" className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
          <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden p-8 md:p-12">
            <div className="relative space-y-12 before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-1 before:bg-slate-100">
              {[
                { id: 1, title: "Preparation & Validasi Bahan", time: "02:00 WIB", desc: "Vendor memfoto seluruh bahan baku. AI mencocokkan jumlah bahan dengan porsi yang akan dimasak." },
                { id: 2, title: "Portioning & QC Organoleptik", time: "05:00 - 06:30 WIB", desc: "Vendor mengisi checklist rasa/warna dan memfoto kotak makan sampel. Di sini Countdown 4 Jam dimulai!" },
                { id: 3, title: "Dispatch Armada", time: "07:30 WIB", desc: "Supir klik 'Berangkat'. GPS mulai memantau rute dan menghitung ETA ke sekolah tujuan." },
                { id: 4, title: "Handover & QC Sekolah", time: "Saat Tiba", desc: "Guru scan QR Code supir. Dana Smart Contract cair otomatis setelah verifikasi selesai." },
              ].map((step, i) => (
                <div key={i} className="relative pl-20 group">
                  <div className="absolute left-0 size-14 bg-white rounded-2xl border-4 border-slate-100 shadow-sm flex items-center justify-center font-black text-xl text-slate-300 group-hover:border-teal-500 group-hover:text-teal-600 transition-all z-10 group-hover:scale-110">
                    {step.id}
                  </div>
                  <div className="space-y-3 pt-0.5">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                      <h4 className="text-xl font-black text-slate-900 tracking-tight">{step.title}</h4>
                      <Badge className="bg-teal-50 text-teal-700 border-none font-bold text-[10px] px-3 py-1 uppercase tracking-widest">{step.time}</Badge>
                    </div>
                    <p className="text-base text-slate-600 font-medium leading-relaxed max-w-3xl">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Alert className="bg-amber-50 border-amber-200 shadow-sm p-6 rounded-2xl flex gap-5 items-start">
            <Timer className="size-8 text-amber-600 shrink-0 mt-1" />
            <div>
              <AlertTitle className="text-sm font-black uppercase tracking-widest text-amber-900 mb-2">ATURAN EMAS NO. 8: ZONA AMAN 4 JAM</AlertTitle>
              <AlertDescription className="text-sm font-bold text-amber-800 leading-relaxed">
                Makanan harus dikonsumsi dalam 4 jam setelah dimasak untuk menjaga standar keamanan pangan Dinkes. Sistem akan mengunci Checkpoint 4 (Handover) jika waktu melampaui batas ini.
              </AlertDescription>
            </div>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function Flame(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

function Lock(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
