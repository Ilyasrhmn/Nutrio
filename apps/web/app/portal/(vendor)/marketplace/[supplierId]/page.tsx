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
  CheckCircle2,
  Package,
  Plus,
  Bookmark,
  X,
  Send,
  Trash2,
  ShoppingCart,
  LayoutDashboard,
  Check,
  FileBadge,
  Loader2,
  Phone,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Input } from "@workspace/ui/components/input"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"

interface SupplierProduct {
  id: string
  name: string
  category: string
  unit: string
  price_per_unit: string | null
  min_order_qty: string
  stock_available: string | null
  has_halal_label: boolean
  avg_rating: string | null
  total_orders: number
  photo_url: string | null
}

interface SupplierReview {
  id: string
  rating_overall: number
  review_text: string | null
  created_at: string
  vendor_name: string
}

interface SupplierDocument {
  id: string
  doc_type: string
  doc_number: string | null
  file_url: string
  issued_at: string | null
  expires_at: string | null
}

interface SupplierDetail {
  id: string
  business_name: string
  supplier_type: string
  owner_name: string
  phone: string
  email: string | null
  website: string | null
  address_street: string
  address_city: string
  address_province: string
  description: string | null
  has_halal_cert: boolean
  has_bpom_cert: boolean
  has_organic_cert: boolean
  avg_rating: string | null
  total_reviews: number
  on_time_rate: string | null
  total_pos_completed: number
  verified_at: string | null
  products: SupplierProduct[]
  reviews: SupplierReview[]
  documents: SupplierDocument[]
}

const SUPPLIER_TYPE_LABEL: Record<string, string> = {
  petani: 'Petani / Kelompok Tani',
  distributor: 'Distributor',
  koperasi: 'Koperasi',
  fmcg: 'Perusahaan FMCG',
}

const DOC_TYPE_LABEL: Record<string, string> = {
  nib: 'NIB',
  halal_cert: 'Sertifikat Halal',
  bpom_cert: 'Sertifikat BPOM',
  npwp: 'NPWP',
  sni_cert: 'Sertifikat SNI',
  organic_cert: 'Sertifikat Organik',
}

interface CartItem extends SupplierProduct {
  qty: number
}

