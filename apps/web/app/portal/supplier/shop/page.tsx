"use client"

import * as React from "react"
import { 
  Store, 
  Camera, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Info,
  CheckCircle2,
  UploadCloud,
  AlertCircle,
  Clock
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { useToast } from "@workspace/ui/hooks/use-toast"

export default function SupplierShopPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = React.useState(false)

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      toast({
        title: "Profil Toko Diperbarui",
        description: "Data etalase Anda berhasil disimpan dan sudah dapat dilihat oleh Vendor.",
      })
    }, 1500)
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Etalase Toko</h1>
          <p className="text-muted-foreground font-medium mt-1">Kelola identitas bisnis dan visual toko Anda untuk menarik minat Vendor.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="rounded-full px-8 font-bold">
          {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Business Bio */}
        <div className="lg:col-span-2 space-y-8">
          <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Store className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Informasi Bisnis</CardTitle>
                  <CardDescription>Deskripsikan spesialisasi dan keunggulan pasokan Anda.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-2">
                <Label htmlFor="shop-name" className="font-bold text-xs uppercase tracking-widest text-slate-500">Nama Toko / PT</Label>
                <Input id="shop-name" defaultValue="PT Tani Makmur Sejahtera" disabled className="bg-slate-50 font-semibold" />
                <p className="text-[10px] text-muted-foreground italic">* Nama entitas tidak dapat diubah (sesuai NIB/Registrasi).</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="font-bold text-xs uppercase tracking-widest text-slate-500">Biodata Perusahaan</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Ceritakan tentang kapasitas produksi, pengalaman, dan komitmen kualitas Anda..."
                  className="min-h-[150px] rounded-xl resize-none"
                  defaultValue="Pemasok utama daging ayam potong segar terstandarisasi untuk area Yogyakarta. Kami memiliki fasilitas rumah potong sendiri dengan sertifikasi NKV dan Halal."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold text-xs uppercase tracking-widest text-slate-500">No. WhatsApp Bisnis</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input id="phone" className="pl-10 rounded-xl" defaultValue="+62 815-6789-0123" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-slate-500">Email Operasional</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input id="email" className="pl-10 rounded-xl" defaultValue="contact@tanimakmur.co.id" />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-2xl">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="size-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                  <MapPin className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Lokasi & Distribusi</CardTitle>
                  <CardDescription>Atur titik koordinat gudang untuk pencarian jarak terdekat.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="aspect-video bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center text-muted-foreground gap-2">
                <MapPin className="size-8 opacity-20" />
                <p className="text-sm font-medium">Map Integration Placeholder</p>
                <Button variant="outline" size="sm" className="rounded-full text-xs font-bold">Set Titik Koordinat</Button>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Info className="size-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  Titik koordinat yang akurat memastikan Vendor SPPG di sekitar Anda dapat menemukan toko Anda lebih cepat di menu "Supplier Terdekat".
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Visuals & Photos */}
        <div className="space-y-8">
          <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-bold">Foto Riil Toko</CardTitle>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-black text-[10px] uppercase">Verified AI</Badge>
              </div>
              <CardDescription>Foto gedung atau gudang operasional Anda.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="relative group aspect-square rounded-2xl overflow-hidden border border-border">
                <img 
                  src="https://images.unsplash.com/photo-1582408921715-18e7806367c1?q=80&w=400&auto=format&fit=crop" 
                  alt="Shop Front" 
                  className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="rounded-full font-bold gap-2">
                    <Camera className="size-4" /> Ganti Foto
                  </Button>
                </div>
                <div className="absolute top-3 left-3">
                  <Badge className="bg-white/90 text-slate-900 border-none shadow-sm font-black text-[9px] uppercase tracking-tighter flex gap-1 items-center">
                    <CheckCircle2 className="size-3 text-emerald-500" /> Foto Riil - Mar 2026
                  </Badge>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-amber-600">
                  <AlertCircle className="size-4" />
                  <span className="text-xs font-bold">Tips Foto Menarik:</span>
                </div>
                <ul className="text-[11px] text-muted-foreground space-y-1.5 font-medium">
                  <li className="flex items-start gap-2">• Gunakan pencahayaan yang terang</li>
                  <li className="flex items-start gap-2">• Pastikan area gudang terlihat bersih</li>
                  <li className="flex items-start gap-2">• Tampilkan papan nama usaha jika ada</li>
                </ul>
              </div>

              <Button variant="outline" className="w-full rounded-xl border-dashed border-2 py-8 flex flex-col h-auto gap-2 group hover:border-primary/50 hover:bg-primary/5 transition-all">
                <UploadCloud className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
                <div className="text-center">
                  <p className="text-xs font-bold">Upload Foto Baru</p>
                  <p className="text-[10px] text-muted-foreground">PNG, JPG up to 5MB</p>
                </div>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-2xl border-l-4 border-l-primary">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Status Etalase</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">Aktif & Terverifikasi</p>
                <p className="text-xs text-muted-foreground font-medium italic">Profil Anda saat ini dapat ditemukan oleh Vendor dalam radius 50km.</p>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>View Profil (30 Hari)</span>
                <span className="text-slate-900">1,240 Kali</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
