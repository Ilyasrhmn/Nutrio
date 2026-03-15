"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { 
  ShieldCheck, 
  Sparkles, 
  Video, 
  MapPin, 
  CreditCard, 
  CheckCircle2, 
  ChevronRight, 
  ArrowLeft,
  FileCheck,
  Zap,
  Camera,
  Banknote,
  Map as MapIcon
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"

export default function VendorOnboardingPage() {
  const [currentStep, setCurrentStep] = React.useState(1)
  const router = useRouter()
  const { toast } = useToast()

  const steps = [
    { id: 1, title: "Profil Usaha", description: "Data dasar instansi" },
    { id: 2, title: "Legalitas & AI", description: "Verifikasi otomatis" },
    { id: 3, title: "Kapasitas", description: "Produksi & Finansial" },
  ]

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    } else {
      handleFinalSubmit()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1)
  }

  const handleFinalSubmit = () => {
    toast({
      title: "Pendaftaran Dikirim",
      description: "Data Anda sedang diverifikasi oleh sistem AI dan tim BGN.",
    })
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-[1000px] mb-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/register")}
          className="gap-2 text-slate-500 hover:text-primary hover:bg-primary/5 font-bold"
        >
          <ArrowLeft className="size-4" />
          Kembali ke Pilihan Peran
        </Button>
      </div>
      <Card className="w-full max-w-[1000px] shadow-2xl border-slate-200/60 overflow-hidden flex flex-col md:flex-row min-h-[650px]">
        {/* Sidebar Stepper */}
        <aside className="w-full md:w-80 bg-white border-r border-slate-100 p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-12">
              <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
                <ShieldCheck className="size-6" />
              </div>
              <div>
                <h1 className="font-bold text-foreground leading-tight text-lg">VendorTrack</h1>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">MBG VENDOR HUB</p>
              </div>
            </div>

            <div className="space-y-8 relative">
              <div className="absolute left-[19px] top-2 bottom-2 w-0.5 bg-slate-100 -z-0" />
              
              {steps.map((step) => {
                const isActive = currentStep === step.id
                const isCompleted = currentStep > step.id
                
                return (
                  <div key={step.id} className="relative z-10 flex items-start gap-4">
                    <div 
                      className={cn(
                        "size-10 rounded-full flex items-center justify-center text-sm font-bold transition-all border-2",
                        isActive ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20 scale-110" : 
                        isCompleted ? "bg-emerald-500 border-emerald-500 text-white" : 
                        "bg-white border-slate-200 text-slate-400"
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="size-5" /> : step.id}
                    </div>
                    <div className="pt-0.5">
                      <p className={cn(
                        "text-sm font-bold transition-colors",
                        isActive ? "text-primary" : isCompleted ? "text-slate-900" : "text-slate-400"
                      )}>
                        {step.title}
                      </p>
                      <p className="text-[11px] font-medium text-slate-400 leading-tight">
                        {step.description}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          <div className="pt-8 mt-12 border-t border-slate-50">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Butuh Bantuan?</p>
              <Button variant="ghost" className="w-full text-xs font-bold text-primary hover:bg-primary/5 h-8">
                Panduan Pendaftaran
              </Button>
            </div>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 bg-white flex flex-col relative">
          <div className="flex-1 p-10 overflow-y-auto">
            {currentStep === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-foreground">Informasi Badan Usaha & Penanggung Jawab</h2>
                  <p className="text-muted-foreground text-sm font-medium">Lengkapi data dasar instansi Anda sesuai dokumen hukum.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Tipe Instansi</Label>
                    <Select>
                      <SelectTrigger id="type" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50">
                        <SelectValue placeholder="Pilih Tipe" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="pt">Perseroan Terbatas (PT)</SelectItem>
                        <SelectItem value="cv">Commanditaire Vennootschap (CV)</SelectItem>
                        <SelectItem value="koperasi">Koperasi</SelectItem>
                        <SelectItem value="yayasan">Yayasan</SelectItem>
                        <SelectItem value="perorangan">Perorangan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="business-name" className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Nama Mitra / Usaha</Label>
                    <Input id="business-name" placeholder="Cth: PT Catering Berkah" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nik" className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">NIK Penanggung Jawab</Label>
                    <Input id="nik" placeholder="16 digit angka" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="pic-name" className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Nama Lengkap PIC</Label>
                    <Input id="pic-name" placeholder="Nama sesuai identitas" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp" className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Nomor WhatsApp</Label>
                    <Input id="whatsapp" placeholder="0812..." className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Email & Password</Label>
                    <Input id="email" type="email" placeholder="admin@usaha.com" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5" />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-black uppercase rounded tracking-widest mb-1">AI Automated Verification</div>
                  </div>
                  <h2 className="text-2xl font-black text-foreground">Verifikasi Legalitas & AI</h2>
                  <p className="text-muted-foreground text-sm font-medium">Verifikasi dokumen hukum dan fisik dapur secara instan.</p>
                </div>

                <div className="space-y-8">
                  {/* Section A: Legalitas */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <FileCheck className="size-4 text-primary" />
                      Legalitas Usaha (NIB, NPWP, SLHS)
                    </h3>
                    <div className="p-10 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center bg-slate-50/30 group hover:bg-slate-50 hover:border-primary/30 transition-all cursor-pointer">
                      <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-xl mb-4 group-hover:scale-110 transition-transform">
                        <Sparkles className="size-7 text-primary" />
                      </div>
                      <p className="font-black text-foreground mb-1">Scan Dokumen via AI OCR</p>
                      <p className="text-xs text-slate-400 font-medium mb-6">Unggah NIB atau NPWP untuk validasi instan</p>
                      <Button variant="outline" className="rounded-full h-11 px-8 border-slate-200 bg-white font-bold text-xs gap-2 shadow-sm">
                        Ambil Foto / Pilih File
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-4 py-1.5 gap-2 rounded-full">
                        <CheckCircle2 className="size-3.5" />
                        NIB Tervalidasi (API OSS)
                      </Badge>
                      <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-4 py-1.5 gap-2 rounded-full">
                        <CheckCircle2 className="size-3.5" />
                        SLHS Aktif (API Dinkes)
                      </Badge>
                    </div>
                  </div>

                  {/* Section B: Physical Tour */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Camera className="size-4 text-primary" />
                      Verifikasi Fisik Dapur
                    </h3>
                    <div className="p-10 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center bg-slate-50/30 group hover:bg-slate-50 hover:border-primary/30 transition-all cursor-pointer text-center">
                      <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-xl mb-4 group-hover:scale-110 transition-transform">
                        <Video className="size-7 text-primary" />
                      </div>
                      <p className="font-black text-foreground mb-1">Mulai Video Tour 360° (AI Spatial Analysis)</p>
                      <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">AI akan memindai kelayakan sanitasi dan kapasitas alat masak secara real-time.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-foreground">Kapasitas Dapur & Keuangan</h2>
                  <p className="text-muted-foreground text-sm font-medium">Verifikasi kemampuan produksi dan validasi skor kredit bank.</p>
                </div>

                <div className="space-y-8">
                  {/* Section 1: Produksi */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Zap className="size-4 text-primary" />
                      Kapasitas Produksi
                    </h3>
                    <div className="max-w-md space-y-2">
                      <Label htmlFor="capacity" className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Kapasitas Masak Harian (Porsi)</Label>
                      <Input id="capacity" type="number" placeholder="Minimal 500 porsi" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5" />
                    </div>
                  </div>

                  {/* Section 2: Geotagging */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <MapIcon className="size-4 text-primary" />
                      Lokasi Dapur (Geotagging)
                    </h3>
                    <div className="relative h-48 w-full bg-slate-100 rounded-[32px] border border-slate-200 overflow-hidden flex items-center justify-center">
                       <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale" />
                       <Button className="relative z-10 rounded-full font-bold shadow-2xl gap-2 h-12 px-8 bg-white text-slate-900 hover:bg-slate-50 border-none">
                         <MapPin className="size-5 text-primary" />
                         Pin Lokasi Saat Ini (GPS)
                       </Button>
                    </div>
                  </div>

                  {/* Section 3: Finansial */}
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                      <Banknote className="size-4 text-primary" />
                      Kapasitas Finansial (Open Banking API)
                    </h3>
                    <div className="space-y-4">
                      <Button className="bg-slate-950 text-white rounded-2xl h-14 px-8 font-black hover:bg-slate-900 shadow-2xl gap-3 w-full md:w-auto transition-all active:scale-95">
                        <CreditCard className="size-5" />
                        Hubungkan Rekening Bank
                      </Button>
                      
                      <div className="p-5 bg-slate-50 border border-slate-200 rounded-[24px] flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="size-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center font-black text-blue-600 shadow-sm">BCA</div>
                          <div>
                            <p className="text-sm font-black text-slate-900 leading-tight">BCA - PT Catering Berkah</p>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-0.5">Rekening Giro Terintegrasi</p>
                          </div>
                        </div>
                        <Badge className="bg-emerald-500 text-white border-none font-black text-[10px] px-4 py-1.5 rounded-full shadow-lg shadow-emerald-100">SKOR FINANSIAL: A (Memenuhi Syarat)</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Navigation */}
          <footer className="p-8 border-t border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md">
            <Button 
              variant="outline" 
              onClick={prevStep} 
              disabled={currentStep === 1}
              className="rounded-2xl h-12 px-8 border-slate-200 font-bold text-slate-600 gap-2 disabled:opacity-20 transition-all"
            >
              <ArrowLeft className="size-4" />
              Kembali
            </Button>
            
            <Button 
              onClick={nextStep}
              className={cn(
                "rounded-2xl h-12 px-10 font-black shadow-xl transition-all gap-2 active:scale-95",
                currentStep === 3 ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-primary hover:bg-primary/90 shadow-primary/20"
              )}
            >
              {currentStep === 3 ? "Kirim Pendaftaran & Verifikasi" : "Simpan & Lanjutkan"}
              <ChevronRight className="size-4" />
            </Button>
          </footer>
        </main>
      </Card>
    </div>
  )
}
