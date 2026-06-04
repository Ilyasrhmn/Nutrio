"use client"

import * as React from "react"
import dynamic from "next/dynamic"
import {
  Store,
  Camera,
  MapPin,
  Phone,
  Mail,
  Info,
  UploadCloud,
  AlertCircle,
  Clock,
  Loader2,
  Navigation,
  CheckCircle2,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { useToast } from "@workspace/ui/hooks/use-toast"

const CoordPicker = dynamic(
  () => import("@/components/map/coord-picker").then((m) => m.CoordPicker),
  { ssr: false, loading: () => <div className="w-full h-full flex items-center justify-center bg-slate-100 rounded-2xl"><Loader2 className="size-6 animate-spin text-slate-400" /></div> }
)

export default function SupplierShopPage() {
  const { toast } = useToast()
  const [isSaving, setIsSaving] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)

  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [bio, setBio] = React.useState("")
  const [lat, setLat] = React.useState<number | null>(null)
  const [lng, setLng] = React.useState<number | null>(null)
  const [businessName, setBusinessName] = React.useState("")
  const [status, setStatus] = React.useState("draft")
  const [productCount, setProductCount] = React.useState(0)

  React.useEffect(() => {
    import("@/lib/api-client").then(({ api }) => {
      api.get<any>("/suppliers/me/profile")
        .then((data) => {
          if (data) {
            setPhone(data.phone ?? "")
            setEmail(data.email ?? "")
            setBio(data.description ?? "")
            setLat(data.lat)
            setLng(data.lng)
            setBusinessName(data.businessName ?? "")
            setStatus(data.status ?? "draft")
            setProductCount(data.productCount ?? 0)
          }
        })
        .catch(() => {})
        .finally(() => setIsLoading(false))
    })
  }, [])

  const handleCoordChange = (newLat: number, newLng: number) => {
    setLat(newLat)
    setLng(newLng)
  }

  const handleGetLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude)
        setLng(pos.coords.longitude)
      },
      () => toast({ title: "Tidak dapat mengakses lokasi", variant: "destructive" }),
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const { api } = await import("@/lib/api-client")
      await api.patch("/suppliers/me/profile", {
        phone: phone || undefined,
        email: email || undefined,
        description: bio || undefined,
        lat: lat ?? undefined,
        lng: lng ?? undefined,
      })
      toast({
        title: "Profil Toko Diperbarui",
        description: lat !== null
          ? `Koordinat (${lat.toFixed(5)}, ${lng?.toFixed(5)}) disimpan.`
          : "Data etalase Anda berhasil disimpan.",
      })
    } catch {
      toast({ title: "Gagal menyimpan profil", variant: "destructive" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="size-8 animate-spin text-slate-300" />
      </div>
    )
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
                <Label className="font-bold text-xs uppercase tracking-widest text-slate-500">Nama Toko / PT</Label>
                <Input value={businessName} disabled className="bg-slate-50 font-semibold" />
                <p className="text-[10px] text-muted-foreground italic">* Nama entitas tidak dapat diubah (sesuai NIB/Registrasi).</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio" className="font-bold text-xs uppercase tracking-widest text-slate-500">Biodata Perusahaan</Label>
                <Textarea
                  id="bio"
                  placeholder="Ceritakan tentang kapasitas produksi, pengalaman, dan komitmen kualitas Anda..."
                  className="min-h-[150px] rounded-xl resize-none"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="phone" className="font-bold text-xs uppercase tracking-widest text-slate-500">No. WhatsApp Bisnis</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      className="pl-10 rounded-xl"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-slate-500">Email Operasional</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      className="pl-10 rounded-xl"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
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
              <div className="aspect-video rounded-2xl overflow-hidden border-2 border-slate-200 relative">
                <CoordPicker lat={lat} lng={lng} onChange={handleCoordChange} />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Latitude</Label>
                    <Input
                      value={lat !== null ? lat.toFixed(6) : ""}
                      readOnly
                      placeholder="Klik peta untuk mengatur"
                      className="rounded-xl h-9 text-xs font-mono bg-slate-50"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Longitude</Label>
                    <Input
                      value={lng !== null ? lng.toFixed(6) : ""}
                      readOnly
                      placeholder="—"
                      className="rounded-xl h-9 text-xs font-mono bg-slate-50"
                    />
                  </div>
                </div>
                <div className="pt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGetLocation}
                    className="rounded-xl font-bold text-xs h-9 gap-1.5 shrink-0"
                  >
                    <Navigation className="size-3.5" />
                    Lokasi Saya
                  </Button>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100">
                <Info className="size-5 text-blue-500 shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                  Klik pada peta atau seret marker untuk mengatur titik koordinat gudang. Koordinat yang akurat membantu Vendor menemukan toko Anda lebih cepat.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
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
              <div className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group">
                <UploadCloud className="size-10 text-slate-300 group-hover:text-primary transition-colors" />
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-500">Upload Foto Toko</p>
                  <p className="text-[11px] text-muted-foreground">JPG atau PNG, maks 5MB</p>
                </div>
                <Button variant="outline" size="sm" className="rounded-full font-bold gap-2">
                  <Camera className="size-4" /> Pilih Foto
                </Button>
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
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-2xl border-l-4 border-l-primary">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">Status Etalase</span>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-900">
                  {status === "verified" ? "Aktif & Terverifikasi" :
                   status === "pending_review" ? "Menunggu Verifikasi" :
                   status === "suspended" ? "Disuspend" : "Draft"}
                </p>
                <p className="text-xs text-muted-foreground font-medium italic">
                  {status === "verified"
                    ? "Profil Anda saat ini dapat ditemukan oleh Vendor dalam radius 50km."
                    : "Profil Anda sedang dalam proses verifikasi oleh tim BGN."}
                </p>
              </div>
              <Separator />
              <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                <span>Produk Aktif</span>
                <span className="text-slate-900">{productCount} Produk</span>
              </div>
              {status === "verified" && (
                <div className="flex items-center gap-2 text-emerald-600">
                  <CheckCircle2 className="size-4" />
                  <span className="text-xs font-bold">Terverifikasi BGN</span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
