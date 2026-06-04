"use client"

import * as React from "react"
import Link from "next/link"
import {
  Search,
  MapPin,
  Star,
  Store,
  ShieldCheck,
  ChevronRight,
  Filter,
  Sparkles,
  TrendingUp,
  Clock,
  Truck,
  BadgeCheck,
  Heart,
  Eye,
  Package,
  Flame,
  Zap,
  ArrowRight,
  ChevronDown
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"

const categories = [
  { label: "Semua", value: "all", icon: Package, active: true },
  { label: "Daging & Unggas", value: "meat", icon: Flame },
  { label: "Susu & Olahan", value: "dairy", icon: Package },
  { label: "Sembako", value: "basic", icon: Package },
  { label: "Sayur & Buah", value: "veg", icon: Package },
  { label: "Bumbu & Rempah", value: "spice", icon: Package },
]

export default function MarketplaceHomePage() {
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [activeCategory, setActiveCategory] = React.useState("all")
  const [likedSuppliers, setLikedSuppliers] = React.useState<string[]>([])

  const toggleLike = (id: string) => {
    setLikedSuppliers(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    )
  }

  const suppliers = [
    {
      id: "tani-makmur",
      name: "PT Tani Makmur Sejahtera",
      desc: "Pemasok utama daging ayam potong segar terstandarisasi untuk area Yogyakarta dan sekitarnya.",
      badges: ["Verified NKV", "Halal MUI"],
      category: "Daging & Unggas",
      location: "Kec. Depok, Sleman",
      distance: "3.2 km",
      rating: 4.8,
      reviews: 124,
      products: 18,
      sold: "2.5rb+",
      responseTime: "< 15 menit",
      deliveryAccuracy: "98%",
      initials: "TM",
      color: "from-rose-500 to-orange-500",
      isOfficial: true,
      isTopSeller: true,
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "koperasi-susu",
      name: "Koperasi Susu Perah Mandiri",
      desc: "Penyedia susu UHT dan susu segar kualitas premium dari peternak lokal terpercaya.",
      badges: ["Verified BPOM", "Organic"],
      category: "Susu Kemasan",
      location: "Kec. Ngaglik, Sleman",
      distance: "5.1 km",
      rating: 4.9,
      reviews: 89,
      products: 12,
      sold: "1.8rb+",
      responseTime: "< 10 menit",
      deliveryAccuracy: "99%",
      initials: "KS",
      color: "from-blue-500 to-cyan-500",
      isOfficial: true,
      isTopSeller: false,
      image: "https://images.unsplash.com/photo-1563636619-e9143da7973b?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "gudang-beras",
      name: "Gudang Beras Nusantara",
      desc: "Distributor beras kualitas super dengan stok stabil untuk kebutuhan skala besar.",
      badges: ["Verified BGN", "Premium"],
      category: "Sembako",
      location: "Kec. Mlati, Sleman",
      distance: "6.0 km",
      rating: 4.5,
      reviews: 210,
      products: 8,
      sold: "5.2rb+",
      responseTime: "< 30 menit",
      deliveryAccuracy: "96%",
      initials: "GB",
      color: "from-amber-500 to-yellow-500",
      isOfficial: false,
      isTopSeller: true,
      image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "fresh-garden",
      name: "CV Fresh Garden Indonesia",
      desc: "Supplier sayur mayur organik & buah segar langsung dari kebun petani mitra.",
      badges: ["Organik Certified", "BPOM"],
      category: "Sayur & Buah",
      location: "Kec. Pakem, Sleman",
      distance: "8.3 km",
      rating: 4.7,
      reviews: 67,
      products: 32,
      sold: "980+",
      responseTime: "< 20 menit",
      deliveryAccuracy: "95%",
      initials: "FG",
      color: "from-emerald-500 to-green-500",
      isOfficial: true,
      isTopSeller: false,
      image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "rempah-prima",
      name: "UD Rempah Prima Jaya",
      desc: "Pemasok bumbu dapur lengkap & rempah pilihan dengan harga grosir terjangkau.",
      badges: ["Verified PIRT", "Grosir"],
      category: "Bumbu & Rempah",
      location: "Kec. Gamping, Sleman",
      distance: "7.5 km",
      rating: 4.6,
      reviews: 156,
      products: 45,
      sold: "3.1rb+",
      responseTime: "< 25 menit",
      deliveryAccuracy: "97%",
      initials: "RP",
      color: "from-purple-500 to-pink-500",
      isOfficial: false,
      isTopSeller: false,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=400&auto=format&fit=crop"
    }
  ]

  return (
    <div className="min-h-screen bg-[#F1F3F6]">
      {/* Hero Search Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-indigo-700" />
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-8 pb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
                Direktori Supplier MBG
              </h1>
              <p className="text-white/70 text-sm font-medium mt-1">
                Temukan mitra pemasok tervalidasi di sekitar dapur Anda
              </p>
            </div>
            <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 border border-white/10">
              <MapPin className="size-3.5 text-white/80" />
              <span className="text-xs font-semibold text-white/90">Sleman, DI Yogyakarta</span>
            </div>
          </div>

          {/* Search Bar - Tokopedia style */}
          <div className={cn(
            "relative max-w-3xl transition-all duration-300",
            searchFocused ? "scale-[1.02]" : ""
          )}>
            <div className={cn(
              "flex items-center bg-white rounded-xl overflow-hidden shadow-xl transition-all duration-300",
              searchFocused ? "ring-2 ring-white/50 shadow-2xl" : "shadow-lg"
            )}>
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input 
                  className="pl-11 h-12 border-none shadow-none bg-transparent text-sm font-medium placeholder:text-slate-400 focus-visible:ring-0" 
                  placeholder="Cari nama supplier, komoditas, atau produk..." 
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
              <div className="flex items-center gap-2 pr-2">
                <div className="h-7 w-px bg-slate-200" />
                <Select defaultValue="sleman">
                  <SelectTrigger className="w-[130px] h-9 rounded-lg bg-slate-50 border-none shadow-none text-xs font-semibold text-slate-600 focus:ring-0">
                    <MapPin className="size-3 text-primary mr-1" />
                    <SelectValue placeholder="Lokasi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sleman">Sleman</SelectItem>
                    <SelectItem value="bantul">Bantul</SelectItem>
                    <SelectItem value="kulonprogo">Kulon Progo</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="h-9 px-5 rounded-lg font-bold text-xs gap-1.5 shadow-md shadow-primary/20">
                  <Search className="size-3.5" />
                  Cari
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-4 mt-5">
            <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
              <BadgeCheck className="size-3.5" />
              <span><strong className="text-white/90">127</strong> supplier terverifikasi</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
              <Package className="size-3.5" />
              <span><strong className="text-white/90">2,340</strong> produk tersedia</span>
            </div>
            <div className="w-px h-3 bg-white/20" />
            <div className="flex items-center gap-2 text-white/60 text-xs font-medium">
              <Truck className="size-3.5" />
              <span>Pengiriman <strong className="text-white/90">same-day</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="max-w-7xl mx-auto px-6 -mt-4 relative z-10">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-3 flex items-center gap-2 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200",
                activeCategory === cat.value
                  ? "bg-primary text-white shadow-md shadow-primary/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100"
              )}
            >
              <cat.icon className="size-3.5" />
              {cat.label}
            </button>
          ))}
          <div className="flex-1" />
          <Button variant="outline" size="sm" className="h-9 rounded-xl border-slate-200 text-slate-600 font-semibold text-xs gap-1.5 shrink-0">
            <Filter className="size-3" />
            Filter
            <ChevronDown className="size-3" />
          </Button>
        </div>
      </div>

      {/* AI Location Notice */}
      <div className="max-w-7xl mx-auto px-6 mt-4">
        <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-blue-50 border border-indigo-100/50 rounded-xl px-4 py-3">
          <div className="size-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
            <Sparkles className="size-4 text-primary" />
          </div>
          <p className="text-xs text-slate-600 font-medium">
            <span className="font-bold text-primary">Rekomendasi AI:</span>{" "}
            Menampilkan <strong>5 supplier terdekat</strong> dari titik koordinat dapur SPPG Anda di Sleman, diurutkan berdasarkan jarak dan rating.
          </p>
        </div>
      </div>

      {/* Supplier Grid - 5 cards */}
      <div className="max-w-7xl mx-auto px-6 mt-6 pb-12">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-900">Supplier Terdekat</h2>
            <Badge className="bg-primary/10 text-primary border-none font-bold text-[10px] px-2">
              {suppliers.length} supplier
            </Badge>
          </div>
          <Select defaultValue="nearest">
            <SelectTrigger className="w-[160px] h-9 rounded-lg border-slate-200 text-xs font-semibold">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="nearest">Terdekat</SelectItem>
              <SelectItem value="rating">Rating Tertinggi</SelectItem>
              <SelectItem value="reviews">Ulasan Terbanyak</SelectItem>
              <SelectItem value="newest">Terbaru</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Responsive grid: 2 cols on md, 3 on lg, then last 2 cards on new row for 5 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {suppliers.map((supplier, index) => (
            <Link 
              key={supplier.id} 
              href={`/portal/marketplace/${supplier.id}`}
              className="group block"
            >
              <Card className={cn(
                "overflow-hidden border border-slate-200/80 bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 rounded-2xl h-full flex flex-col",
                "animate-in fade-in slide-in-from-bottom-3",
              )} style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}>
                {/* Image */}
                <div className="aspect-[4/3] w-full overflow-hidden relative bg-slate-100">
                  <img 
                    src={supplier.image} 
                    alt={supplier.name} 
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700 ease-out" 
                  />
                  {/* Gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                  
                  {/* Top badges */}
                  <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                    {supplier.isOfficial && (
                      <Badge className="bg-primary text-white border-none font-bold text-[8px] px-1.5 py-0.5 gap-0.5 shadow-lg">
                        <BadgeCheck className="size-2.5" />
                        Official
                      </Badge>
                    )}
                    {supplier.isTopSeller && (
                      <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-none font-bold text-[8px] px-1.5 py-0.5 gap-0.5 shadow-lg">
                        <Flame className="size-2.5" />
                        Top Seller
                      </Badge>
                    )}
                  </div>

                  {/* Like button */}
                  <button 
                    onClick={(e) => { e.preventDefault(); toggleLike(supplier.id) }}
                    className={cn(
                      "absolute top-2 right-2 size-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-md",
                      likedSuppliers.includes(supplier.id) 
                        ? "bg-red-500 text-white" 
                        : "bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500"
                    )}
                  >
                    <Heart className={cn("size-3.5", likedSuppliers.includes(supplier.id) && "fill-current")} />
                  </button>

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-1.5">
                    <Badge className="bg-white/95 backdrop-blur-md text-slate-700 border-none font-semibold text-[9px] px-1.5 py-0.5 shadow-sm">
                      <MapPin className="size-2.5 text-primary mr-0.5" />
                      {supplier.distance}
                    </Badge>
                    <Badge className="bg-white/95 backdrop-blur-md text-slate-700 border-none font-semibold text-[9px] px-1.5 py-0.5 shadow-sm">
                      <Package className="size-2.5 text-slate-400 mr-0.5" />
                      {supplier.products} produk
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-3 flex-1 flex flex-col">
                  {/* Store name with avatar */}
                  <div className="flex items-start gap-2 mb-2">
                    <div className={cn(
                      "size-8 rounded-lg bg-gradient-to-br flex items-center justify-center text-white text-[10px] font-black shrink-0 shadow-md",
                      supplier.color
                    )}>
                      {supplier.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {supplier.name}
                      </h3>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        {supplier.location}
                      </p>
                    </div>
                  </div>

                  {/* Rating & Sales */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center gap-1 bg-amber-50 rounded-md px-1.5 py-0.5">
                      <Star className="size-2.5 text-amber-500 fill-amber-500" />
                      <span className="text-[10px] font-bold text-amber-700">{supplier.rating}</span>
                    </div>
                    <span className="text-[10px] text-slate-400">({supplier.reviews} ulasan)</span>
                    <span className="text-[10px] text-slate-300">|</span>
                    <span className="text-[10px] text-slate-500 font-medium">{supplier.sold} terjual</span>
                  </div>

                  {/* Category badge */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {supplier.badges.map((badge, idx) => (
                      <Badge key={idx} variant="outline" className={cn(
                        "text-[8px] font-semibold px-1.5 py-0 h-4 border-none",
                        badge.includes("Verified") || badge.includes("Certified")
                          ? "bg-emerald-50 text-emerald-600" 
                          : "bg-slate-50 text-slate-500"
                      )}>
                        {(badge.includes("Verified") || badge.includes("Certified")) && <ShieldCheck className="size-2 mr-0.5" />}
                        {badge}
                      </Badge>
                    ))}
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                    <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
                      <Clock className="size-2.5" />
                      Respon {supplier.responseTime}
                    </div>
                    <div className="flex items-center gap-1 text-[9px] font-semibold text-primary">
                      <Truck className="size-2.5" />
                      {supplier.deliveryAccuracy}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-8">
          <Button variant="outline" className="rounded-full px-8 h-11 font-semibold text-sm gap-2 border-slate-200 text-slate-600 hover:bg-white shadow-sm">
            Lihat Semua Supplier
            <ArrowRight className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
