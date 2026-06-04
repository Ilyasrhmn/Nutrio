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
  Search,
  Check,
  FileText,
  FileBadge,
  Clock,
  Truck,
  BadgeCheck,
  Heart,
  Minus,
  ThumbsUp,
  Home,
  Grid3X3,
  Users,
  Calendar,
  Verified,
  Phone,
  Mail,
  Globe,
  ChevronDown,
  SlidersHorizontal,
  Info
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"
import { Input } from "@workspace/ui/components/input"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { Separator } from "@workspace/ui/components/separator"

interface Product {
  id: number;
  name: string;
  price: string;
  priceNum: number;
  originalPrice?: string;
  stock: string;
  image: string;
  unit: string;
  minOrder: string;
  discount?: string;
  sold: string;
  rating: number;
}

export default function SupplierMarketplacePage({ params }: { params: { supplierId: string } }) {
  const [cart, setCart] = React.useState<(Product & { qty: number })[]>([])
  const [isContactSaved, setIsContactSaved] = React.useState(false)
  const [isChatOpen, setIsChatOpen] = React.useState(false)
  const [addedItems, setAddedItems] = React.useState<number[]>([])
  const [activeTab, setActiveTab] = React.useState<'katalog' | 'ulasan' | 'legalitas'>('katalog')
  const [showCart, setShowCart] = React.useState(false)
  const [chatMessages, setChatMessages] = React.useState<{ id: string; from: "me" | "supplier"; text: string; time: Date }[]>([])
  const [chatInput, setChatInput] = React.useState("")
  const [isTyping, setIsTyping] = React.useState(false)
  const chatBottomRef = React.useRef<HTMLDivElement>(null)

  const supplier = { business_name: "PT Tani Makmur Sejahtera" }

  const { toast } = useToast()

  const products: Product[] = [
    {
      id: 1,
      name: "Ayam Fillet Dada Segar Premium",
      price: "Rp 38.000",
      priceNum: 38000,
      originalPrice: "Rp 40.000",
      stock: "500 Kg/hari",
      unit: "/kg",
      minOrder: "Min. 10 Kg",
      discount: "5%",
      sold: "1.2rb+",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 2,
      name: "Ayam Paha Bawah Segar",
      price: "Rp 35.000",
      priceNum: 35000,
      stock: "300 Kg/hari",
      unit: "/kg",
      minOrder: "Min. 10 Kg",
      sold: "890+",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 3,
      name: "Hati Ampela Ayam Segar",
      price: "Rp 15.000",
      priceNum: 15000,
      stock: "100 Pack/hari",
      unit: "/pack",
      minOrder: "Min. 20 Pack",
      sold: "450+",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 4,
      name: "Sayap Ayam Potong Bersih",
      price: "Rp 28.000",
      priceNum: 28000,
      originalPrice: "Rp 30.000",
      stock: "200 Kg/hari",
      unit: "/kg",
      minOrder: "Min. 5 Kg",
      discount: "7%",
      sold: "670+",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1598103442097-8b74f0640e78?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: 5,
      name: "Daging Ayam Utuh Karkas",
      price: "Rp 42.000",
      priceNum: 42000,
      stock: "150 Ekor/hari",
      unit: "/ekor",
      minOrder: "Min. 10 Ekor",
      sold: "320+",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1501200291289-c5a76c232e5f?q=80&w=400&auto=format&fit=crop"
    }
  ]

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      return [...prev, { ...product, qty: 1 }]
    })
    setAddedItems(prev => [...prev, product.id])
    setTimeout(() => setAddedItems(prev => prev.filter(id => id !== product.id)), 2000)
    toast({ title: "Ditambahkan", description: `${product.name} masuk ke keranjang pengadaan.` })
  }

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
      const reply = AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)] ?? ""
      setChatMessages(prev => [...prev, { id: Date.now().toString(), from: "supplier" as const, text: reply, time: new Date() }])
      setIsTyping(false)
    }, 1500)
  }

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const totalEstimasi = cart.reduce((acc, item) => acc + (item.priceNum * item.qty), 0)
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0)

  return (
    <div className="min-h-screen bg-[#F0F3F7]">
      {/* ═══════════════════════════════════════════════════════ */}
      {/* TOP BAR — Minimal breadcrumb nav like Tokopedia */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 h-12 flex items-center justify-between">
          {/* Left: Breadcrumb */}
          <div className="flex items-center gap-2 text-xs">
            <Link href="/portal" className="text-slate-400 hover:text-primary transition-colors">
              <Home className="size-3.5" />
            </Link>
            <ChevronRight className="size-3 text-slate-300" />
            <Link href="/portal/marketplace" className="text-slate-400 hover:text-primary transition-colors font-medium">
              Marketplace
            </Link>
            <ChevronRight className="size-3 text-slate-300" />
            <span className="text-slate-700 font-semibold truncate max-w-[200px]">PT Tani Makmur Sejahtera</span>
          </div>

          {/* Right: Cart button */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCart(!showCart)}
              className="relative h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-primary gap-1.5"
            >
              <ShoppingCart className="size-4" />
              <span className="hidden sm:inline">Keranjang</span>
              {cart.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1 animate-in zoom-in duration-200">
                  {totalItems}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* STORE HEADER — Compact horizontal Tokopedia-style */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-slate-200/60">
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-5">
          <div className="flex items-start gap-4">
            {/* Store Avatar */}
            <div className="relative shrink-0">
              <div className="size-16 md:size-20 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 flex items-center justify-center shadow-lg shadow-rose-500/20">
                <Store className="size-8 md:size-10 text-white" />
              </div>
              <div className="absolute -bottom-1 -right-1 size-5 md:size-6 bg-emerald-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm">
                <Check className="size-2.5 md:size-3 text-white" />
              </div>
            </div>

            {/* Store Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base md:text-lg font-bold text-slate-900 truncate">PT Tani Makmur Sejahtera</h1>
                <Badge className="bg-primary/10 text-primary border-none font-bold text-[9px] px-1.5 h-4 gap-0.5">
                  <BadgeCheck className="size-2.5" />
                  Official
                </Badge>
              </div>

              {/* Stats row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="size-3 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-bold text-slate-800">4.8</span>
                  <span className="text-[10px] text-slate-400">(124 ulasan)</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Package className="size-3 text-slate-400" />
                  <span><b className="text-slate-700">18</b> Produk</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <MapPin className="size-3 text-primary" />
                  <span>Kec. Depok, Sleman</span>
                </div>
                <div className="flex items-center gap-1 text-[11px] text-slate-500">
                  <Clock className="size-3 text-slate-400" />
                  <span>Respon <b className="text-emerald-600">{"< 15 mnt"}</b></span>
                </div>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-semibold px-1.5 h-5 gap-0.5">
                  <CheckCircle2 className="size-2.5" /> NKV Verified
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-semibold px-1.5 h-5 gap-0.5">
                  <CheckCircle2 className="size-2.5" /> Halal MUI
                </Badge>
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] font-semibold px-1.5 h-5 gap-0.5">
                  <Truck className="size-2.5" /> Pengiriman 98%
                </Badge>
              </div>
            </div>

            {/* Right side actions — inline, not stacking */}
            <div className="hidden md:flex items-center gap-2 shrink-0">
              <Button
                onClick={() => setIsChatOpen(true)}
                size="sm"
                className="h-9 rounded-lg font-semibold text-xs gap-1.5 shadow-sm"
              >
                <MessageSquare className="size-3.5" />
                Chat Supplier
              </Button>
              <Button
                variant={isContactSaved ? "default" : "outline"}
                size="sm"
                onClick={() => setIsContactSaved(!isContactSaved)}
                className={cn(
                  "h-9 rounded-lg font-semibold text-xs gap-1.5",
                  isContactSaved
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                    : "border-slate-200 text-slate-600"
                )}
              >
                {isContactSaved ? <Check className="size-3.5" /> : <Bookmark className="size-3.5" />}
                {isContactSaved ? "Tersimpan" : "Simpan"}
              </Button>
            </div>
          </div>

          {/* Mobile action row */}
          <div className="flex md:hidden items-center gap-2 mt-3">
            <Button
              onClick={() => setIsChatOpen(true)}
              size="sm"
              className="flex-1 h-9 rounded-lg font-semibold text-xs gap-1.5"
            >
              <MessageSquare className="size-3.5" />
              Chat Supplier
            </Button>
            <Button
              variant={isContactSaved ? "default" : "outline"}
              size="sm"
              onClick={() => setIsContactSaved(!isContactSaved)}
              className={cn(
                "h-9 rounded-lg font-semibold text-xs gap-1.5 px-4",
                isContactSaved
                  ? "bg-emerald-600 hover:bg-emerald-700 text-white border-none"
                  : "border-slate-200 text-slate-600"
              )}
            >
              {isContactSaved ? <Check className="size-3.5" /> : <Bookmark className="size-3.5" />}
            </Button>
          </div>
        </div>

        {/* Tab Navigation — inline in store header */}
        <div className="max-w-[1280px] mx-auto px-4 lg:px-6">
          <div className="flex items-center gap-0 border-t border-slate-100 -mb-px">
            {[
              { key: 'katalog' as const, label: 'Produk', count: products.length },
              { key: 'ulasan' as const, label: 'Ulasan', count: 124 },
              { key: 'legalitas' as const, label: 'Legalitas', count: null },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-5 py-3 text-xs font-semibold border-b-2 transition-all duration-200",
                  activeTab === tab.key
                    ? "border-primary text-primary"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                )}
              >
                {tab.label}
                {tab.count !== null && (
                  <span className={cn(
                    "ml-1 text-[10px]",
                    activeTab === tab.key ? "text-primary/70" : "text-slate-400"
                  )}>
                    ({tab.count})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* MAIN CONTENT AREA */}
      {/* ═══════════════════════════════════════════════════════ */}
      <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-5">

        {/* ——— TAB: KATALOG PRODUK ——— */}
        {activeTab === 'katalog' && (
          <div className="animate-in fade-in duration-300">
            {/* Filter bar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h2 className="text-sm font-bold text-slate-800">Semua Produk</h2>
                <Badge className="bg-slate-100 text-slate-500 border-none text-[10px] font-semibold">{products.length}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <div className="relative hidden sm:block">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                  <Input className="pl-8 h-8 w-48 rounded-lg border-slate-200 text-xs bg-white" placeholder="Cari di toko ini..." />
                </div>
                <Button variant="outline" size="sm" className="h-8 rounded-lg border-slate-200 text-xs font-medium gap-1 text-slate-500">
                  <SlidersHorizontal className="size-3" />
                  Urutkan
                  <ChevronDown className="size-3" />
                </Button>
              </div>
            </div>

            {/* Product Grid — 5 columns on xl, 4 on lg, 3 on md, 2 on sm */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
              {products.map((product, index) => (
                <Card
                  key={product.id}
                  className="group overflow-hidden border-slate-200/60 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-xl animate-in fade-in slide-in-from-bottom-2"
                  style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
                >
                  {/* Image */}
                  <div className="aspect-square w-full overflow-hidden relative bg-slate-50">
                    <img
                      src={product.image}
                      alt={product.name}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {product.discount && (
                      <div className="absolute top-0 left-0 bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-br-lg">
                        {product.discount}
                      </div>
                    )}
                    <button className="absolute top-1.5 right-1.5 size-6 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center text-slate-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                      <Heart className="size-3" />
                    </button>
                  </div>

                  {/* Info */}
                  <div className="p-2.5">
                    <h4 className="text-[11px] sm:text-xs font-medium text-slate-700 line-clamp-2 leading-snug min-h-[2rem] group-hover:text-primary transition-colors">
                      {product.name}
                    </h4>

                    {/* Price */}
                    <div className="mt-1.5">
                      <span className="text-sm font-extrabold text-red-600">{product.price}</span>
                      <span className="text-[9px] text-slate-400 ml-0.5">{product.unit}</span>
                    </div>
                    {product.originalPrice && (
                      <span className="text-[10px] text-slate-400 line-through">{product.originalPrice}</span>
                    )}
                    <p className="text-[9px] text-slate-400 mt-0.5">{product.minOrder}</p>

                    {/* Rating & sold */}
                    <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-slate-100">
                      <Star className="size-2.5 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-semibold text-slate-600">{product.rating}</span>
                      <span className="text-[10px] text-slate-300">|</span>
                      <span className="text-[10px] text-slate-400">{product.sold}</span>
                    </div>

                    {/* Add to cart */}
                    <Button
                      onClick={() => addToCart(product)}
                      size="sm"
                      className={cn(
                        "w-full mt-2 rounded-lg font-semibold text-[10px] h-7 gap-1 transition-all",
                        addedItems.includes(product.id)
                          ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                          : "bg-primary/10 text-primary hover:bg-primary hover:text-white border-none shadow-none"
                      )}
                    >
                      {addedItems.includes(product.id) ? (
                        <><Check className="size-3" /> Ditambahkan</>
                      ) : (
                        <><Plus className="size-3" /> Keranjang</>
                      )}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ——— TAB: ULASAN ——— */}
        {activeTab === 'ulasan' && (
          <div className="animate-in fade-in duration-300">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
              {/* Rating Overview */}
              <div className="lg:col-span-4">
                <Card className="bg-white border-slate-200/60 rounded-xl shadow-sm sticky top-16">
                  <CardContent className="p-5">
                    <h3 className="text-sm font-bold text-slate-800 mb-4">Penilaian Pembeli</h3>
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-4xl font-extrabold text-slate-900">4.8</div>
                        <div className="flex items-center gap-0.5 mt-1 justify-center">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={cn("size-3", i <= 4 ? "text-amber-500 fill-amber-500" : "text-amber-400 fill-amber-200")} />
                          ))}
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1">124 ulasan</p>
                      </div>

                      <div className="flex-1 space-y-1.5">
                        {[
                          { star: 5, count: 98, pct: 79 },
                          { star: 4, count: 18, pct: 15 },
                          { star: 3, count: 5, pct: 4 },
                          { star: 2, count: 2, pct: 1.5 },
                          { star: 1, count: 1, pct: 0.8 },
                        ].map(r => (
                          <div key={r.star} className="flex items-center gap-1.5">
                            <span className="text-[10px] font-medium text-slate-500 w-2 text-right">{r.star}</span>
                            <Star className="size-2 text-amber-400 fill-amber-400" />
                            <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-amber-400 rounded-full" style={{ width: `${r.pct}%` }} />
                            </div>
                            <span className="text-[9px] text-slate-400 w-4 text-right">{r.count}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Highlight</h4>
                      <div className="flex flex-wrap gap-1.5">
                        {["Pengiriman cepat", "Kualitas bagus", "Respon cepat", "Harga kompetitif", "Packaging rapi"].map(tag => (
                          <Badge key={tag} variant="outline" className="text-[9px] font-medium text-slate-500 border-slate-200 bg-slate-50 px-2 h-5">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Reviews List */}
              <div className="lg:col-span-8 space-y-3">
                {[
                  {
                    name: "Dapur Ibu Budi • SPPG 01", initials: "IB",
                    color: "bg-indigo-50 text-indigo-600",
                    rating: 5, date: "2 hari lalu",
                    text: "Kualitas daging segar, pengiriman selalu jam 4 pagi. Sangat membantu operasional dapur kami yang harus mulai masak dini hari.",
                    product: "Ayam Fillet Dada (10 Kg)", helpful: 12
                  },
                  {
                    name: "Dapur Nusantara • SPPG 07", initials: "DN",
                    color: "bg-amber-50 text-amber-600",
                    rating: 5, date: "1 minggu lalu",
                    text: "Produk sesuai standar BGN, respon chat cepat dan sangat kooperatif. Harga juga kompetitif dibanding supplier lain di wilayah Sleman.",
                    product: "Ayam Paha Bawah (15 Kg)", helpful: 8
                  },
                  {
                    name: "SPPG Sleman 04", initials: "S4",
                    color: "bg-emerald-50 text-emerald-600",
                    rating: 4, date: "2 minggu lalu",
                    text: "Secara umum puas dengan pelayanan. Packaging rapi dan higienis. Sesekali ada keterlambatan saat musim hujan tapi selalu dikomunikasikan.",
                    product: "Hati Ampela Ayam (30 Pack)", helpful: 5
                  },
                  {
                    name: "Dapur Sehat Bantul", initials: "DS",
                    color: "bg-rose-50 text-rose-600",
                    rating: 5, date: "3 minggu lalu",
                    text: "Sudah langganan hampir 6 bulan, belum pernah mengecewakan. Ayamnya selalu segar dan berat sesuai pesanan.",
                    product: "Daging Ayam Utuh (20 Ekor)", helpful: 15
                  }
                ].map((review, idx) => (
                  <Card key={idx} className="bg-white border-slate-200/60 rounded-xl shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="size-8 shrink-0">
                          <AvatarFallback className={cn("text-[8px] font-bold", review.color)}>{review.initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold text-slate-800">{review.name}</p>
                            <span className="text-[10px] text-slate-400">{review.date}</span>
                          </div>
                          <div className="flex items-center gap-0.5 mt-0.5">
                            {[1,2,3,4,5].map(i => (
                              <Star key={i} className={cn("size-2.5", i <= review.rating ? "text-amber-500 fill-amber-500" : "text-slate-200")} />
                            ))}
                          </div>
                          <Badge variant="outline" className="mt-1.5 text-[8px] font-medium text-slate-400 border-slate-200 px-1.5 h-4">
                            {review.product}
                          </Badge>
                          <p className="text-[11px] text-slate-600 leading-relaxed mt-2">{review.text}</p>
                          <button className="flex items-center gap-1 mt-2 text-[10px] text-slate-400 hover:text-primary transition-colors font-medium">
                            <ThumbsUp className="size-2.5" />
                            Membantu ({review.helpful})
                          </button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ——— TAB: LEGALITAS ——— */}
        {activeTab === 'legalitas' && (
          <div className="animate-in fade-in duration-300 max-w-4xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {[
                { title: "Nomor Induk Berusaha", value: "1234567890123", status: "VALID (OSS)", icon: FileText, color: "from-blue-500 to-indigo-500", bg: "bg-blue-50" },
                { title: "Sertifikat Halal MUI", value: "ID3111000012345", status: "VALID (MUI)", icon: ShieldCheck, color: "from-emerald-500 to-green-500", bg: "bg-emerald-50" },
                { title: "Status Pajak (NPWP)", value: "NPWP Terdaftar", status: "AKTIF", icon: FileBadge, color: "from-amber-500 to-orange-500", bg: "bg-amber-50" }
              ].map((doc, idx) => (
                <Card key={idx} className="bg-white border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
                  <div className={cn("h-1 bg-gradient-to-r", doc.color)} />
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("size-9 rounded-lg bg-gradient-to-br flex items-center justify-center text-white shadow-sm shrink-0", doc.color)}>
                        <doc.icon className="size-4" />
                      </div>
                      <div>
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{doc.title}</p>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">{doc.value}</p>
                        <Badge className="mt-1.5 bg-emerald-50 text-emerald-600 border-none font-semibold text-[8px] px-1.5 h-4 gap-0.5">
                          <CheckCircle2 className="size-2" />
                          {doc.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Alert className="bg-blue-50 border-blue-100/50 rounded-xl mt-4">
              <Info className="size-3.5 text-blue-500" />
              <AlertDescription className="text-blue-700 text-[11px] font-medium">
                Supplier ini telah melalui verifikasi lapangan oleh Inspektur BGN pada 12 Januari 2026. Semua dokumen dapat diunduh setelah terhubung sebagai mitra.
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════ */}
      {/* SLIDING CART PANEL — Right side overlay */}
      {/* ═══════════════════════════════════════════════════════ */}
      {showCart && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-200" onClick={() => setShowCart(false)} />

          {/* Panel */}
          <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShoppingCart className="size-4 text-primary" />
                <h3 className="text-sm font-bold text-slate-900">Keranjang Pengadaan</h3>
                {cart.length > 0 && (
                  <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">{totalItems} item</Badge>
                )}
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowCart(false)} className="size-7 rounded-lg text-slate-400 hover:text-slate-700">
                <X className="size-4" />
              </Button>
            </div>

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center p-8">
                  <div className="size-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                    <Package className="size-7" />
                  </div>
                  <p className="text-sm font-semibold text-slate-600">Keranjang kosong</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Tambahkan produk dari katalog supplier.</p>
                  <Button onClick={() => { setShowCart(false); setActiveTab('katalog') }} size="sm" className="mt-4 rounded-lg text-xs font-semibold gap-1.5 h-8">
                    <Package className="size-3" />
                    Lihat Produk
                  </Button>
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {/* Supplier group header */}
                  <div className="px-4 py-2.5 bg-slate-50/80 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                    <Store className="size-3 text-primary" />
                    PT Tani Makmur Sejahtera
                    <Badge className="bg-primary/10 text-primary border-none text-[7px] font-bold px-1 h-3.5">Official</Badge>
                  </div>

                  {cart.map(item => (
                    <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                      <div className="size-14 rounded-lg overflow-hidden shrink-0 border border-slate-100">
                        <img src={item.image} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-800 truncate">{item.name}</p>
                        <p className="text-xs font-extrabold text-red-600 mt-0.5">{item.price}<span className="text-[9px] text-slate-400 font-normal ml-0.5">{item.unit}</span></p>
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-slate-200 rounded-lg">
                            <button
                              onClick={() => {
                                if (item.qty > 1) setCart(p => p.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i))
                              }}
                              className="size-7 flex items-center justify-center hover:bg-slate-50 text-slate-500 rounded-l-lg transition-colors"
                            >
                              <Minus className="size-3" />
                            </button>
                            <span className="w-8 text-center text-xs font-bold border-x border-slate-200">{item.qty}</span>
                            <button
                              onClick={() => setCart(p => p.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}
                              className="size-7 flex items-center justify-center hover:bg-slate-50 text-slate-500 rounded-r-lg transition-colors"
                            >
                              <Plus className="size-3" />
                            </button>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-800">Rp {(item.priceNum * item.qty).toLocaleString()}</span>
                            <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                              <Trash2 className="size-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 p-4 space-y-3 bg-white">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>Subtotal ({totalItems} item)</span>
                  <span className="font-semibold text-slate-700">Rp {totalEstimasi.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">Ongkos kirim</span>
                  <span className="font-bold text-emerald-600">GRATIS</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">Total</span>
                  <span className="text-lg font-extrabold text-red-600">Rp {totalEstimasi.toLocaleString()}</span>
                </div>
                <Button className="w-full h-10 rounded-xl font-bold text-xs gap-2 shadow-md shadow-primary/15">
                  <FileText className="size-3.5" />
                  Buat Purchase Order (PO)
                </Button>
                <p className="text-[9px] text-slate-400 text-center">
                  PO akan dikirim ke supplier untuk konfirmasi stok
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════ */}
      {/* FLOATING CHAT — Expandable panel */}
      {/* ═══════════════════════════════════════════════════════ */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="fixed bottom-5 right-5 z-30 bg-primary text-white rounded-full shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:scale-105 transition-all duration-200 flex items-center gap-2 px-4 h-11 text-xs font-semibold"
        >
          <MessageSquare className="size-4" />
          <span className="hidden sm:inline">Chat Supplier</span>
        </button>
      )}

      {isChatOpen && (
        <Card className="fixed bottom-5 right-5 w-[340px] sm:w-[380px] h-[440px] shadow-2xl shadow-black/15 z-50 flex flex-col rounded-2xl border-slate-200/60 overflow-hidden animate-in slide-in-from-bottom-4 zoom-in-95 fade-in duration-300">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-primary to-indigo-600 px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5 text-white">
              <div className="size-8 bg-white/15 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Store className="size-4" />
              </div>
              <div>
                <p className="text-[11px] font-bold leading-none">PT Tani Makmur</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <div className="size-1.5 bg-emerald-400 rounded-full animate-pulse" />
                  <span className="text-[9px] font-medium opacity-80">Online</span>
                </div>
              </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsChatOpen(false)} className="text-white/70 hover:text-white hover:bg-white/10 rounded-lg size-7">
              <X className="size-4" />
            </Button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 p-3 overflow-y-auto space-y-3 bg-[#F8FAFC]">
            <div className="flex justify-center">
              <Badge variant="outline" className="bg-white text-[8px] text-slate-400 font-medium border-slate-200 px-2 h-4">
                Hari ini
              </Badge>
            </div>

            {/* Incoming */}
            <div className="flex gap-2 max-w-[85%]">
              <Avatar className="size-6 shrink-0">
                <AvatarFallback className="text-[7px] font-bold bg-slate-200 text-slate-600">TM</AvatarFallback>
              </Avatar>
              <div className="bg-white p-2.5 rounded-xl rounded-tl-sm border border-slate-100">
                <p className="text-[11px] text-slate-700 leading-relaxed">Halo, selamat siang. Ada yang bisa kami bantu untuk pengadaan stok ayam Dapur SPPG Anda?</p>
                <p className="text-[8px] text-slate-400 mt-1 text-right">14:02</p>
              </div>
            </div>

            {/* Outgoing */}
            <div className="flex gap-2 max-w-[85%] ml-auto flex-row-reverse">
              <div className="bg-primary p-2.5 rounded-xl rounded-tr-sm text-white shadow-sm">
                <p className="text-[11px] leading-relaxed">Siang, Pak. Untuk stok ayam fillet dada bisa nego harga kalau kami ambil rutin 50kg per hari?</p>
                <p className="text-[8px] opacity-60 mt-1">14:05</p>
              </div>
            </div>

            {/* Incoming reply */}
            <div className="flex gap-2 max-w-[85%]">
              <Avatar className="size-6 shrink-0">
                <AvatarFallback className="text-[7px] font-bold bg-slate-200 text-slate-600">TM</AvatarFallback>
              </Avatar>
              <div className="bg-white p-2.5 rounded-xl rounded-tl-sm border border-slate-100">
                <p className="text-[11px] text-slate-700 leading-relaxed">Tentu bisa, Pak. Untuk order rutin 50kg/hari, kami bisa kasih harga Rp 36.000/kg. Apakah berminat?</p>
                <p className="text-[8px] text-slate-400 mt-1 text-right">14:08</p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="p-3 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <Input className="rounded-lg bg-slate-50 border-slate-200 text-[11px] h-8 flex-1" placeholder="Ketik pesan..." />
              <Button size="icon" className="size-8 rounded-lg shadow-sm shrink-0">
                <Send className="size-3.5" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
