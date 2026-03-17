"use client"

import * as React from "react"
import { 
  AlertCircle, 
  Camera, 
  ShieldAlert, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
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
  Truck
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@workspace/ui/components/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { cn } from "@workspace/ui/lib/utils"

export default function IncidentsPage() {
  // Operational State
  const [opStep, setOpStep] = React.useState<'choice' | 'camera' | 'verifying' | 'result'>('choice')
  const [incidentType, setIncidentType] = React.useState<string>("")
  
  // Technical State
  const [techStep, setTechStep] = React.useState<'idle' | 'scanning' | 'form' | 'success'>('idle')
  const [diagnostics, setDiagnostics] = React.useState({
    gps: 'pending',
    camera: 'pending',
    network: 'pending',
    battery: 'pending'
  })

  const runDiagnostics = () => {
    setTechStep('scanning')
    const stages = ['gps', 'camera', 'network', 'battery']
    stages.forEach((stage, index) => {
      setTimeout(() => {
        setDiagnostics(prev => ({
          ...prev,
          [stage]: stage === 'network' ? 'warning' : 'ok'
        }))
        if (index === stages.length - 1) {
          setTimeout(() => setTechStep('form'), 1000)
        }
      }, (index + 1) * 800)
    })
  }

  const handleOpCapture = () => {
    setOpStep('verifying')
    setTimeout(() => setOpStep('result'), 3000)
  }

  return (
    <div className="p-8 space-y-8 bg-background max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight flex items-center gap-3">
            Pusat Kendali Insiden AI
            <Badge variant="outline" className="bg-red-50 text-red-600 border-red-100 font-black px-2 h-5 text-[9px] uppercase">Compliance Hub</Badge>
          </h2>
          <p className="text-muted-foreground text-sm font-medium">Laporkan kendala operasional atau teknis secara transparan dengan validasi otomatis.</p>
        </div>
      </div>

      <Tabs defaultValue="operational" className="space-y-8">
        <TabsList className="bg-slate-100 p-1 rounded-2xl h-auto w-full md:w-fit flex gap-1">
          <TabsTrigger value="operational" className="flex-1 md:flex-none rounded-xl py-2.5 px-6 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">
            <Truck className="size-4" />
            Kendala Operasional
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex-1 md:flex-none rounded-xl py-2.5 px-6 gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">
            <Settings className="size-4" />
            Kendala Teknis
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Operational Incident */}
        <TabsContent value="operational" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-left-4 duration-500">
          <Card className="lg:col-span-2 border-border bg-card shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden min-h-[500px] flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b border-border/50 p-8">
              <CardTitle className="text-xl font-black text-foreground">Laporan Masalah Lapangan</CardTitle>
              <CardDescription className="font-bold text-slate-500 italic">Gunakan kamera live untuk memvalidasi kendala pengiriman Anda.</CardDescription>
            </CardHeader>
            
            <CardContent className="p-8 flex-1 flex flex-col justify-center">
              {opStep === 'choice' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pilih Jenis Kendala</label>
                    <Select onValueChange={setIncidentType}>
                      <SelectTrigger className="h-14 rounded-2xl border-2 border-slate-100 text-base font-bold bg-white">
                        <SelectValue placeholder="-- Pilih Masalah Lapangan --" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ban-bocor">Ban Bocor (Flat Tire)</SelectItem>
                        <SelectItem value="mesin-mogok">Mesin Kendaraan Mogok</SelectItem>
                        <SelectItem value="kecelakaan">Kecelakaan Lalu Lintas</SelectItem>
                        <SelectItem value="macet-total">Macet Total (Bencana/Demo)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button 
                    onClick={() => setOpStep('camera')}
                    disabled={!incidentType}
                    className="w-full h-16 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 gap-3"
                  >
                    Buka Kamera Validasi AI
                    <Camera className="size-5" />
                  </Button>
                </div>
              )}

              {opStep === 'camera' && (
                <div className="space-y-6 animate-in zoom-in-95">
                  <div className="relative aspect-video bg-black rounded-[28px] overflow-hidden border-4 border-slate-100 shadow-inner group">
                    <div className="absolute inset-0 flex items-center justify-center opacity-40">
                      <Camera className="size-20 text-white" />
                    </div>
                    <div className="absolute top-4 left-4 bg-red-600 px-3 py-1 rounded-full flex items-center gap-2">
                      <div className="size-2 bg-white rounded-full animate-pulse" />
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">Live Camera Mode</p>
                    </div>
                  </div>
                  <Button onClick={handleOpCapture} className="w-full h-16 rounded-2xl text-lg font-black shadow-xl bg-red-600 hover:bg-red-700 text-white gap-3">
                    Kirim Bukti Foto
                  </Button>
                  <Button variant="ghost" onClick={() => setOpStep('choice')} className="w-full text-slate-400 font-bold h-10">Batal</Button>
                </div>
              )}

              {opStep === 'verifying' && (
                <div className="flex flex-col items-center justify-center space-y-6 text-center">
                  <Loader2 className="size-16 text-primary animate-spin" />
                  <h3 className="text-xl font-black text-slate-900">AI Menganalisis Visual & GPS...</h3>
                </div>
              )}

              {opStep === 'result' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-top-4 text-center">
                  <div className="size-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900">Laporan Operasional Sah</h3>
                    <p className="text-sm text-slate-500 font-medium">Pinalti keterlambatan Anda telah disesuaikan menjadi -2 Poin.</p>
                  </div>
                  <Button onClick={() => setOpStep('choice')} className="w-full h-14 rounded-2xl font-bold bg-slate-900 text-white">Selesai</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side Info for Op */}
          <div className="space-y-6">
            <Card className="border-border shadow-sm bg-slate-900 text-white">
              <CardHeader className="p-6">
                <div className="flex items-center gap-2 text-primary">
                  <ShieldAlert className="size-4" />
                  <CardTitle className="text-xs font-black uppercase tracking-widest">SOP Lapangan</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 space-y-4">
                <p className="text-[11px] leading-relaxed text-slate-300">
                  Laporan harus dilakukan maksimal <b>15 menit</b> setelah kendala terjadi. AI akan memverifikasi kesesuaian visual dengan laporan Anda.
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Tab 2: Technical Incident */}
        <TabsContent value="technical" className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-right-4 duration-500">
          <Card className="lg:col-span-2 border-border bg-card shadow-2xl shadow-slate-200/50 rounded-[32px] overflow-hidden min-h-[500px] flex flex-col">
            <CardHeader className="bg-slate-50/50 border-b border-border/50 p-8">
              <CardTitle className="text-xl font-black text-foreground">Laporan Kendala Aplikasi</CardTitle>
              <CardDescription className="font-bold text-slate-500 italic">Sistem diagnostik akan memeriksa kondisi perangkat Anda secara otomatis.</CardDescription>
            </CardHeader>

            <CardContent className="p-8 flex-1 flex flex-col">
              {techStep === 'idle' && (
                <div className="flex flex-col items-center justify-center space-y-8 flex-1 py-12">
                  <div className="size-24 bg-primary/10 rounded-full flex items-center justify-center">
                    <Smartphone className="size-12 text-primary" />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Mulai Cek Kesehatan Perangkat</h3>
                    <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">Kami perlu memeriksa GPS, Kamera, dan Koneksi internet Anda sebelum menerima laporan bug.</p>
                  </div>
                  <Button onClick={runDiagnostics} className="w-full md:w-64 h-14 rounded-2xl font-black text-base gap-2">
                    Jalankan Diagnostik AI
                    <Cpu className="size-5" />
                  </Button>
                </div>
              )}

              {techStep === 'scanning' && (
                <div className="space-y-8 py-8 flex-1 flex flex-col justify-center">
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { id: 'gps', label: 'Sensor GPS', icon: Navigation },
                      { id: 'camera', label: 'Camera API', icon: Camera },
                      { id: 'network', label: 'Internet Speed', icon: Wifi },
                      { id: 'battery', label: 'System Health', icon: Smartphone },
                    ].map((s) => (
                      <div key={s.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3">
                        <s.icon className={cn(
                          "size-5",
                          diagnostics[s.id as keyof typeof diagnostics] === 'ok' ? 'text-emerald-500' :
                          diagnostics[s.id as keyof typeof diagnostics] === 'warning' ? 'text-amber-500' : 'text-slate-300'
                        )} />
                        <span className="text-[11px] font-bold text-slate-600">{s.label}</span>
                        <div className="ml-auto">
                          {diagnostics[s.id as keyof typeof diagnostics] === 'pending' ? <Loader2 className="size-3 text-slate-300 animate-spin" /> : 
                           diagnostics[s.id as keyof typeof diagnostics] === 'ok' ? <CheckCircle2 className="size-3.5 text-emerald-500" /> :
                           <AlertTriangle className="size-3.5 text-amber-500" />}
                        </div>
                      </div>
                    ))}
                  </div>
                  <Progress value={75} className="h-2" />
                  <p className="text-center text-[10px] font-black uppercase text-slate-400 animate-pulse tracking-widest">Scanning Hardware Status...</p>
                </div>
              )}

              {techStep === 'form' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 flex-1">
                  <Alert className="bg-amber-50 border-amber-100 py-3">
                    <Wifi className="size-4 text-amber-600" />
                    <AlertTitle className="text-[10px] font-black uppercase text-amber-900">Hasil Diagnostik: Koneksi Lemah</AlertTitle>
                    <AlertDescription className="text-[11px] text-amber-800 font-medium">Sistem mendeteksi latensi internet tinggi. Ini mungkin alasan aplikasi lambat.</AlertDescription>
                  </Alert>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Apa yang terjadi?</label>
                      <Textarea placeholder="Contoh: Saya tidak bisa klik tombol kirim foto di CP2..." className="rounded-xl min-h-[100px] border-slate-200" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Lampirkan Screenshot (Opsional)</label>
                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center gap-2 hover:bg-slate-50 cursor-pointer transition-colors">
                        <Upload className="size-6 text-slate-300" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase">Klik untuk upload gambar</p>
                      </div>
                    </div>
                    <Button onClick={() => setTechStep('success')} className="w-full h-14 rounded-2xl font-black gap-2 shadow-xl shadow-primary/20">
                      Kirim Laporan Bug
                      <Send className="size-4" />
                    </Button>
                  </div>
                </div>
              )}

              {techStep === 'success' && (
                <div className="flex flex-col items-center justify-center space-y-6 flex-1 py-12 text-center animate-in scale-95">
                  <div className="size-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center shadow-sm">
                    <CheckCircle2 className="size-10" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tiket Terkirim ke Helpdesk</h3>
                    <p className="text-sm text-slate-500 font-medium max-w-sm mx-auto">ID Tiket: #TCH-2026-991. Tim IT kami akan segera mengecek status perangkat Anda.</p>
                  </div>
                  <Button variant="outline" onClick={() => setTechStep('idle')} className="rounded-xl h-10 px-6 font-bold border-slate-200">Lapor Masalah Lain</Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Side Info for Tech */}
          <div className="space-y-6">
            <Card className="border-border shadow-sm bg-indigo-950 text-white rounded-3xl overflow-hidden">
              <CardHeader className="p-6 border-b border-white/5">
                <CardTitle className="text-xs font-black uppercase tracking-widest text-primary">Security Note</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex gap-3">
                  <ShieldCheck className="size-5 text-emerald-400 shrink-0" />
                  <p className="text-[11px] leading-relaxed text-slate-300 italic">
                    Data diagnostik perangkat hanya digunakan untuk membantu penyelesaian bug dan tidak akan digunakan untuk melacak aktivitas pribadi.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
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
