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
    <div className="p-8 space-y-8 bg-background max-w-5xl mx-auto">
      {/* Header */}
      <div className="space-y-1">
        <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
          Pusat Panduan & Kepatuhan (SOP)
          <Badge className="bg-primary/10 text-primary border-none text-[10px] font-black px-2 h-5 uppercase">Digital Manual v2.0</Badge>
        </h2>
        <p className="text-muted-foreground text-sm font-medium italic">Panduan teknis hulu ke hilir untuk memastikan operasional vendor berjalan tanpa kendala.</p>
      </div>

      <Tabs defaultValue="penalty" className="space-y-6">
        <TabsList className="bg-slate-100 p-1 rounded-2xl h-auto flex flex-wrap sm:flex-nowrap gap-1">
          <TabsTrigger value="penalty" className="flex-1 rounded-xl py-3 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold text-xs uppercase tracking-widest">
            <Target className="size-4" />
            Kamus Pinalti
          </TabsTrigger>
          <TabsTrigger value="ai-photo" className="flex-1 rounded-xl py-3 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold text-xs uppercase tracking-widest">
            <Camera className="size-4" />
            Panduan Foto AI
          </TabsTrigger>
          <TabsTrigger value="flow" className="flex-1 rounded-xl py-3 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all font-bold text-xs uppercase tracking-widest">
            <Timer className="size-4" />
            Alur Checkpoint
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Kamus Pinalti */}
        <TabsContent value="penalty" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <AlertTriangle className="size-4 text-orange-500" />
                  Kategori Pelanggaran Waktu
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Telat Ringan (1 - 15m)", point: "-2 Poin", color: "text-amber-600", bg: "bg-amber-50" },
                  { label: "Telat Sedang (16 - 30m)", point: "-5 Poin", color: "text-orange-600", bg: "bg-orange-50" },
                  { label: "Telat Parah (> 30m)", point: "-10 Poin", color: "text-red-600", bg: "bg-red-50" },
                  { label: "Lewat 4 Jam (Fatal)", point: "-50 Poin", color: "text-red-700", bg: "bg-red-100" },
                ].map((item, i) => (
                  <div key={i} className={cn("flex items-center justify-between p-3 rounded-xl border border-border/50", item.bg)}>
                    <p className="text-xs font-bold text-slate-700">{item.label}</p>
                    <Badge className={cn("font-black border-none", item.color, item.bg)}>{item.point}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Flame className="size-4 text-orange-500" />
                  Mekanisme Reward (Streak)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100 space-y-2">
                  <p className="text-xs font-black text-emerald-700 uppercase tracking-widest">Bonus Vendor Gold</p>
                  <p className="text-[11px] text-emerald-800 leading-relaxed font-medium">
                    Pertahankan skor harian <b>{'>'} 95 selama 5 hari berturut-turut</b> untuk mendapatkan kenaikan margin 1% pada Smart Contract hari berikutnya.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 space-y-2">
                  <p className="text-xs font-black text-blue-700 uppercase tracking-widest">Daily Reset</p>
                  <p className="text-[11px] text-blue-800 leading-relaxed font-medium">
                    Skor harian akan kembali menjadi <b>100 Poin</b> setiap pukul 00:00 WIB agar vendor bisa memulai operasional baru dengan kondisi bersih.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <Alert variant="destructive" className="bg-red-50 border-red-100">
            <Lock className="size-4" />
            <AlertTitle className="text-xs font-black uppercase tracking-widest">Batas Kritis: 75 Poin</AlertTitle>
            <AlertDescription className="text-xs font-medium text-red-800">
              Jika skor hari itu turun di bawah 75, Smart Contract pencairan dana akan <b>dibekukan otomatis</b> dan status berubah menjadi Manual Review oleh BGN.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Tab 2: Panduan Foto AI */}
        <TabsContent value="ai-photo" className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <CheckCircle2 className="size-5 text-emerald-500" />
                Contoh Foto BENAR ✅
              </h3>
              <div className="aspect-video bg-slate-100 rounded-3xl border-4 border-emerald-500/20 overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/5 group-hover:bg-transparent transition-all">
                  <Camera className="size-12 text-emerald-500 opacity-40" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-emerald-100">
                  <p className="text-[10px] font-bold text-emerald-700 leading-tight">Seluruh bahan baku terlihat jelas, cahaya terang, dan tidak ada objek yang menutupi frame.</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <XCircle className="size-5 text-red-500" />
                Contoh Foto SALAH ❌
              </h3>
              <div className="aspect-video bg-slate-100 rounded-3xl border-4 border-red-500/20 overflow-hidden relative group">
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/5">
                  <Camera className="size-12 text-red-500 opacity-40" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 bg-white/90 backdrop-blur-md p-3 rounded-xl border border-red-100">
                  <p className="text-[10px] font-bold text-red-700 leading-tight">Foto blur, bahan baku menumpuk, atau mencoba memfoto layar monitor (FRAUD DETECTED).</p>
                </div>
              </div>
            </div>
          </div>

          <Card className="bg-slate-900 text-white border-none rounded-[32px] overflow-hidden">
            <CardContent className="p-8 flex flex-col md:flex-row items-center gap-8">
              <div className="size-20 bg-primary/20 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="size-10 text-primary" />
              </div>
              <div className="space-y-2 text-center md:text-left">
                <h4 className="text-xl font-black tracking-tight">Teknologi Computer Vision BGN</h4>
                <p className="text-sm text-slate-400 font-medium leading-relaxed">
                  AI kami mampu menghitung estimasi berat bahan (kg) dan mendeteksi kelengkapan nutrisi (Nasi, Protein, Serat) secara instan. Pastikan pengambilan gambar dari sudut pandang atas (*Top-down View*).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab 3: Alur Checkpoint */}
        <TabsContent value="flow" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
          <div className="relative space-y-8 before:absolute before:left-[27px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
            {[
              { id: 1, title: "Preparation & Validasi Bahan", time: "02:00 WIB", desc: "Vendor memfoto seluruh bahan baku. AI mencocokkan jumlah bahan dengan porsi yang akan dimasak." },
              { id: 2, title: "Portioning & QC Organoleptik", time: "05:00 - 06:30 WIB", desc: "Vendor mengisi checklist rasa/warna dan memfoto kotak makan sampel. Di sini Countdown 4 Jam dimulai!" },
              { id: 3, title: "Dispatch Armada", time: "07:30 WIB", desc: "Supir klik 'Berangkat'. GPS mulai memantau rute dan menghitung ETA ke sekolah tujuan." },
              { id: 4, title: "Handover & QC Sekolah", time: "Saat Tiba", desc: "Guru scan QR Code supir. Dana Smart Contract cair otomatis setelah verifikasi selesai." },
            ].map((step, i) => (
              <div key={i} className="relative pl-16 group">
                <div className="absolute left-0 size-14 bg-white rounded-2xl border-2 border-slate-100 shadow-sm flex items-center justify-center font-black text-slate-400 group-hover:border-primary group-hover:text-primary transition-all z-10">
                  {step.id}
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{step.title}</h4>
                    <Badge variant="outline" className="text-[10px] font-bold border-slate-200">{step.time}</Badge>
                  </div>
                  <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <Alert className="bg-amber-50 border-amber-200 py-6 px-8 rounded-[24px]">
            <Timer className="size-6 text-amber-600" />
            <div className="ml-4">
              <AlertTitle className="text-sm font-black uppercase tracking-widest text-amber-900">ATURAN EMAS NO. 8: ZONA AMAN 4 JAM</AlertTitle>
              <AlertDescription className="text-sm font-medium text-amber-800 leading-relaxed mt-1">
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
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  )
}

function Lock(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}
