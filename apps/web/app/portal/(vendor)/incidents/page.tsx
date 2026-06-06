"use client";

import * as React from "react";
import {
  Camera,
  ShieldAlert,
  MapPin,
  Clock,
  CheckCircle2,
  Info,
  Navigation,
  Loader2,
  ShieldCheck,
  AlertTriangle,
  Settings,
  Wifi,
  Cpu,
  Smartphone,
  Send,
  Upload,
  Truck,
  Zap,
  Phone,
  ChevronRight,
  History,
  Activity,
  MessageSquare
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@workspace/ui/components/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { Textarea } from "@workspace/ui/components/textarea";
import { cn } from "@workspace/ui/lib/utils";
import { Progress } from "@workspace/ui/components/progress";

export default function IncidentsPage() {
  const [opStep, setOpStep] = React.useState<"choice" | "camera" | "verifying" | "result">("choice");
  const [incidentType, setIncidentType] = React.useState<string>("");

  const [techStep, setTechStep] = React.useState<"idle" | "scanning" | "form" | "success">("idle");
  const [diagnostics, setDiagnostics] = React.useState({
    gps: "pending",
    camera: "pending",
    network: "pending",
    battery: "pending",
  });

  const runDiagnostics = () => {
    setTechStep("scanning");
    const stages = ["gps", "camera", "network", "battery"];
    stages.forEach((stage, index) => {
      setTimeout(() => {
          setDiagnostics((prev) => ({
            ...prev,
            [stage]: stage === "network" ? "warning" : "ok",
          }));
          if (index === stages.length - 1) {
            setTimeout(() => setTechStep("form"), 1500);
          }
        }, (index + 1) * 800);
    });
  };

  const handleOpCapture = () => {
    setOpStep("verifying");
    setTimeout(() => setOpStep("result"), 3000);
  };

  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* 1. Deep Teal Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldAlert className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-red-500/20 text-red-100 border border-red-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-red-400 animate-pulse mr-2 inline-block" /> Compliance Hub
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Pusat Kendali Insiden</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Laporkan kendala operasional atau teknis secara transparan dengan validasi otomatis BGN-AI.
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="operational" className="space-y-8">
        <TabsList className="bg-white/60 backdrop-blur-xl border border-white/40 p-2 rounded-[24px] h-auto w-full md:w-fit flex gap-2 shadow-lg shadow-teal-900/5 mx-auto md:mx-0">
          <TabsTrigger
            value="operational"
            className="flex-1 md:flex-none rounded-full py-3 px-8 gap-2.5 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-md data-[state=active]:border-transparent border-transparent font-extrabold text-sm transition-all"
          >
            <Truck className="size-4.5" />
            Kendala Lapangan
          </TabsTrigger>
          <TabsTrigger
            value="technical"
            className="flex-1 md:flex-none rounded-full py-3 px-8 gap-2.5 data-[state=active]:bg-white data-[state=active]:text-teal-700 data-[state=active]:shadow-md data-[state=active]:border-transparent border-transparent font-extrabold text-sm transition-all"
          >
            <Settings className="size-4.5" />
            Kendala Teknis
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Operational Incident */}
        <TabsContent
          value="operational"
          className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Card className="xl:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden min-h-[500px] flex flex-col bg-white ring-1 ring-slate-200/60">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Laporan Kendala Operasional</CardTitle>
                <CardDescription className="text-sm font-semibold text-slate-500 mt-1">
                  Gunakan kamera live untuk memvalidasi kendala lapangan Anda.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-8 flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full">
              {opStep === "choice" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 w-full">
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-slate-500">
                      Pilih Jenis Kendala
                    </label>
                    <Select onValueChange={setIncidentType}>
                      <SelectTrigger className="h-14 rounded-xl border-slate-200 text-sm font-bold bg-slate-50 focus:bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all hover:border-teal-400">
                        <SelectValue placeholder="Pilih situasi yang sesuai..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl p-1">
                        <SelectItem value="ban-bocor" className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Ban Kendaraan Bocor (Flat Tire)</SelectItem>
                        <SelectItem value="mesin-mogok" className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Mesin Kendaraan Mogok</SelectItem>
                        <SelectItem value="kecelakaan" className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Kecelakaan Lalu Lintas</SelectItem>
                        <SelectItem value="macet-total" className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Macet Total (Bencana/Demo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => setOpStep("camera")}
                    disabled={!incidentType}
                    className="w-full h-14 rounded-xl text-sm font-bold shadow-md bg-teal-600 hover:bg-teal-700 text-white gap-2 transition-all"
                  >
                    Buka Kamera Validasi AI
                    <Camera className="size-5" />
                  </Button>
                </div>
              )}

              {opStep === "camera" && (
                <div className="space-y-6 animate-in zoom-in-95 w-full">
                  <div className="relative aspect-[4/3] bg-slate-900 rounded-2xl overflow-hidden shadow-inner group ring-4 ring-slate-100">
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <Camera className="size-20 text-white" />
                    </div>
                    <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-md px-4 py-1.5 rounded-lg flex items-center gap-2 shadow-sm">
                      <div className="size-2 bg-white rounded-full animate-pulse" />
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">Live</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => setOpStep("choice")}
                      className="w-full text-slate-600 font-bold h-14 rounded-xl border-slate-200 hover:bg-slate-50"
                    >
                      Batal
                    </Button>
                    <Button
                      onClick={handleOpCapture}
                      className="w-full h-14 rounded-xl text-sm font-bold shadow-md bg-red-600 hover:bg-red-700 text-white gap-2"
                    >
                      Kirim Bukti Foto
                    </Button>
                  </div>
                </div>
              )}

              {opStep === "verifying" && (
                <div className="flex flex-col items-center justify-center space-y-6 text-center py-12">
                  <div className="relative">
                    <div className="absolute inset-0 border-4 border-teal-100 rounded-full animate-ping opacity-75"></div>
                    <div className="size-24 bg-teal-50 rounded-full flex items-center justify-center relative z-10">
                      <Loader2 className="size-10 text-teal-600 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-slate-900">Menganalisis Bukti...</h3>
                    <p className="text-sm font-semibold text-slate-500">AI sedang memvalidasi foto & koordinat GPS</p>
                  </div>
                </div>
              )}

              {opStep === "result" && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 text-center py-8 w-full max-w-sm mx-auto">
                  <div className="size-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm ring-4 ring-emerald-100">
                    <CheckCircle2 className="size-12" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-slate-900">Laporan Sah (Verified)</h3>
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left">
                      <p className="text-sm text-slate-600 font-medium leading-relaxed text-center">
                        Pinalti keterlambatan Anda telah disesuaikan oleh sistem menjadi <span className="font-bold text-emerald-600 px-1">-2 Poin</span> (Keringanan Darurat).
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={() => setOpStep("choice")}
                    className="w-full h-14 rounded-xl font-bold text-sm bg-teal-900 text-white hover:bg-teal-950 shadow-md transition-all"
                  >
                    Kembali ke Dashboard
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side Info for Op */}
          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-2 text-slate-700">
                  <ShieldAlert className="size-5" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest">
                    SOP Pelaporan
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm leading-relaxed text-slate-600 font-medium">
                  Laporan darurat wajib dilakukan maksimal <b>15 menit</b> setelah kendala terjadi di lapangan. Sistem BGN-AI secara otomatis memverifikasi kecocokan visual (foto) dengan koordinat GPS Anda.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-red-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <CardHeader className="p-6 border-b border-red-50 bg-red-50/50">
                <div className="flex items-center gap-2 text-red-700">
                  <AlertTriangle className="size-5" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest">
                    Kontak Darurat BGN
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                      <Phone className="size-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">Hotline Pusat</p>
                      <p className="text-[10px] text-slate-500 font-semibold">1-500-BGN (24/7)</p>
                    </div>
                  </div>
                  <Button size="sm" variant="outline" className="h-8 rounded-lg text-xs font-bold border-slate-200">Hubungi</Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center gap-2 text-slate-700">
                  <History className="size-5" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest">
                    Riwayat Laporan Terakhir
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Ban Kendaraan Bocor</p>
                        <p className="text-[10px] font-semibold text-slate-500">12 Feb 2026 • Verified</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-400" />
                  </div>
                  <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="size-2 rounded-full bg-emerald-500" />
                      <div>
                        <p className="text-xs font-bold text-slate-900">Mesin Mogok</p>
                        <p className="text-[10px] font-semibold text-slate-500">05 Jan 2026 • Verified</p>
                      </div>
                    </div>
                    <ChevronRight className="size-4 text-slate-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Technical Incident */}
        <TabsContent
          value="technical"
          className="grid grid-cols-1 xl:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Card className="xl:col-span-2 border-none shadow-sm rounded-2xl overflow-hidden min-h-[500px] flex flex-col bg-white ring-1 ring-slate-200/60">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8 flex flex-col md:flex-row justify-between items-start md:items-center">
              <div>
                <CardTitle className="text-xl font-bold text-slate-900">Laporan Kendala Aplikasi (IT)</CardTitle>
                <CardDescription className="text-sm font-semibold text-slate-500 mt-1">
                  Sistem diagnostik akan memeriksa kondisi perangkat keras (hardware/koneksi) Anda secara otomatis.
                </CardDescription>
              </div>
            </CardHeader>

            <CardContent className="p-8 flex-1 flex flex-col items-center justify-center">
              {techStep === "idle" && (
                <div className="flex flex-col items-center justify-center space-y-8 flex-1 max-w-md mx-auto w-full">
                  <div className="size-24 bg-teal-50 border border-teal-100 rounded-full flex items-center justify-center shadow-sm">
                    <Smartphone className="size-12 text-teal-600" />
                  </div>
                  <div className="text-center space-y-3">
                    <h3 className="text-2xl font-bold text-slate-900">Cek Kesehatan Perangkat</h3>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">
                      Kami perlu memeriksa modul GPS, Camera API, dan Koneksi internet sebelum Anda membuat laporan bug/error.
                    </p>
                  </div>
                  <Button
                    onClick={runDiagnostics}
                    className="w-full h-14 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white gap-2 shadow-md transition-all"
                  >
                    Jalankan Diagnostik AI
                    <Cpu className="size-5" />
                  </Button>
                </div>
              )}

              {techStep === "scanning" && (
                <div className="space-y-10 flex-1 flex flex-col justify-center max-w-md mx-auto w-full py-8">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {[
                      { id: "gps", label: "Sensor GPS", icon: Navigation },
                      { id: "camera", label: "Camera API", icon: Camera },
                      { id: "network", label: "Internet Speed", icon: Wifi },
                      { id: "battery", label: "System Health", icon: Smartphone },
                    ].map((s) => (
                      <div key={s.id} className="p-5 rounded-xl bg-slate-50 border border-slate-100 flex flex-col items-center gap-3 text-center transition-all">
                        <s.icon className={cn("size-6 mb-1", diagnostics[s.id as keyof typeof diagnostics] === "ok" ? "text-emerald-500" : diagnostics[s.id as keyof typeof diagnostics] === "warning" ? "text-amber-500" : "text-slate-300")} />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{s.label}</span>
                        <div>
                          {diagnostics[s.id as keyof typeof diagnostics] === "pending" ? (
                            <Loader2 className="size-4 text-slate-300 animate-spin" />
                          ) : diagnostics[s.id as keyof typeof diagnostics] === "ok" ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-none px-2 h-5 text-[9px]">PASSED</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-none px-2 h-5 text-[9px]">WARNING</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-3">
                    <Progress value={75} className="h-2 [&>div]:bg-teal-500 bg-slate-100" />
                    <p className="text-center text-[10px] font-bold uppercase text-teal-600 animate-pulse tracking-widest">
                      Scanning Hardware Status...
                    </p>
                  </div>
                </div>
              )}

              {techStep === "form" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 flex-1 w-full max-w-2xl">
                  <Alert className="bg-amber-50 border-amber-200 p-5 rounded-2xl flex gap-4 shadow-sm">
                    <Wifi className="size-6 text-amber-600 shrink-0" />
                    <div>
                      <AlertTitle className="text-[11px] font-bold uppercase text-amber-900 tracking-widest">Hasil Diagnostik: Koneksi Lemah</AlertTitle>
                      <AlertDescription className="text-sm text-amber-800 font-semibold mt-1.5 leading-relaxed">
                        Sistem mendeteksi latensi internet Anda sangat tinggi. Ini kemungkinan besar penyebab aplikasi gagal mengunggah foto.
                      </AlertDescription>
                    </div>
                  </Alert>

                  <div className="space-y-6 bg-slate-50 p-6 sm:p-8 rounded-2xl border border-slate-100 mt-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Detail Error yang Anda Alami
                      </label>
                      <Textarea
                        placeholder="Ceritakan detail kronologinya... (Contoh: Saya tidak bisa klik tombol kirim foto di Tahap 2, hanya loading muter-muter terus)"
                        className="rounded-xl min-h-[120px] border-slate-200 text-sm font-medium bg-white focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 p-4"
                      />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Lampirkan Screenshot (Opsional)
                      </label>
                      <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:bg-white hover:border-teal-500 cursor-pointer transition-all bg-slate-50/50">
                        <div className="size-12 rounded-full bg-white flex items-center justify-center shadow-sm">
                          <Upload className="size-5 text-teal-600" />
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-slate-700">Pilih gambar screenshot</p>
                          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mt-1">PNG, JPG up to 5MB</p>
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setTechStep("success")}
                      className="w-full h-14 rounded-xl font-bold shadow-md bg-teal-600 hover:bg-teal-700 text-white gap-2 mt-4 text-sm"
                    >
                      Kirim Tiket Laporan Bug
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {techStep === "success" && (
                <div className="flex flex-col items-center justify-center space-y-6 flex-1 py-10 text-center animate-in zoom-in-95 max-w-md mx-auto w-full">
                  <div className="size-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-sm ring-4 ring-emerald-100">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-2xl font-bold text-slate-900">Tiket Terkirim ke Helpdesk</h3>
                    <p className="text-sm text-slate-600 font-semibold leading-relaxed">
                      ID Tiket Referensi: <span className="font-bold text-slate-900">#TCH-2026-991</span><br/>Tim Support IT kami akan segera mengecek status log perangkat Anda.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setTechStep("idle")}
                    className="w-full rounded-xl h-12 mt-4 font-bold border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  >
                    Buat Laporan Lain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side Info for Tech */}
          <div className="space-y-6">
            <Card className="border-none shadow-md rounded-[24px] bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden hover:-translate-y-1 transition-all duration-300">
              <CardHeader className="p-6 border-b border-slate-700/50">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="size-5 text-teal-400" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-200">
                    Kebijakan Privasi & Keamanan
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-sm leading-relaxed text-slate-300 font-medium">
                  Data diagnostik perangkat keras Anda akan <b>dienkripsi ujung-ke-ujung (E2E)</b>. Data tersebut murni hanya digunakan oleh teknisi untuk membantu penyelesaian bug aplikasi dan tidak akan pernah digunakan untuk melacak aktivitas pribadi Anda di luar jam operasional.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl shadow-teal-900/5 rounded-[24px] hover:-translate-y-1 transition-all duration-300 overflow-hidden">
              <CardHeader className="p-6 border-b border-slate-50 bg-slate-50/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-700">
                    <Activity className="size-5" />
                    <CardTitle className="text-xs font-bold uppercase tracking-widest">
                      Live IT Support
                    </CardTitle>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">Online</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Tim teknisi sedang bersiaga. Rata-rata waktu respon saat ini adalah <span className="font-bold text-slate-900">3 menit</span>.
                </p>
                <Button className="w-full bg-slate-900 text-white hover:bg-slate-800 rounded-xl h-10 text-xs font-bold gap-2">
                  <MessageSquare className="size-4" />
                  Live Chat IT
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
