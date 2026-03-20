"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ShieldCheck,
  Sparkles,
  MapPin,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  FileCheck,
  Package,
  Store,
  Warehouse,
  UploadCloud,
  Navigation,
  ExternalLink
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

export default function SupplierOnboardingPage() {
  const [currentStep, setCurrentStep] = React.useState(1)
  const router = useRouter()
  const { toast } = useToast()

  const steps = [
    { id: 1, title: "Profil & Lokasi", description: "Data toko & gudang" },
    { id: 2, title: "Validasi Legal", description: "BPOM & NKV" },
    { id: 3, title: "Fisik & Stok", description: "Bukti kapasitas" },
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
      title: "Pendaftaran Supplier Terkirim",
      description: "Tim verifikator BGN akan meninjau kelayakan profil Anda.",
    })
    router.push("/login")
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 font-sans">
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
              <div className="size-10 bg-amber-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-200">
                <Package className="size-6" />
              </div>
              <div>
                <h1 className="font-bold text-foreground leading-tight text-lg">Nutrio</h1>
                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">SUPPLIER PORTAL</p>
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
                        isActive ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-200 scale-110" :
                          isCompleted ? "bg-emerald-500 border-emerald-500 text-white" :
                            "bg-white border-slate-200 text-slate-400"
                      )}
                    >
                      {isCompleted ? <CheckCircle2 className="size-5" /> : step.id}
                    </div>
                    <div className="pt-0.5">
                      <p className={cn(
                        "text-sm font-bold transition-colors",
                        isActive ? "text-amber-600" : isCompleted ? "text-slate-900" : "text-slate-400"
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
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 text-center">Bantuan Supplier</p>
              <Button variant="ghost" className="w-full text-xs font-bold text-amber-600 hover:bg-amber-50 h-8">
                Pusat Edukasi MBG
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
                  <h2 className="text-2xl font-black text-foreground">Profil Toko & Lokasi Pasokan</h2>
                  <p className="text-muted-foreground text-sm font-medium">Data lokasi Anda digunakan sistem untuk mencocokkan dengan Dapur SPPG terdekat.</p>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Kategori Pasokan Utama</Label>
                      <Select>
                        <SelectTrigger className="rounded-2xl h-12 border-slate-200 bg-slate-50/50">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="meat">Daging & Unggas</SelectItem>
                          <SelectItem value="veg">Sayur & Buah</SelectItem>
                          <SelectItem value="dairy">Pangan Kemasan / Susu</SelectItem>
                          <SelectItem value="basic">Sembako</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Nama Toko / Badan Usaha</Label>
                      <Input placeholder="Cth: UD Tani Makmur" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">NIK Pemilik</Label>
                    <Input placeholder="Masukkan 16 digit NIK" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5" />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Alamat Lengkap Gudang/Toko</Label>
                    <textarea
                      placeholder="Jalan, RT/RW, Kelurahan, Kecamatan..."
                      className="w-full min-h-[100px] rounded-2xl border border-slate-200 bg-slate-50/50 p-5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Pin Lokasi Toko di Peta</Label>
                    <div className="relative h-40 w-full bg-slate-100 rounded-2xl border border-slate-200 overflow-hidden flex items-center justify-center group">
                      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-30 grayscale" />
                      <Button className="relative z-10 rounded-full font-bold shadow-xl gap-2 h-10 px-6 bg-white text-slate-900 hover:bg-slate-50 border-none text-xs">
                        <Navigation className="size-4 text-amber-600" />
                        Gunakan GPS Saat Ini
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-black uppercase rounded tracking-widest mb-1">Safety First</div>
                  </div>
                  <h2 className="text-2xl font-black text-foreground">Validasi Sertifikasi Keamanan Pangan</h2>
                  <p className="text-muted-foreground text-sm font-medium">Sistem AI akan memverifikasi nomor dokumen Anda dengan database BPOM dan Dinas Peternakan.</p>
                </div>

                <div className="space-y-8">
                  <div className="p-10 border-2 border-dashed border-slate-200 rounded-[32px] flex flex-col items-center justify-center bg-slate-50/30 group hover:bg-slate-50 hover:border-amber-300 transition-all cursor-pointer">
                    <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-xl mb-4 group-hover:scale-110 transition-transform">
                      <Sparkles className="size-7 text-amber-500" />
                    </div>
                    <p className="font-black text-foreground mb-1">Scan Dokumen via AI OCR</p>
                    <p className="text-xs text-slate-400 font-medium mb-6 text-center">Unggah NIB, Sertifikat Halal, atau NKV untuk pengisian otomatis</p>
                    <Button variant="outline" className="rounded-full h-11 px-8 border-slate-200 bg-white font-bold text-xs gap-2 shadow-sm">
                      Pilih File Sertifikasi
                    </Button>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Nomor Induk Berusaha (NIB)</Label>
                      <div className="relative">
                        <Input defaultValue="9120001234567" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5 pr-32 font-mono" />
                        <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px]">VALID (OSS)</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Sertifikat Halal</Label>
                      <div className="relative">
                        <Input defaultValue="ID31110000123450121" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5 pr-32 font-mono" />
                        <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px]">VALID (MUI)</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Nomor Kontrol Veteriner (NKV) / Izin Edar BPOM</Label>
                      <div className="relative">
                        <Input defaultValue="NKV-UNIT-3275-001" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5 pr-32 font-mono" />
                        <Badge className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px]">VALID</Badge>
                      </div>
                      <p className="text-[10px] text-slate-400 font-medium pl-1 italic">*NKV wajib untuk daging/unggas, BPOM untuk susu/pangan olahan.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                <div className="space-y-1">
                  <h2 className="text-2xl font-black text-foreground">Bukti Fisik & Kapasitas Etalase</h2>
                  <p className="text-muted-foreground text-sm font-medium">Unggah foto riil untuk mencegah supplier fiktif.</p>
                </div>

                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Foto Tampak Depan Toko/Gudang</Label>
                      <div className="h-48 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer">
                        <UploadCloud className="size-8 text-slate-300 mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Foto</p>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Foto Stok / Cold Storage</Label>
                      <div className="h-48 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center bg-slate-50/30 hover:bg-slate-50 transition-colors cursor-pointer">
                        <UploadCloud className="size-8 text-slate-300 mb-2" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Upload Foto</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Store className="size-4 text-amber-600" />
                      <h3 className="font-bold text-slate-800">Kapasitas Operasional</h3>
                    </div>
                    <div className="max-w-md space-y-2">
                      <Label className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1">Estimasi Kapasitas Pasokan Harian (Kg / Liter)</Label>
                      <Input type="number" placeholder="Cth: 1000" className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5" />
                    </div>
                  </div>

                  <div className="p-6 bg-blue-50 border border-blue-100 rounded-[24px] flex items-start gap-4">
                    <div className="size-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 shrink-0">
                      <ExternalLink className="size-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-blue-900">B2B Marketplace Integration</p>
                      <p className="text-xs text-blue-700 leading-relaxed mt-1">
                        Profil Anda akan otomatis muncul di katalog MBG setelah verifikasi selesai. Pastikan foto stok barang terlihat jelas.
                      </p>
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
                currentStep === 3 ? "bg-amber-600 hover:bg-amber-700 shadow-amber-100" : "bg-primary hover:bg-primary/90 shadow-primary/20"
              )}
            >
              {currentStep === 3 ? "Ajukan Verifikasi Supplier" : "Simpan & Lanjutkan"}
              <ChevronRight className="size-4" />
            </Button>
          </footer>
        </main>
      </Card>
    </div>
  )
}
