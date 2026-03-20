"use client"

import * as React from "react"
import Link from "next/link"
import {
  MapPin,
  MessageSquare,
  Star,
  Store,
  ShieldCheck,
  ArrowLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Package,
  Plus,
  Bookmark,
  X,
  Send,
  Trash2,
  ShoppingCart,
  LayoutDashboard,
  Search,
  Check,
  FileText,
  FileBadge
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Separator } from "@workspace/ui/components/separator"
import { Input } from "@workspace/ui/components/input"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"

interface Product {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  stock: string;
  image: string;
}

export default function SupplierMarketplacePage({ params }: { params: { supplierId: string } }) {
  // --- STATE MANAGEMENT ---
  const [activeNav, setActiveNav] = React.useState<'direktori' | 'katalog_publik' | 'pengadaan'>('direktori')
  const [cart, setCart] = React.useState<(Product & { qty: number })[]>([])
  const [isContactSaved, setIsContactSaved] = React.useState(false)
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [addedItems, setAddedItems] = React.useState<number[]>([])

  const { toast } = useToast()

  const products: Product[] = [
    {
      id: 1,
      name: "Ayam Fillet Dada (Per Kg)",
      price: "Rp 38.000",
      priceNum: 38000,
      stock: "Kapasitas 500 Kg/hari",
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Ayam Paha Bawah (Per Kg)",
      price: "Rp 35.000",
      priceNum: 35000,
      stock: "Kapasitas 300 Kg/hari",
      image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Hati Ampela Ayam (Pack)",
      price: "Rp 15.000",
      priceNum: 15000,
      stock: "Kapasitas 100 Pack/hari",
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=400&auto=format&fit=crop"
    }
  ]

  // --- HANDLERS ---
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { ...product, qty: 1 }]
    })

    setAddedItems(prev => [...prev, product.id])
    setTimeout(() => {
      setAddedItems(prev => prev.filter(id => id !== product.id))
    }, 2000)

    toast({
      title: "Berhasil Ditambahkan",
      description: `${product.name} telah masuk ke keranjang pengadaan.`,
    })
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const totalEstimasi = cart.reduce((acc, item) => acc + (item.priceNum * item.qty), 0)

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 relative">
      {/* 1. SINGLE TOP NAVIGATION BAR */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white px-6 h-16 flex items-center justify-between shadow-sm rounded-b-2xl">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
              <ShieldCheck className="size-5" />
            </div>
            <span className="font-bold text-lg text-slate-900">Nutrio <span className="text-primary">Market</span></span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            <Button
              variant="ghost"
              onClick={() => setActiveNav('direktori')}
              className={cn(
                "px-4 font-bold text-sm h-16 rounded-none border-b-2 transition-all",
                activeNav === 'direktori' ? "border-primary text-primary" : "border-transparent text-slate-500"
              )}
            >
              Direktori Supplier
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveNav('katalog_publik')}
              className={cn(
                "px-4 font-bold text-sm h-16 rounded-none border-b-2 transition-all",
                activeNav === 'katalog_publik' ? "border-primary text-primary" : "border-transparent text-slate-500"
              )}
            >
              Katalog Publik
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveNav('pengadaan')}
              className={cn(
                "px-4 font-bold text-sm h-16 rounded-none border-b-2 transition-all flex items-center gap-2",
                activeNav === 'pengadaan' ? "border-primary text-primary" : "border-transparent text-slate-500"
              )}
            >
              Pengadaan Saya
              {cart.length > 0 && (
                <Badge className="bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center p-0 text-[10px] font-black rounded-full animate-in zoom-in duration-300">
                  {cart.length}
                </Badge>
              )}
            </Button>
          </div>
        </div>

        <Link href="/portal">
          <Button variant="ghost" size="sm" className="gap-2 font-bold text-slate-600 hover:text-primary transition-colors">
            <LayoutDashboard className="size-4" />
            Dashboard
          </Button>
        </Link>
      </nav>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* 2. VIEW A: SUPPLIER DETAIL */}
        {activeNav === 'direktori' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Link href="/portal/marketplace">
              <Button variant="ghost" className="gap-2 text-slate-500 hover:text-primary font-bold -ml-2">
                <ArrowLeft className="size-4" />
                Kembali ke Direktori
              </Button>
            </Link>

            <Card className="border-border bg-card shadow-xl rounded-[32px] overflow-hidden">
              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="size-32 rounded-3xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 overflow-hidden shadow-inner">
                  <Store className="size-16 text-slate-300" />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <h1 className="text-3xl font-black text-slate-900 tracking-tight">PT Tani Makmur Sejahtera</h1>
                      <Badge className="bg-emerald-500 text-white border-none font-bold text-[10px] px-3 h-6">OFFICIAL PARTNER</Badge>
                    </div>
                    <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed text-sm">
                      Pemasok utama daging ayam potong segar terstandarisasi untuk area Yogyakarta. Kami menjamin kualitas higienis dengan pemotongan sesuai syariat.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200 font-bold text-[10px] px-3 py-1">NKV: 3404-11-2025</Badge>
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold text-[10px] px-3 py-1 gap-1.5">
                      <CheckCircle2 className="size-3" />
                      Halal MUI
                    </Badge>
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10 font-bold text-[10px] px-3 py-1">Akurasi Pengiriman: 98%</Badge>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full md:w-[240px]">
                  <Button
                    onClick={() => setIsChatOpen(true)}
                    className="w-full h-14 rounded-2xl font-black shadow-lg shadow-primary/20 gap-3 text-sm"
                  >
                    <MessageSquare className="size-5" />
                    Chat & Nego Supplier
                  </Button>
                  <Button
                    variant={isContactSaved ? "default" : "outline"}
                    onClick={() => setIsContactSaved(!isContactSaved)}
                    className={cn(
                      "w-full h-12 rounded-2xl font-bold gap-2 text-sm transition-all",
                      isContactSaved ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none shadow-lg shadow-emerald-100" : "border-slate-200"
                    )}
                  >
                    {isContactSaved ? (
                      <><Check className="size-4" /> Tersimpan</>
                    ) : (
                      <><Bookmark className="size-4" /> Simpan Kontak</>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Tabs defaultValue="katalog" className="w-full">
              <TabsList className="h-14 bg-white border border-slate-200 rounded-2xl p-1.5 gap-2 max-w-max px-4 shadow-sm">
                <TabsTrigger value="katalog" className="rounded-xl px-6 font-bold text-sm h-full data-[state=active]:bg-primary data-[state=active]:text-white">Katalog Produk</TabsTrigger>
                <TabsTrigger value="ulasan" className="rounded-xl px-6 font-bold text-sm h-full data-[state=active]:bg-primary data-[state=active]:text-white">Ulasan & Penilaian</TabsTrigger>
                <TabsTrigger value="legalitas" className="rounded-xl px-6 font-bold text-sm h-full data-[state=active]:bg-primary data-[state=active]:text-white">Info Legalitas</TabsTrigger>
              </TabsList>

              {/* Katalog Tab Content */}
              <TabsContent value="katalog" className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Card key={product.id} className="group overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300 rounded-3xl">
                      <div className="aspect-square w-full overflow-hidden relative bg-slate-50">
                        <img src={product.image} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                      </div>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base font-bold text-slate-900">{product.name}</CardTitle>
                        <p className="text-xl font-black text-primary mt-1">{product.price}</p>
                      </CardHeader>
                      <CardContent className="pb-4">
                        <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold">
                          <Package className="size-3.5 text-slate-400" />
                          {product.stock}
                        </div>
                      </CardContent>
                      <CardFooter className="p-4 pt-0">
                        <Button
                          variant="outline"
                          onClick={() => addToCart(product)}
                          className={cn(
                            "w-full rounded-xl font-bold text-xs h-10 gap-2 border-slate-200 transition-all",
                            addedItems.includes(product.id) ? "bg-emerald-500 text-white border-emerald-500" : "hover:bg-primary hover:text-white hover:border-primary"
                          )}
                        >
                          {addedItems.includes(product.id) ? (
                            <><Check className="size-4" /> Ditambahkan</>
                          ) : (
                            <><Plus className="size-4" /> Tambah ke Pengadaan</>
                          )}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              {/* Ulasan Tab Content */}
              <TabsContent value="ulasan" className="mt-8">
                <Card className="border-border bg-card rounded-3xl overflow-hidden shadow-sm">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <Star className="size-5 text-amber-500 fill-amber-500" />
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Ulasan Pembeli</h3>
                    </div>
                    <div className="space-y-4">
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-indigo-100 text-indigo-600 text-[10px] font-black">IB</AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-bold text-slate-900">Dapur Ibu Budi</p>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">Bintang 5</Badge>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                          "Kualitas daging segar, pengiriman selalu jam 4 pagi. Sangat membantu operasional dapur kami yang harus mulai masak dini hari."
                        </p>
                      </div>
                      <div className="p-6 rounded-2xl bg-slate-50 border border-slate-100 space-y-3 opacity-70">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar className="size-8">
                              <AvatarFallback className="bg-amber-100 text-amber-600 text-[10px] font-black">DN</AvatarFallback>
                            </Avatar>
                            <p className="text-sm font-bold text-slate-900">Dapur Nusantara</p>
                          </div>
                          <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">Bintang 5</Badge>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed italic">
                          "Produk sesuai standar BGN, respon chat cepat dan sangat kooperatif."
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Legalitas Tab Content */}
              <TabsContent value="legalitas" className="mt-8">
                <Card className="border-border bg-card rounded-3xl overflow-hidden shadow-sm">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <FileBadge className="size-5 text-primary" />
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Dokumen & Legalitas</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nomor Induk Berusaha</p>
                        <p className="text-sm font-bold text-slate-900">1234567890123</p>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]">VALID (OSS)</Badge>
                      </div>
                      <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sertifikat Halal</p>
                        <p className="text-sm font-bold text-slate-900">ID3111000012345</p>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]">VALID (MUI)</Badge>
                      </div>
                      <div className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Pajak</p>
                        <p className="text-sm font-bold text-slate-900">NPWP Terdaftar</p>
                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]">AKTIF</Badge>
                      </div>
                    </div>
                    <Alert className="bg-blue-50 border-blue-100 rounded-2xl">
                      <Info className="size-4 text-blue-600" />
                      <AlertDescription className="text-blue-700 text-xs font-medium">
                        Supplier ini telah melalui verifikasi lapangan oleh Inspektur BGN pada 12 Januari 2026.
                      </AlertDescription>
                    </Alert>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* 3. VIEW B: PENGADAAN SAYA (CART) */}
        {activeNav === 'pengadaan' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ShoppingCart className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Keranjang Pengadaan B2B</h2>
                <p className="text-sm text-muted-foreground font-medium">Kelola daftar pesanan bahan baku dari berbagai supplier.</p>
              </div>
            </div>

            {cart.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-200 bg-white rounded-3xl p-20 flex flex-col items-center text-center space-y-4 shadow-sm">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Package className="size-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-slate-900">Belum ada bahan baku yang ditambahkan</p>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">Silakan jelajahi direktori supplier untuk mencari kebutuhan dapur Anda.</p>
                </div>
                <Button onClick={() => setActiveNav('direktori')} className="rounded-full px-8 font-black text-xs uppercase tracking-widest mt-4">Cari Supplier</Button>
              </Card>
            ) : (
              <div className="space-y-6">
                <Card className="border-border bg-card shadow-sm rounded-3xl overflow-hidden">
                  <div className="p-6 space-y-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center gap-6 group">
                        <div className="size-20 rounded-2xl overflow-hidden shrink-0">
                          <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500 font-medium">PT Tani Makmur Sejahtera</p>
                          <p className="text-sm font-black text-primary">{item.price}</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center bg-slate-50 rounded-full border border-slate-200 p-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full h-8 w-8"
                              onClick={() => {
                                if (item.qty > 1) {
                                  setCart(prev => prev.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i))
                                }
                              }}
                            >
                              -
                            </Button>
                            <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-8 rounded-full h-8 w-8"
                              onClick={() => {
                                setCart(prev => prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))
                              }}
                            >
                              +
                            </Button>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFromCart(item.id)}
                            className="text-slate-300 hover:text-destructive hover:bg-destructive/5"
                          >
                            <Trash2 className="size-5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-slate-50 p-8 flex flex-col md:flex-row items-center justify-between border-t border-border gap-6">
                    <div className="text-center md:text-left space-y-1">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimasi</p>
                      <p className="text-3xl font-black text-slate-900">Rp {totalEstimasi.toLocaleString()}</p>
                    </div>
                    <Button className="w-full md:w-auto h-14 rounded-2xl px-12 font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20">
                      Buat PO (Purchase Order)
                    </Button>
                  </div>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* 4. VIEW C: KATALOG PUBLIK */}
        {activeNav === 'katalog_publik' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Publik Global</h2>
                <p className="text-muted-foreground font-medium mt-1">Jelajahi produk dari semua supplier tervalidasi nasional.</p>
              </div>
              <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input className="pl-10 h-12 bg-white rounded-full border-slate-200 shadow-sm" placeholder="Cari komoditas atau merk..." />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 opacity-60">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <Card key={i} className="border-border bg-card rounded-[24px] aspect-square flex flex-col items-center justify-center text-slate-300 gap-3 border-2 border-dashed">
                  <Package className="size-12" />
                  <span className="text-[10px] font-black uppercase tracking-widest">Product Placeholder</span>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 5. FLOATING COMPONENT: CHAT UI */}
      {isChatOpen && (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-[500px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 flex flex-col rounded-[24px] border-border overflow-hidden animate-in slide-in-from-right-4 duration-300">
          <CardHeader className="bg-primary p-4 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3 text-primary-foreground">
              <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="size-5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-black leading-none">PT Tani Makmur Sejahtera</CardTitle>
                <div className="flex items-center gap-1.5">
                  <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Online</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsChatOpen(false)}
              className="text-primary-foreground hover:bg-white/10 rounded-full"
            >
              <X className="size-5" />
            </Button>
          </CardHeader>

          <CardContent className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
            <div className="flex flex-col items-center py-4 space-y-2">
              <Badge variant="outline" className="bg-white text-[10px] text-slate-400 font-bold border-slate-100">HARI INI</Badge>
            </div>

            <div className="flex gap-2 max-w-[85%]">
              <Avatar className="size-8 shrink-0">
                <AvatarFallback className="text-[8px] font-black">TM</AvatarFallback>
              </Avatar>
              <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm">
                <p className="text-xs text-slate-700 leading-relaxed font-medium">Halo, selamat siang. Ada yang bisa kami bantu untuk pengadaan stok ayam Dapur SPPG Anda besok?</p>
                <p className="text-[9px] text-slate-400 font-bold mt-1 text-right">14:02</p>
              </div>
            </div>

            <div className="flex gap-2 max-w-[85%] self-end flex-row-reverse ml-auto">
              <div className="bg-primary p-3 rounded-2xl rounded-tr-none text-primary-foreground shadow-lg shadow-primary/10">
                <p className="text-xs leading-relaxed font-medium">Siang, Pak. Untuk stok ayam fillet dada bisa nego harga kalau kami ambil rutin 50kg per hari?</p>
                <p className="text-[9px] opacity-70 font-bold mt-1">14:05</p>
              </div>
            </div>
          </CardContent>

          <CardFooter className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="relative w-full flex items-center gap-2">
              <Input className="rounded-full bg-slate-50 border-slate-200 pr-12 text-xs h-11" placeholder="Ketik pesan..." />
              <Button size="icon" className="size-9 rounded-full absolute right-1 shadow-lg shadow-primary/20">
                <Send className="size-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
