"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Search, 
  MapPin, 
  Star, 
  Store, 
  ShieldCheck, 
  Filter,
  Sparkles,
  Clock,
  Truck,
  BadgeCheck,
  Heart,
  Package,
  Flame,
  ArrowRight,
  ChevronDown
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
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
      color: "from-teal-600 to-emerald-500",
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
      color: "from-cyan-600 to-teal-500",
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
      color: "from-emerald-600 to-teal-600",
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
      color: "from-teal-500 to-cyan-500",
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
      color: "from-cyan-500 to-emerald-500",
      isOfficial: false,
      isTopSeller: false,
      image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?q=80&w=400&auto=format&fit=crop"
    }
  ]

  return (
    <div className="pb-12 animate-in fade-in duration-500">
      {/* Hero Search Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-teal-900 via-teal-800 to-slate-900" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <div className="space-y-3">
              <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse mr-2 inline-block" /> BGN Verified Directory
              </Badge>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Direktori Supplier MBG
              </h1>
              <p className="text-teal-100/80 text-sm md:text-base font-medium mt-1 max-w-xl leading-relaxed">
                Temukan mitra pemasok tervalidasi di sekitar dapur Anda untuk menjamin kualitas gizi dan ketepatan waktu.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0">
              <div className="size-10 bg-teal-500/20 rounded-xl flex items-center justify-center">
                <MapPin className="size-5 text-teal-300" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">Titik Dapur (GPS)</p>
                <p className="text-sm font-bold text-white mt-0.5">Sleman, DI Yogyakarta</p>
              </div>
            </div>
          </div>

          {/* Search Bar - Premium style */}
          <div className={cn(
            "relative max-w-4xl transition-all duration-500",
            searchFocused ? "scale-[1.02]" : ""
          )}>
            <div className={cn(
              "flex items-center bg-white rounded-2xl overflow-hidden shadow-xl transition-all duration-500 p-1.5",
              searchFocused ? "ring-4 ring-teal-500/30 shadow-2xl" : "shadow-lg"
            )}>
              <div className="flex-1 relative flex items-center">
                <Search className="absolute left-4 size-5 text-slate-400" />
                <Input 
                  className="pl-12 h-14 border-none shadow-none bg-transparent text-base font-bold placeholder:text-slate-400 focus-visible:ring-0" 
                  placeholder="Cari daging ayam, beras, sayur, atau nama supplier..." 
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
              </div>
              <div className="flex items-center gap-2 pr-2">
                <div className="h-8 w-px bg-slate-200 mx-2" />
                <Select defaultValue="sleman">
                  <SelectTrigger className="w-[140px] h-12 rounded-xl bg-slate-50 border-none shadow-none text-sm font-bold text-slate-700 focus:ring-2 focus:ring-teal-500/20 hover:bg-slate-100 transition-all">
                    <MapPin className="size-4 text-teal-600 mr-2" />
                    <SelectValue placeholder="Lokasi" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    <SelectItem value="sleman" className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Sleman</SelectItem>
                    <SelectItem value="bantul" className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Bantul</SelectItem>
                    <SelectItem value="kulonprogo" className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Kulon Progo</SelectItem>
                  </SelectContent>
                </Select>
                <Button className="h-12 px-8 rounded-xl font-bold text-sm gap-2 shadow-md bg-teal-600 hover:bg-teal-700 text-white ml-2 transition-all">
                  <Search className="size-4" />
                  Cari
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-teal-100/60 text-xs font-semibold">
              <BadgeCheck className="size-4 text-emerald-400" />
              <span><strong className="text-white">127</strong> supplier terverifikasi</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-teal-100/60 text-xs font-semibold">
              <Package className="size-4 text-teal-400" />
              <span><strong className="text-white">2,340</strong> produk tersedia</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-teal-100/60 text-xs font-semibold">
              <Truck className="size-4 text-amber-400" />
              <span>Pengiriman <strong className="text-white">same-day</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="max-w-7xl mx-auto px-6 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-md border border-slate-200/60 p-2 flex items-center gap-2 overflow-x-auto ring-1 ring-slate-100">
          {categories.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveCategory(cat.value)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all duration-300",
                activeCategory === cat.value
                  ? "bg-teal-600 text-white shadow-md shadow-teal-500/20"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <cat.icon className="size-4" />
              {cat.label}
            </button>
          ))}
          <div className="flex-1" />
          <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-700 font-bold text-xs gap-2 shrink-0 px-5 hover:bg-slate-50 mr-2">
            <Filter className="size-4 text-teal-600" />
            Filter
            <ChevronDown className="size-4 opacity-50" />
          </Button>
        </div>
      </div>

      {/* AI Location Notice */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-teal-50 border border-teal-100 rounded-2xl px-6 py-4 shadow-sm">
          <div className="size-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border border-teal-100">
            <Sparkles className="size-5 text-teal-600" />
          </div>
          <p className="text-sm text-teal-900 font-medium leading-relaxed">
            <span className="font-extrabold text-teal-800 uppercase tracking-wide mr-2">Rekomendasi AI:</span>
            Menampilkan <strong className="font-bold text-teal-900">5 supplier terdekat</strong> dari titik koordinat dapur SPPG Anda di Sleman, diurutkan berdasarkan jarak dan rating.
          </p>
        </div>
      </div>

      {/* Supplier Grid - 5 cards */}
      <div className="max-w-7xl mx-auto px-6 mt-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Supplier Terdekat</h2>
            <Badge className="bg-teal-50 text-teal-700 border-none font-bold text-[10px] px-2 py-0.5 uppercase tracking-widest shadow-sm">
              {suppliers.length} supplier
            </Badge>
          </div>
          <Select defaultValue="nearest">
            <SelectTrigger className="w-[180px] h-10 rounded-xl border-slate-200 text-xs font-bold focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all hover:bg-slate-50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="nearest" className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Terdekat</SelectItem>
              <SelectItem value="rating" className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Rating Tertinggi</SelectItem>
              <SelectItem value="reviews" className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Ulasan Terbanyak</SelectItem>
              <SelectItem value="newest" className="rounded-lg font-bold text-sm py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Terbaru</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Responsive grid: 2 cols on md, 3 on lg, then last 2 cards on new row for 5 cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {suppliers.map((supplier, index) => (
            <Link 
              key={supplier.id} 
              href={`/portal/marketplace/${supplier.id}`}
              className="group block"
            >
              <Card className={cn(
                "overflow-hidden border-none ring-1 ring-slate-200/60 bg-white hover:shadow-xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 rounded-2xl h-full flex flex-col",
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
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                  
                  {/* Top badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    {supplier.isOfficial && (
                      <Badge className="bg-teal-500 text-white border-none font-bold text-[9px] px-2 py-0.5 gap-1 shadow-md uppercase tracking-widest">
                        <BadgeCheck className="size-3" />
                        Official
                      </Badge>
                    )}
                    {supplier.isTopSeller && (
                      <Badge className="bg-amber-500 text-white border-none font-bold text-[9px] px-2 py-0.5 gap-1 shadow-md uppercase tracking-widest">
                        <Flame className="size-3" />
                        Top Seller
                      </Badge>
                    )}
                  </div>

                  {/* Like button */}
                  <button 
                    onClick={(e) => { e.preventDefault(); toggleLike(supplier.id) }}
                    className={cn(
                      "absolute top-3 right-3 size-8 rounded-full flex items-center justify-center transition-all duration-300 shadow-md",
                      likedSuppliers.includes(supplier.id) 
                        ? "bg-red-500 text-white scale-110" 
                        : "bg-white/90 backdrop-blur-sm text-slate-400 hover:text-red-500 hover:scale-110"
                    )}
                  >
                    <Heart className={cn("size-4", likedSuppliers.includes(supplier.id) && "fill-current")} />
                  </button>

                  {/* Bottom info overlay */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                    <Badge className="bg-white/95 backdrop-blur-md text-slate-900 border-none font-bold text-[10px] px-2 py-1 shadow-sm gap-1 rounded-lg">
                      <MapPin className="size-3 text-teal-600" />
                      {supplier.distance}
                    </Badge>
                    <Badge className="bg-white/95 backdrop-blur-md text-slate-900 border-none font-bold text-[10px] px-2 py-1 shadow-sm gap-1 rounded-lg">
                      <Package className="size-3 text-slate-500" />
                      {supplier.products} produk
                    </Badge>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  {/* Store name with avatar */}
                  <div className="flex items-start gap-3 mb-3">
                    <div className={cn(
                      "size-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white text-xs font-black shrink-0 shadow-md",
                      supplier.color
                    )}>
                      {supplier.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-bold text-slate-900 leading-tight group-hover:text-teal-700 transition-colors line-clamp-2">
                        {supplier.name}
                      </h3>
                      <p className="text-[11px] text-slate-500 font-semibold mt-1 flex items-center gap-1">
                        <Store className="size-3" /> {supplier.location}
                      </p>
                    </div>
                  </div>

                  {/* Rating & Sales */}
                  <div className="flex items-center gap-2 mb-4 bg-slate-50 border border-slate-100 rounded-lg p-2">
                    <div className="flex items-center gap-1">
                      <Star className="size-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-extrabold text-slate-900">{supplier.rating}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">({supplier.reviews} ulasan)</span>
                    <span className="text-slate-300 mx-1">•</span>
                    <span className="text-[10px] text-slate-600 font-bold bg-slate-200/50 px-1.5 py-0.5 rounded-md">{supplier.sold} terjual</span>
                  </div>

                  {/* Category badge */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {supplier.badges.map((badge, idx) => (
                      <Badge key={idx} variant="outline" className={cn(
                        "text-[9px] font-bold px-2 py-0.5 border-none uppercase tracking-widest rounded-md",
                        badge.includes("Verified") || badge.includes("Certified")
                          ? "bg-emerald-50 text-emerald-700" 
                          : "bg-slate-100 text-slate-600"
                      )}>
                        {(badge.includes("Verified") || badge.includes("Certified")) && <ShieldCheck className="size-3 mr-1" />}
                        {badge}
                      </Badge>
                    ))}
                  </div>

                  {/* Spacer */}
                  <div className="flex-1" />

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-4">
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                      <Clock className="size-3.5 text-slate-400" />
                      Respon {supplier.responseTime}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-extrabold text-teal-700 bg-teal-50 px-2 py-1 rounded-md uppercase tracking-widest">
                      <Truck className="size-3.5 text-teal-600" />
                      {supplier.deliveryAccuracy}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Load More */}
        <div className="flex justify-center mt-12">
          <Button variant="outline" className="rounded-xl px-8 h-12 font-bold text-sm gap-2 border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-sm transition-all group">
            Lihat Semua Supplier
            <ArrowRight className="size-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  )
}
