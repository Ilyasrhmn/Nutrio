"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Package,
  ArrowLeft,
  Save,
  Plus,
  Info,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { useToast } from "@workspace/ui/hooks/use-toast"

export default function AddProductPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [name, setName] = React.useState("")
  const [category, setCategory] = React.useState("")
  const [description, setDescription] = React.useState("")
  const [price, setPrice] = React.useState("")
  const [unit, setUnit] = React.useState("kg")
  const [capacity, setCapacity] = React.useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !category || !unit) {
      toast({ title: "Lengkapi nama, kategori, dan satuan produk", variant: "destructive" })
      return
    }
    setIsSubmitting(true)
    try {
      const { api } = await import("@/lib/api-client")
      await api.post("/suppliers/me/products", {
        name: name.trim(),
        category,
        unit,
        description: description.trim() || undefined,
        pricePerUnit: price ? parseFloat(price) : undefined,
        stockAvailable: capacity ? parseFloat(capacity) : undefined,
      })
      toast({
        title: "Produk Berhasil Ditambahkan",
        description: "Produk baru Anda telah masuk ke katalog dan siap dilihat Vendor.",
      })
      router.push("/portal/supplier/products")
    } catch {
      toast({ title: "Gagal menyimpan produk", variant: "destructive" })
      setIsSubmitting(false)
    }
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl mx-auto">
      <div className="flex flex-col gap-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary font-bold text-xs uppercase tracking-widest transition-colors w-fit"
        >
          <ArrowLeft className="size-4" /> Kembali ke Katalog
        </button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tambah Produk Baru</h1>
            <p className="text-muted-foreground font-medium mt-1">Lengkapi detail bahan baku untuk menarik minat Vendor SPPG.</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-full px-6 font-bold">Batal</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting} className="rounded-full px-8 font-bold gap-2 shadow-lg shadow-primary/20">
              <Save className="size-4" /> {isSubmitting ? "Menyimpan..." : "Simpan Produk"}
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-8">
          <Card className="border-border shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-border/50 p-8">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                  <Package className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Informasi Produk</CardTitle>
                  <CardDescription>Detail nama, kategori, dan spesifikasi barang.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold text-xs uppercase tracking-widest text-slate-500">Nama Produk *</Label>
                  <Input
                    id="name"
                    placeholder="Misal: Ayam Broiler Segar"
                    className="rounded-xl h-11 border-slate-200"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category" className="font-bold text-xs uppercase tracking-widest text-slate-500">Kategori *</Label>
                  <Select value={category} onValueChange={setCategory} required>
                    <SelectTrigger className="rounded-xl h-11 border-slate-200">
                      <SelectValue placeholder="Pilih Kategori" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Daging & Unggas">Daging & Unggas</SelectItem>
                      <SelectItem value="Sayur & Buah">Sayur & Buah</SelectItem>
                      <SelectItem value="Sembako">Sembako</SelectItem>
                      <SelectItem value="Bumbu Dapur">Bumbu Dapur</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="font-bold text-xs uppercase tracking-widest text-slate-500">Deskripsi & Spesifikasi</Label>
                <Textarea
                  id="description"
                  placeholder="Ceritakan tentang grade, ukuran, standar kesegaran, atau jenis kemasan..."
                  className="min-h-[150px] rounded-xl resize-none border-slate-200"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price" className="font-bold text-xs uppercase tracking-widest text-slate-500">Harga Satuan (Rp)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rp</span>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      placeholder="Contoh: 32000"
                      className="pl-10 rounded-xl h-11 border-slate-200"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit" className="font-bold text-xs uppercase tracking-widest text-slate-500">Satuan *</Label>
                  <Select value={unit} onValueChange={setUnit} required>
                    <SelectTrigger className="rounded-xl h-11 border-slate-200">
                      <SelectValue placeholder="Pilih Satuan" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kg">Per Kilogram (kg)</SelectItem>
                      <SelectItem value="ton">Per Ton</SelectItem>
                      <SelectItem value="box">Per Box / Krat</SelectItem>
                      <SelectItem value="liter">Per Liter</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="p-8">
              <div className="flex items-center gap-3">
                <div className="size-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-600">
                  <Info className="size-5" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Ketersediaan Stok</CardTitle>
                  <CardDescription>Berapa kapasitas supply maksimal Anda setiap harinya?</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              <div className="space-y-2">
                <Label htmlFor="capacity" className="font-bold text-xs uppercase tracking-widest text-slate-500">Kapasitas Produksi Harian</Label>
                <Input
                  id="capacity"
                  type="number"
                  min="0"
                  placeholder="Contoh: 500"
                  className="rounded-xl h-11 border-slate-200"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
                <p className="text-[10px] text-muted-foreground">Dalam satuan yang dipilih di atas ({unit}).</p>
              </div>
            </CardContent>
          </Card>
        </form>

        {/* Side: Photo & Status */}
        <div className="space-y-8">
          <Card className="border-border shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-bold text-left">Foto Produk</CardTitle>
              <CardDescription className="text-left">Gunakan foto riil untuk meningkatkan kepercayaan Vendor.</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-4">
              <div className="border-2 border-dashed border-slate-200 rounded-2xl aspect-square flex flex-col items-center justify-center gap-3 group hover:border-primary/50 transition-all cursor-pointer bg-slate-50/50">
                <div className="size-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Plus className="size-6 text-slate-400 group-hover:text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-slate-900">Upload Foto Utama</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-black mt-1">PNG, JPG up to 5MB</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                <Info className="size-5 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                  Produk yang memiliki <span className="font-bold">Foto Riil</span> akan mendapatkan badge verifikasi otomatis dari sistem BGN.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm rounded-3xl border-l-4 border-l-primary overflow-hidden">
            <CardContent className="p-6 space-y-4">
              <h4 className="text-xs font-black uppercase tracking-widest text-primary">Status Publikasi</h4>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-900">Langsung Tampilkan?</span>
                <Badge className="bg-emerald-500 text-white border-none font-bold uppercase text-[10px]">Aktif</Badge>
              </div>
              <Separator />
              <p className="text-[10px] text-muted-foreground font-medium italic">
                Setelah disimpan, produk Anda akan langsung muncul di hasil pencarian Vendor SPPG yang terdekat dengan lokasi Anda.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