export default function SupplierMarketplacePage({ params }: { params: { supplierId: string } }) {
  const [activeNav, setActiveNav] = React.useState<'direktori' | 'pengadaan'>('direktori')
  const [supplier, setSupplier] = React.useState<SupplierDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [cart, setCart] = React.useState<CartItem[]>([])
  const [isContactSaved, setIsContactSaved] = React.useState(false)
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [addedItems, setAddedItems] = React.useState<string[]>([])
  const [chatMessages, setChatMessages] = React.useState<{ id: string; from: 'me' | 'supplier'; text: string; time: Date }[]>([])
  const [chatInput, setChatInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const chatBottomRef = React.useRef<HTMLDivElement>(null)

  const { toast } = useToast()

  React.useEffect(() => {
    import("@/lib/api-client").then(({ api }) => {
      api.get<SupplierDetail>(`/suppliers/${params.supplierId}`)
        .then((r) => setSupplier(r))
        .catch(() => setSupplier(null))
        .finally(() => setLoading(false))
    })
  }, [params.supplierId])

  const addToCart = (product: SupplierProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      return [...prev, { ...product, qty: 1 }]
    })
    setAddedItems(prev => [...prev, product.id])
    setTimeout(() => setAddedItems(prev => prev.filter(id => id !== product.id)), 2000)
    toast({ title: "Ditambahkan", description: `${product.name} masuk ke keranjang pengadaan.` })
  }

  const removeFromCart = (id: string) => setCart(prev => prev.filter(item => item.id !== id))

  const totalEstimasi = cart.reduce((acc, item) => {
    const price = item.price_per_unit ? parseFloat(item.price_per_unit) : 0
    return acc + price * item.qty
  }, 0)

  const AUTO_REPLIES = [
    "Halo! Terima kasih sudah menghubungi kami. Ada yang bisa kami bantu? 😊",
    "Untuk pemesanan dalam jumlah besar, kami bisa berikan harga khusus. Bisa minta info lebih lanjut?",
    "Pengiriman biasanya kami lakukan H+1 setelah PO dikonfirmasi. Mau tahu jadwal lebih detail?",
    "Produk kami selalu segar karena langsung dari sumber. Ada produk spesifik yang ingin ditanyakan?",
  ]

  React.useEffect(() => {
    if (isChatOpen && chatMessages.length === 0 && supplier) {
      setTimeout(() => {
        setChatMessages([{
          id: "welcome",
          from: "supplier",
          text: `Halo! Selamat datang di ${supplier.business_name}. Ada yang bisa kami bantu hari ini? 😊`,
          time: new Date(),
        }])
      }, 500)
    }
  }, [isChatOpen, supplier])

  React.useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [chatMessages, isTyping])

  const sendChatMessage = () => {
    const text = chatInput.trim()
    if (!text) return
    const msg = { id: Date.now().toString(), from: "me" as const, text, time: new Date() }
    setChatMessages(prev => [...prev, msg])
    setChatInput("")
    setIsTyping(true)
    setTimeout(() => {
      setIsTyping(false)
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]!
      setChatMessages(prev => [...prev, { id: Date.now().toString(), from: "supplier", text: reply, time: new Date() }])
    }, 1200 + Math.random() * 800)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Store className="size-12 text-slate-200" />
        <p className="font-bold text-slate-500">Supplier tidak ditemukan</p>
        <Link href="/portal/marketplace">
          <Button variant="outline">Kembali ke Direktori</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20 relative">
      {/* Top Navigation Bar */}
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
              Profil Supplier
            </Button>
            <Button
              variant="ghost"
              onClick={() => setActiveNav('pengadaan')}
              className={cn(
                "px-4 font-bold text-sm h-16 rounded-none border-b-2 transition-all flex items-center gap-2",
                activeNav === 'pengadaan' ? "border-primary text-primary" : "border-transparent text-slate-500"
              )}
            >
              Keranjang Pengadaan
              {cart.length > 0 && (
                <Badge className="bg-primary text-primary-foreground h-5 min-w-5 flex items-center justify-center p-0 text-[10px] font-black rounded-full">
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
        {/* VIEW A: SUPPLIER DETAIL */}
        {activeNav === 'direktori' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Link href="/portal/marketplace">
              <Button variant="ghost" className="gap-2 text-slate-500 hover:text-primary font-bold -ml-2">
                <ArrowLeft className="size-4" />
                Kembali ke Direktori
              </Button>
            </Link>

            {/* Supplier Header Card */}
            <Card className="border-border bg-card shadow-xl rounded-[32px] overflow-hidden">
              <CardContent className="p-8 md:p-10 flex flex-col md:flex-row gap-8 items-start md:items-center">
                <div className="size-32 rounded-3xl bg-slate-100 flex items-center justify-center border border-slate-200 shrink-0 shadow-inner">
                  <Store className="size-16 text-slate-300" />
                </div>

                <div className="flex-1 space-y-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-3">
                      <h1 className="text-3xl font-black text-slate-900 tracking-tight">{supplier.business_name}</h1>
                      <Badge className="bg-emerald-500 text-white border-none font-bold text-[10px] px-3 h-6">MITRA TERVERIFIKASI</Badge>
                    </div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                      {SUPPLIER_TYPE_LABEL[supplier.supplier_type] ?? supplier.supplier_type}
                    </p>
                    {supplier.description && (
                      <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed text-sm">
                        {supplier.description}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3 items-center">
                    <span className="text-xs text-slate-500 flex items-center gap-1.5">
                      <MapPin className="size-3.5 text-primary" />
                      {supplier.address_city}, {supplier.address_province}
                    </span>
                    {supplier.phone && (
                      <span className="text-xs text-slate-500 flex items-center gap-1.5">
                        <Phone className="size-3.5 text-slate-400" />
                        {supplier.phone}
                      </span>
                    )}
                    {supplier.avg_rating && (
                      <span className="text-xs text-amber-600 font-bold flex items-center gap-1">
                        <Star className="size-3.5 fill-amber-400 text-amber-400" />
                        {parseFloat(supplier.avg_rating).toFixed(1)} ({supplier.total_reviews} ulasan)
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {supplier.has_halal_cert && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-200 font-bold text-[10px] px-3 py-1 gap-1.5">
                        <CheckCircle2 className="size-3" /> Halal Certified
                      </Badge>
                    )}
                    {supplier.has_bpom_cert && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 font-bold text-[10px] px-3 py-1 gap-1.5">
                        <CheckCircle2 className="size-3" /> BPOM
                      </Badge>
                    )}
                    {supplier.has_organic_cert && (
                      <Badge variant="outline" className="bg-lime-50 text-lime-600 border-lime-200 font-bold text-[10px] px-3 py-1 gap-1.5">
                        <CheckCircle2 className="size-3" /> Organik
                      </Badge>
                    )}
                    {supplier.on_time_rate && (
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-600 border-indigo-200 font-bold text-[10px] px-3 py-1">
                        {parseFloat(supplier.on_time_rate).toFixed(0)}% On-Time
                      </Badge>
                    )}
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
                    {isContactSaved ? <><Check className="size-4" /> Tersimpan</> : <><Bookmark className="size-4" /> Simpan Kontak</>}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <Tabs defaultValue="katalog" className="w-full">
              <TabsList className="h-14 bg-white border border-slate-200 rounded-2xl p-1.5 gap-2 max-w-max px-4 shadow-sm">
                <TabsTrigger value="katalog" className="rounded-xl px-6 font-bold text-sm h-full data-[state=active]:bg-primary data-[state=active]:text-white">
                  Katalog ({supplier.products.length})
                </TabsTrigger>
                <TabsTrigger value="ulasan" className="rounded-xl px-6 font-bold text-sm h-full data-[state=active]:bg-primary data-[state=active]:text-white">
                  Ulasan ({supplier.total_reviews})
                </TabsTrigger>
                <TabsTrigger value="legalitas" className="rounded-xl px-6 font-bold text-sm h-full data-[state=active]:bg-primary data-[state=active]:text-white">
                  Legalitas ({supplier.documents.length})
                </TabsTrigger>
              </TabsList>

              {/* Katalog */}
              <TabsContent value="katalog" className="mt-8">
                {supplier.products.length === 0 ? (
                  <div className="flex flex-col items-center py-16 gap-3 text-muted-foreground">
                    <Package className="size-10 opacity-20" />
                    <p className="text-sm font-medium">Belum ada produk aktif dari supplier ini</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {supplier.products.map((product) => (
                      <Card key={product.id} className="group overflow-hidden border-border bg-card hover:shadow-lg transition-all duration-300 rounded-3xl">
                        <div className="aspect-square w-full overflow-hidden relative bg-slate-50 flex items-center justify-center">
                          {product.photo_url ? (
                            <img src={product.photo_url} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <Package className="size-16 text-slate-200" />
                          )}
                          {product.has_halal_label && (
                            <Badge className="absolute top-2 right-2 bg-emerald-500 text-white text-[9px] font-black">Halal</Badge>
                          )}
                        </div>
                        <CardHeader className="pb-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{product.category}</p>
                          <CardTitle className="text-base font-bold text-slate-900">{product.name}</CardTitle>
                          {product.price_per_unit ? (
                            <p className="text-xl font-black text-primary mt-1">
                              Rp {parseFloat(product.price_per_unit).toLocaleString('id-ID')} / {product.unit}
                            </p>
                          ) : (
                            <p className="text-sm font-bold text-slate-400 mt-1">Harga: nego</p>
                          )}
                        </CardHeader>
                        <CardContent className="pb-4 space-y-1">
                          <div className="flex items-center gap-2 text-slate-500 text-[11px] font-bold">
                            <Package className="size-3.5 text-slate-400" />
                            Min. order: {parseFloat(product.min_order_qty).toLocaleString('id-ID')} {product.unit}
                          </div>
                          {product.stock_available && (
                            <p className="text-[11px] text-slate-400">
                              Stok: {parseFloat(product.stock_available).toLocaleString('id-ID')} {product.unit}
                            </p>
                          )}
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
                            {addedItems.includes(product.id) ? <><Check className="size-4" /> Ditambahkan</> : <><Plus className="size-4" /> Tambah ke Pengadaan</>}
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Ulasan */}
              <TabsContent value="ulasan" className="mt-8">
                <Card className="border-border bg-card rounded-3xl overflow-hidden shadow-sm">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <Star className="size-5 text-amber-500 fill-amber-500" />
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Ulasan dari Vendor MBG</h3>
                      {supplier.avg_rating && (
                        <Badge className="bg-amber-50 text-amber-700 border-amber-200 border font-black text-sm px-3">
                          {parseFloat(supplier.avg_rating).toFixed(1)} / 5
                        </Badge>
                      )}
                    </div>
                    {supplier.reviews.length === 0 ? (
                      <div className="flex flex-col items-center py-8 gap-3 text-muted-foreground">
                        <Star className="size-10 opacity-20" />
                        <p className="text-sm font-medium">Belum ada ulasan untuk supplier ini</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {supplier.reviews.map((review) => (
                          <div key={review.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
                            <div className="flex items-center justify-between">
                              <p className="font-bold text-slate-900 text-sm">{review.vendor_name}</p>
                              <div className="flex items-center gap-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} className={cn("size-3", i < review.rating_overall ? "fill-amber-400 text-amber-400" : "text-slate-200")} />
                                ))}
                              </div>
                            </div>
                            {review.review_text && (
                              <p className="text-sm text-slate-600 leading-relaxed">{review.review_text}</p>
                            )}
                            <p className="text-[10px] text-slate-400 font-bold">
                              {new Date(review.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Legalitas */}
              <TabsContent value="legalitas" className="mt-8">
                <Card className="border-border bg-card rounded-3xl overflow-hidden shadow-sm">
                  <CardContent className="p-8 space-y-6">
                    <div className="flex items-center gap-3">
                      <FileBadge className="size-5 text-primary" />
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Dokumen & Legalitas Terverifikasi</h3>
                    </div>
                    {supplier.documents.length === 0 ? (
                      <div className="flex flex-col items-center py-8 gap-3 text-muted-foreground">
                        <FileBadge className="size-10 opacity-20" />
                        <p className="text-sm font-medium">Belum ada dokumen terverifikasi</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {supplier.documents.map((doc) => (
                          <div key={doc.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start gap-4">
                            <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shrink-0">
                              <FileBadge className="size-5" />
                            </div>
                            <div className="space-y-1 min-w-0">
                              <p className="font-bold text-slate-900 text-sm">
                                {DOC_TYPE_LABEL[doc.doc_type] ?? doc.doc_type}
                              </p>
                              {doc.doc_number && (
                                <p className="text-[11px] text-slate-500 font-mono">{doc.doc_number}</p>
                              )}
                              {doc.expires_at && (
                                <p className="text-[10px] text-slate-400 font-bold">
                                  Berlaku s/d: {new Date(doc.expires_at).toLocaleDateString('id-ID')}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}

        {/* VIEW B: KERANJANG PENGADAAN */}
        {activeNav === 'pengadaan' && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="flex items-center gap-3">
              <div className="size-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <ShoppingCart className="size-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900">Keranjang Pengadaan B2B</h2>
                <p className="text-sm text-muted-foreground font-medium">Kelola daftar pesanan bahan baku.</p>
              </div>
            </div>

            {cart.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-200 bg-white rounded-3xl p-20 flex flex-col items-center text-center space-y-4 shadow-sm">
                <div className="size-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300">
                  <Package className="size-10" />
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-bold text-slate-900">Belum ada bahan baku ditambahkan</p>
                  <p className="text-sm text-slate-500 max-w-xs mx-auto">Tambahkan produk dari tab Katalog.</p>
                </div>
                <Button onClick={() => setActiveNav('direktori')} className="rounded-full px-8 font-black text-xs uppercase tracking-widest mt-4">
                  Lihat Katalog
                </Button>
              </Card>
            ) : (
              <Card className="border-border bg-card shadow-sm rounded-3xl overflow-hidden">
                <div className="p-6 space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center gap-6 group">
                      <div className="size-16 rounded-2xl bg-slate-100 flex items-center justify-center shrink-0">
                        {item.photo_url
                          ? <img src={item.photo_url} className="w-full h-full object-cover rounded-2xl" />
                          : <Package className="size-8 text-slate-300" />
                        }
                      </div>
                      <div className="flex-1 space-y-0.5">
                        <p className="font-bold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{supplier.business_name}</p>
                        {item.price_per_unit && (
                          <p className="text-sm font-black text-primary">
                            Rp {parseFloat(item.price_per_unit).toLocaleString('id-ID')} / {item.unit}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center bg-slate-50 rounded-full border border-slate-200 p-1">
                          <Button variant="ghost" size="icon" className="size-7 rounded-full"
                            onClick={() => {
                              if (item.qty > 1) setCart(prev => prev.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i))
                            }}
                          >-</Button>
                          <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                          <Button variant="ghost" size="icon" className="size-7 rounded-full"
                            onClick={() => setCart(prev => prev.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}
                          >+</Button>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.id)}
                          className="text-slate-300 hover:text-destructive hover:bg-destructive/5">
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-slate-50 p-8 flex flex-col md:flex-row items-center justify-between border-t border-border gap-6">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Estimasi</p>
                    <p className="text-3xl font-black text-slate-900">Rp {totalEstimasi.toLocaleString('id-ID')}</p>
                  </div>
                  <Button className="w-full md:w-auto h-14 rounded-2xl px-12 font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20">
                    Buat PO (Purchase Order)
                  </Button>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Floating Chat */}
      {isChatOpen && (
        <Card className="fixed bottom-6 right-6 w-80 sm:w-96 h-[520px] shadow-[0_20px_50px_rgba(0,0,0,0.15)] z-50 flex flex-col rounded-[24px] border-border overflow-hidden animate-in slide-in-from-right-4 duration-300">
          {/* Header */}
          <CardHeader className="bg-primary p-4 flex flex-row items-center justify-between shrink-0">
            <div className="flex items-center gap-3 text-primary-foreground">
              <div className="size-10 bg-white/20 rounded-xl flex items-center justify-center">
                <Store className="size-5" />
              </div>
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-black leading-none">{supplier.business_name}</CardTitle>
                <div className="flex items-center gap-1.5">
                  <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[10px] font-bold opacity-80 uppercase tracking-tighter">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {supplier.phone && (
                <a
                  href={`https://wa.me/${supplier.phone.replace(/^0/, "62").replace(/\D/g, "")}?text=Halo%20${encodeURIComponent(supplier.business_name)}%2C%20saya%20dari%20vendor%20MBG%20ingin%20bertanya%20mengenai%20produk%20Anda.`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-white/10 rounded-full" title="Buka WhatsApp">
                    <Phone className="size-4" />
                  </Button>
                </a>
              )}
              <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)} className="text-primary-foreground hover:bg-white/10 rounded-full">
                <X className="size-5" />
              </Button>
            </div>
          </CardHeader>

          {/* Messages */}
          <CardContent className="flex-1 p-3 overflow-y-auto bg-slate-50 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={cn("flex gap-2", msg.from === "me" ? "justify-end" : "justify-start")}>
                {msg.from === "supplier" && (
                  <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-auto">
                    <Store className="size-3.5 text-primary" />
                  </div>
                )}
                <div className={cn(
                  "max-w-[78%] rounded-2xl px-3 py-2 text-xs leading-relaxed",
                  msg.from === "me"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-white border border-slate-100 text-slate-700 rounded-bl-sm shadow-sm"
                )}>
                  <p>{msg.text}</p>
                  <p className={cn("text-[9px] mt-1 text-right", msg.from === "me" ? "opacity-70" : "text-slate-400")}>
                    {msg.time.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-2 justify-start">
                <div className="size-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Store className="size-3.5 text-primary" />
                </div>
                <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                  <div className="flex gap-1 items-center h-3">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className="size-1.5 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: `${i * 150}ms` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </CardContent>

          {/* Input */}
          <CardFooter className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="relative w-full flex items-center gap-2">
              <Input
                className="rounded-full bg-slate-50 border-slate-200 pr-12 text-xs h-11 focus-visible:ring-primary/30"
                placeholder="Ketik pesan..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendChatMessage() } }}
              />
              <Button
                size="icon"
                className="size-9 rounded-full absolute right-1 shadow-lg shadow-primary/20"
                onClick={sendChatMessage}
                disabled={!chatInput.trim()}
              >
                <Send className="size-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      )}
    </div>
  )
}
