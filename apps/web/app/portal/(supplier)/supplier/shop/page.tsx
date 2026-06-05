"use client"

import * as React from "react"
import { 
  Building, 
  MapPin, 
  Phone, 
  Mail, 
  UploadCloud, 
  Camera, 
  ShieldCheck,
  Save,
  Navigation,
  Globe,
  Star,
  Eye,
  Store
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Separator } from "@workspace/ui/components/separator"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { cn } from "@workspace/ui/lib/utils"

export default function SupplierShopPage() {
  const { toast } = useToast()
  
  const [shopData, setShopData] = React.useState({
    name: "PT Tani Makmur Sejahtera",
    tagline: "Distributor Bahan Pokok Terpercaya sejak 2010",
    address: "Jl. Pasar Induk Kramat Jati Blok C No. 45, Jakarta Timur",
    phone: "0812-3456-7890",
    email: "sales@tanimakmur.co.id",
    description: "Kami adalah pemasok utama sayur mayur, beras, dan daging ayam untuk area Jabodetabek. Memiliki armada logistik pendingin sendiri (cold chain) untuk memastikan kesegaran barang sampai ke Dapur Vendor.",
    radius: "50"
  })

  const handleSave = () => {
    toast({
      title: "Profil Diperbarui",
      description: "Data toko grosir Anda berhasil disimpan dan langsung terlihat oleh Vendor.",
      variant: "default",
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setShopData({ ...shopData, [e.target.name]: e.target.value })
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto min-h-screen">
      
      {/* Deep Orange Hero Banner (Vendor Style) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-900 via-orange-800 to-slate-900 shadow-sm border border-orange-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Store className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-orange-500/20 text-orange-100 border border-orange-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-orange-400 animate-pulse mr-2 inline-block" /> Store Builder
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Profil Bisnis B2B</h1>
            <p className="text-orange-100/80 text-sm max-w-xl leading-relaxed">
              Kelola identitas perusahaan Anda. Pantau secara *live* bagaimana Vendor BGN melihat profil grosir Anda di aplikasi mereka.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-3">
            <Button variant="outline" className="rounded-xl h-10 px-6 font-bold text-white border-white/20 hover:bg-white/10 hidden sm:flex bg-transparent transition-colors">
              Batal
            </Button>
            <Button onClick={handleSave} className="rounded-xl h-10 px-6 font-bold gap-2 bg-white text-orange-900 hover:bg-orange-50 shadow-sm transition-colors border border-white">
              <Save className="size-4" /> Simpan
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: Input Forms (Bento Style) */}
        <div className="xl:col-span-7 space-y-6">
          <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-inner">
                  <Building className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold tracking-tight text-slate-900">Identitas Perusahaan</CardTitle>
                  <CardDescription className="text-[11px] font-semibold text-slate-500 mt-0.5">Nama dan informasi dasar legalitas B2B.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              
              <div className="flex gap-4 items-center border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 hover:bg-slate-100/50 transition-colors cursor-pointer">
                <div className="size-16 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center relative group overflow-hidden shrink-0">
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center z-10">
                    <Camera className="size-4 text-white" />
                  </div>
                  <span className="text-xl font-bold text-slate-300">PT</span>
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-slate-900">Logo Perusahaan</h4>
                  <p className="text-[10px] font-semibold text-slate-500">Upload logo format PNG/JPG. Maks 2MB.</p>
                  <Button variant="outline" size="sm" className="mt-1 h-7 rounded-md text-[10px] font-bold border-slate-200">
                    <UploadCloud className="size-3 mr-1.5 text-slate-400" /> Pilih File
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Perusahaan / Toko</label>
                  <Input 
                    name="name"
                    value={shopData.name}
                    onChange={handleChange}
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-0 focus:border-slate-400 px-3 transition-colors" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Tagline Bisnis</label>
                  <Input 
                    name="tagline"
                    value={shopData.tagline}
                    onChange={handleChange}
                    className="h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-0 focus:border-slate-400 px-3 transition-colors" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Deskripsi Lengkap</label>
                  <Textarea 
                    name="description"
                    value={shopData.description}
                    onChange={handleChange}
                    className="min-h-[100px] rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-0 focus:border-slate-400 p-3 leading-relaxed resize-none transition-colors" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-none shadow-sm ring-1 ring-slate-200/60 rounded-2xl overflow-hidden">
            <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-inner">
                  <Navigation className="size-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold tracking-tight text-slate-900">Kontak & Logistik</CardTitle>
                  <CardDescription className="text-[11px] font-semibold text-slate-500 mt-0.5">Titik penjemputan dan cakupan logistik.</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5 space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No. Telepon / WhatsApp</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <Input 
                      name="phone"
                      value={shopData.phone}
                      onChange={handleChange}
                      className="pl-9 h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-0 focus:border-slate-400 transition-colors" 
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Bisnis</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                    <Input 
                      name="email"
                      value={shopData.email}
                      onChange={handleChange}
                      className="pl-9 h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-0 focus:border-slate-400 transition-colors" 
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Alamat Gudang Utama</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 size-3.5 text-slate-400" />
                  <Textarea 
                    name="address"
                    value={shopData.address}
                    onChange={handleChange}
                    className="pl-9 min-h-[60px] rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-0 focus:border-slate-400 p-3 resize-none transition-colors" 
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Radius Kirim (Logistik Mandiri)</label>
                  <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">{shopData.radius} KM</span>
                </div>
                <div className="h-24 bg-slate-100 rounded-lg relative overflow-hidden border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                  <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cartographer.png')]" />
                  <div className="absolute inset-0 flex items-center justify-center gap-2">
                    <div className="size-8 bg-slate-800 rounded-full flex items-center justify-center text-white relative z-10 shadow-sm">
                      <Globe className="size-4" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-600 mt-1 relative z-10">Atur Peta</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT COLUMN: Live Preview (Clean Mockup) */}
        <div className="xl:col-span-5 sticky top-24 pt-1">
          <div className="mb-3 flex items-center gap-2 px-1">
            <Eye className="size-4 text-slate-400" />
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Preview (Vendor App)</h3>
          </div>
          
          {/* Mockup Mobile Device Frame */}
          <div className="border-[6px] border-slate-800 rounded-[2.5rem] overflow-hidden bg-white relative aspect-[9/18] max-h-[700px] mx-auto w-full max-w-[340px]">
            {/* Notch */}
            <div className="absolute top-0 inset-x-0 h-5 bg-slate-800 rounded-b-2xl w-32 mx-auto z-50 flex items-center justify-center">
               <div className="h-1 w-8 rounded-full bg-slate-700" />
            </div>

            {/* App Content */}
            <div className="h-full w-full overflow-y-auto hide-scrollbar bg-slate-50 relative pb-8">
              {/* Cover Image */}
              <div className="h-32 bg-slate-800 relative">
                <Badge className="absolute top-6 right-3 bg-black/50 backdrop-blur text-white border-none font-bold text-[8px] uppercase tracking-widest flex items-center gap-1 px-2">
                  <ShieldCheck className="size-2.5 text-emerald-400" /> Verified
                </Badge>
              </div>

              {/* Profile Card */}
              <div className="px-3 -mt-8 relative z-10">
                <Card className="bg-white border border-slate-200 rounded-xl overflow-hidden p-3">
                  <div className="flex gap-3 items-start">
                    <div className="size-12 rounded-lg bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center text-sm font-bold text-slate-400">
                      PT
                    </div>
                    <div className="space-y-0.5">
                      <h2 className="text-sm font-bold text-slate-900 leading-tight">{shopData.name || 'Nama Perusahaan'}</h2>
                      <div className="flex items-center gap-1 text-orange-500">
                        <Star className="size-2.5 fill-orange-500" />
                        <span className="text-[9px] font-bold text-slate-700">4.9 <span className="text-slate-400 font-medium">(120 Ulasan)</span></span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-semibold line-clamp-1">{shopData.tagline}</p>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <p className="text-xs font-bold text-slate-900">12</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Produk</p>
                    </div>
                    <Separator orientation="vertical" className="h-6 bg-slate-100" />
                    <div className="flex flex-col items-center">
                      <p className="text-xs font-bold text-slate-900">98%</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">SLA Kirim</p>
                    </div>
                    <Separator orientation="vertical" className="h-6 bg-slate-100" />
                    <div className="flex flex-col items-center">
                      <p className="text-xs font-bold text-slate-900">15m</p>
                      <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Balas Chat</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Info Section */}
              <div className="p-3 space-y-3">
                <div className="space-y-1.5">
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-1">Tentang Kami</h3>
                  <p className="text-[10px] text-slate-600 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                    {shopData.description || 'Deskripsi belum diisi.'}
                  </p>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-1">Logistik</h3>
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex gap-2.5 items-start">
                      <MapPin className="size-3 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Titik Gudang</p>
                        <p className="text-[10px] font-semibold text-slate-700 mt-0.5">{shopData.address}</p>
                      </div>
                    </div>
                    <div className="flex gap-2.5 items-start">
                      <Truck className="size-3 text-slate-400 mt-0.5" />
                      <div>
                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Radius Mandiri</p>
                        <p className="text-[10px] font-semibold text-slate-700 mt-0.5">Maksimal {shopData.radius} KM</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-1">
                  <Button className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] h-8 rounded-lg">
                    Chat Supplier
                  </Button>
                  <Button variant="outline" className="flex-1 border-slate-200 text-slate-700 font-bold text-[10px] h-8 rounded-lg bg-white">
                    Lihat Produk
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Home Indicator */}
            <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-800/20 rounded-full z-50" />
          </div>
        </div>
      </div>
    </div>
  )
}

function Truck(props: any) {
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
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11h1" />
      <path d="M15 18H9" />
      <path d="M19 18h2a2 2 0 0 0 2-2v-3.6c0-1.2-.5-2.3-1.4-3.1L19 7h-5v11h1" />
      <circle cx="7" cy="18" r="2" />
      <circle cx="17" cy="18" r="2" />
    </svg>
  )
}
