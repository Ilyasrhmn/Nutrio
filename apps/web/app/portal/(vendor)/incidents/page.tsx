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
  // Operational State
  const [opStep, setOpStep] = React.useState<
    "choice" | "camera" | "verifying" | "result"
  >("choice");
  const [incidentType, setIncidentType] = React.useState<string>("");

  // Technical State
  const [techStep, setTechStep] = React.useState<
    "idle" | "scanning" | "form" | "success"
  >("idle");
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
      setTimeout(
        () => {
          setDiagnostics((prev) => ({
            ...prev,
            [stage]: stage === "network" ? "warning" : "ok",
          }));
          if (index === stages.length - 1) {
            setTimeout(() => setTechStep("form"), 1000);
          }
        },
        (index + 1) * 800,
      );
    });
  };

  const handleOpCapture = () => {
    setOpStep("verifying");
    setTimeout(() => setOpStep("result"), 3000);
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-6xl mx-auto animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
            Pusat Kendali Insiden AI
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 font-bold px-2 h-5 text-[9px] uppercase">
              Compliance Hub
            </Badge>
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Laporkan kendala operasional atau teknis secara transparan dengan validasi otomatis.
          </p>
        </div>
      </div>

      <Tabs defaultValue="operational" className="space-y-6">
        <TabsList className="bg-white border border-slate-200/60 p-1 rounded-xl h-auto w-full md:w-fit flex gap-1 shadow-sm">
          <TabsTrigger
            value="operational"
            className="flex-1 md:flex-none rounded-lg py-2.5 px-6 gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-none font-bold text-xs"
          >
            <Truck className="size-4" />
            Kendala Operasional
          </TabsTrigger>
          <TabsTrigger
            value="technical"
            className="flex-1 md:flex-none rounded-lg py-2.5 px-6 gap-2 data-[state=active]:bg-slate-100 data-[state=active]:text-slate-900 data-[state=active]:shadow-none font-bold text-xs"
          >
            <Settings className="size-4" />
            Kendala Teknis
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Operational Incident */}
        <TabsContent
          value="operational"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Card className="lg:col-span-2 border-slate-200/60 shadow-sm rounded-xl overflow-hidden min-h-[500px] flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-bold text-slate-900">Laporan Masalah Lapangan</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Gunakan kamera live untuk memvalidasi kendala pengiriman Anda.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 flex-1 flex flex-col justify-center max-w-xl mx-auto w-full">
              {opStep === "choice" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                      Pilih Jenis Kendala
                    </label>
                    <Select onValueChange={setIncidentType}>
                      <SelectTrigger className="h-12 rounded-lg border-slate-200 text-sm font-semibold bg-white focus:ring-primary/20">
                        <SelectValue placeholder="Pilih Masalah Lapangan..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ban-bocor">Ban Kendaraan Bocor (Flat Tire)</SelectItem>
                        <SelectItem value="mesin-mogok">Mesin Kendaraan Mogok</SelectItem>
                        <SelectItem value="kecelakaan">Kecelakaan Lalu Lintas</SelectItem>
                        <SelectItem value="macet-total">Macet Total (Bencana/Demo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => setOpStep("camera")}
                    disabled={!incidentType}
                    className="w-full h-12 rounded-lg text-sm font-bold shadow-sm gap-2"
                  >
                    Buka Kamera Validasi AI
                    <Camera className="size-4" />
                  </Button>
                </div>
              )}

              {opStep === "camera" && (
                <div className="space-y-6 animate-in zoom-in-95">
                  <div className="relative aspect-[4/3] bg-slate-900 rounded-xl overflow-hidden shadow-inner group">
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <Camera className="size-16 text-white" />
                    </div>
                    <div className="absolute top-4 left-4 bg-red-600/90 backdrop-blur-sm px-3 py-1 rounded-md flex items-center gap-2">
                      <div className="size-1.5 bg-white rounded-full animate-pulse" />
                      <p className="text-[10px] font-bold text-white uppercase tracking-widest">Live</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleOpCapture}
                    className="w-full h-12 rounded-lg text-sm font-bold shadow-sm bg-red-600 hover:bg-red-700 text-white gap-2"
                  >
                    Kirim Bukti Foto
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => setOpStep("choice")}
                    className="w-full text-slate-500 font-bold h-10"
                  >
                    Batal
                  </Button>
                </div>
              )}

              {opStep === "verifying" && (
                <div className="flex flex-col items-center justify-center space-y-6 text-center py-10">
                  <Loader2 className="size-12 text-primary animate-spin" />
                  <h3 className="text-lg font-bold text-slate-900">
                    AI Menganalisis Visual & GPS...
                  </h3>
                </div>
              )}

              {opStep === "result" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 text-center py-8">
                  <div className="size-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-bold text-slate-900">Laporan Operasional Sah</h3>
                    <p className="text-sm text-slate-500 font-medium">
                      Pinalti keterlambatan Anda telah disesuaikan menjadi -2 Poin.
                    </p>
                  </div>
                  <Button
                    onClick={() => setOpStep("choice")}
                    className="w-full h-12 rounded-lg font-bold bg-slate-900 text-white hover:bg-slate-800"
                  >
                    Selesai
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side Info for Op */}
          <div className="space-y-6">
            <Card className="border-slate-200/60 shadow-sm rounded-xl">
              <CardHeader className="p-5 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2 text-slate-600">
                  <ShieldAlert className="size-4" />
                  <CardTitle className="text-xs font-bold uppercase tracking-widest">
                    SOP Lapangan
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <p className="text-xs leading-relaxed text-slate-600 font-medium">
                  Laporan harus dilakukan maksimal <b>15 menit</b> setelah kendala terjadi. AI akan memverifikasi kesesuaian visual dengan laporan Anda.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Technical Incident */}
        <TabsContent
          value="technical"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
        >
          <Card className="lg:col-span-2 border-slate-200/60 shadow-sm rounded-xl overflow-hidden min-h-[500px] flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6">
              <CardTitle className="text-lg font-bold text-slate-900">Laporan Kendala Aplikasi</CardTitle>
              <CardDescription className="text-xs text-slate-500 mt-1">
                Sistem diagnostik akan memeriksa kondisi perangkat Anda secara otomatis.
              </CardDescription>
            </CardHeader>

            <CardContent className="p-8 flex-1 flex flex-col">
              {techStep === "idle" && (
                <div className="flex flex-col items-center justify-center space-y-6 flex-1 py-10 max-w-md mx-auto w-full">
                  <div className="size-20 bg-primary/10 rounded-full flex items-center justify-center">
                    <Smartphone className="size-10 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">Mulai Cek Kesehatan Perangkat</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Kami perlu memeriksa GPS, Kamera, dan Koneksi internet Anda sebelum menerima laporan bug.
                    </p>
                  </div>
                  <Button
                    onClick={runDiagnostics}
                    className="w-full h-12 rounded-lg font-bold text-sm gap-2"
                  >
                    Jalankan Diagnostik AI
                    <Cpu className="size-4" />
                  </Button>
                </div>
              )}

              {techStep === "scanning" && (
                <div className="space-y-8 py-8 flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: "gps", label: "Sensor GPS", icon: Navigation },
                      { id: "camera", label: "Camera API", icon: Camera },
                      { id: "network", label: "Internet Speed", icon: Wifi },
                      { id: "battery", label: "System Health", icon: Smartphone },
                    ].map((s) => (
                      <div key={s.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <s.icon className={cn("size-4", diagnostics[s.id as keyof typeof diagnostics] === "ok" ? "text-emerald-500" : diagnostics[s.id as keyof typeof diagnostics] === "warning" ? "text-amber-500" : "text-slate-300")} />
                        <span className="text-[10px] font-bold text-slate-600">{s.label}</span>
                        <div className="ml-auto">
                          {diagnostics[s.id as keyof typeof diagnostics] === "pending" ? (
                            <Loader2 className="size-3 text-slate-300 animate-spin" />
                          ) : diagnostics[s.id as keyof typeof diagnostics] === "ok" ? (
                            <CheckCircle2 className="size-3.5 text-emerald-500" />
                          ) : (
                            <AlertTriangle className="size-3.5 text-amber-500" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2">
                    <Progress value={75} className="h-1.5" />
                    <p className="text-center text-[10px] font-bold uppercase text-slate-400 animate-pulse tracking-widest">
                      Scanning Hardware Status...
                    </p>
                  </div>
                </div>
              )}

              {techStep === "form" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 flex-1 max-w-xl mx-auto w-full py-4">
                  <Alert className="bg-amber-50 border-amber-100 py-3 rounded-xl">
                    <Wifi className="size-4 text-amber-600" />
                    <AlertTitle className="text-[10px] font-bold uppercase text-amber-900 tracking-widest">Hasil Diagnostik: Koneksi Lemah</AlertTitle>
                    <AlertDescription className="text-xs text-amber-800 font-medium mt-1">
                      Sistem mendeteksi latensi internet tinggi. Ini mungkin alasan aplikasi lambat.
                    </AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Apa yang terjadi?
                      </label>
                      <Textarea
                        placeholder="Contoh: Saya tidak bisa klik tombol kirim foto di CP2..."
                        className="rounded-lg min-h-[100px] border-slate-200 text-sm focus:ring-primary/20"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                        Lampirkan Screenshot (Opsional)
                      </label>
                      <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer transition-colors bg-white">
                        <Upload className="size-5 text-slate-400" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Klik untuk upload
                        </p>
                      </div>
                    </div>
                    <Button
                      onClick={() => setTechStep("success")}
                      className="w-full h-12 rounded-lg font-bold shadow-sm gap-2 mt-2"
                    >
                      Kirim Laporan Bug
                      <Send className="size-3.5" />
                    </Button>
                  </div>
                </div>
              )}

              {techStep === "success" && (
                <div className="flex flex-col items-center justify-center space-y-6 flex-1 py-10 text-center animate-in zoom-in-95 max-w-md mx-auto w-full">
                  <div className="size-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-slate-900">Tiket Terkirim ke Helpdesk</h3>
                    <p className="text-xs text-slate-500 font-medium">
                      ID Tiket: #TCH-2026-991. Tim IT kami akan segera mengecek status perangkat Anda.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setTechStep("idle")}
                    className="rounded-lg h-10 px-6 font-bold border-slate-200 text-slate-600 hover:bg-slate-50"
                  >
                    Lapor Masalah Lain
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side Info for Tech */}
          <div className="space-y-6">
            <Card className="border-slate-200/60 shadow-sm rounded-xl bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <CardHeader className="p-5 border-b border-slate-700/50">
                <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-slate-300">
                  Security Note
                </CardTitle>
              </CardHeader>
              <CardContent className="p-5 space-y-4">
                <div className="flex gap-3">
                  <ShieldCheck className="size-4 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="text-xs leading-relaxed text-slate-300 font-medium">
                    Data diagnostik perangkat hanya digunakan untuk membantu penyelesaian bug dan tidak akan digunakan untuk melacak aktivitas pribadi.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
