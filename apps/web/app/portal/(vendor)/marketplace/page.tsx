"use client"

import * as React from "react"
import Link from "next/link"
import { useAuth } from "@/hooks/use-auth"
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
  const { user } = useAuth()
  const [searchFocused, setSearchFocused] = React.useState(false)
  const [activeCategory, setActiveCategory] = React.useState("all")
  const [likedSuppliers, setLikedSuppliers] = React.useState<string[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  // Dynamic Theme based on Role
  const roleName = (user?.role || "Admin").toLowerCase()
  
  const getTheme = () => {
    if (roleName.includes("supplier")) {
      return {
        gradient: "from-orange-900 via-orange-800 to-slate-900",
        badge: "bg-orange-500/20 text-orange-100 border-orange-500/30",
        iconPulse: "bg-orange-400",
        iconBox: "bg-orange-500/20",
        iconColor: "text-orange-300",
        iconColorDark: "text-orange-600",
        focusRing: "focus:ring-orange-500/20",
        buttonPrimary: "bg-orange-600 hover:bg-orange-700",
        buttonPrimaryActive: "bg-orange-600 text-white shadow-md shadow-orange-500/20",
        textPrimary: "text-orange-600",
        textDark: "text-orange-900",
        textMedium: "text-orange-700",
        bgLight: "bg-orange-50",
        borderLight: "border-orange-100",
        shadowFocus: "ring-orange-500/30",
        hoverText: "group-hover:text-orange-700",
        badgeSolid: "bg-orange-500",
        borderFocus: "focus:border-orange-500",
        itemFocus: "focus:bg-orange-50 focus:text-orange-900"
      };
    }
    
    if (roleName.includes("vendor") || roleName.includes("mitra") || roleName.includes("dapur")) {
      return {
        gradient: "from-teal-900 via-teal-800 to-slate-900",
        badge: "bg-teal-500/20 text-teal-100 border-teal-500/30",
        iconPulse: "bg-emerald-400",
        iconBox: "bg-teal-500/20",
        iconColor: "text-teal-300",
        iconColorDark: "text-teal-600",
        focusRing: "focus:ring-teal-500/20",
        buttonPrimary: "bg-teal-600 hover:bg-teal-700",
        buttonPrimaryActive: "bg-teal-600 text-white shadow-md shadow-teal-500/20",
        textPrimary: "text-teal-600",
        textDark: "text-teal-900",
        textMedium: "text-teal-700",
        bgLight: "bg-teal-50",
        borderLight: "border-teal-100",
        shadowFocus: "ring-teal-500/30",
        hoverText: "group-hover:text-teal-700",
        badgeSolid: "bg-teal-500",
        borderFocus: "focus:border-teal-500",
        itemFocus: "focus:bg-teal-50 focus:text-teal-900"
      };
    }
  
    // Admin default (Indigo/Blue)
    return {
      gradient: "from-indigo-900 via-indigo-800 to-slate-900",
      badge: "bg-indigo-500/20 text-indigo-100 border-indigo-500/30",
      iconPulse: "bg-indigo-400",
      iconBox: "bg-indigo-500/20",
      iconColor: "text-indigo-300",
      iconColorDark: "text-indigo-600",
      focusRing: "focus:ring-indigo-500/20",
      buttonPrimary: "bg-indigo-600 hover:bg-indigo-700",
      buttonPrimaryActive: "bg-indigo-600 text-white shadow-md shadow-indigo-500/20",
      textPrimary: "text-indigo-600",
      textDark: "text-indigo-900",
      textMedium: "text-indigo-700",
      bgLight: "bg-indigo-50",
      borderLight: "border-indigo-100",
      shadowFocus: "ring-indigo-500/30",
      hoverText: "group-hover:text-indigo-700",
      badgeSolid: "bg-indigo-500",
      borderFocus: "focus:border-indigo-500",
      itemFocus: "focus:bg-indigo-50 focus:text-indigo-900"
    };
  };

  const theme = getTheme()

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

  if (!mounted) {
    return <div className="h-screen bg-[#F1F3F6] flex items-center justify-center animate-pulse text-slate-400">Memuat direktori...</div>
  }

  return (
    <div className="pb-12 animate-in fade-in duration-500">
      {/* Hero Search Section */}
      <div className="relative overflow-hidden">
        <div className={cn("absolute inset-0 bg-gradient-to-br", theme.gradient)} />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative max-w-7xl mx-auto px-6 pt-10 pb-16">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
            <div className="space-y-3">
              <Badge className={cn("border font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm", theme.badge)}>
                <span className={cn("size-1.5 rounded-full animate-pulse mr-2 inline-block", theme.iconPulse)} /> BGN Verified Directory
              </Badge>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Direktori Supplier MBG
              </h1>
              <p className="text-white/80 text-sm md:text-base font-medium mt-1 max-w-xl leading-relaxed">
                Temukan mitra pemasok tervalidasi di sekitar dapur Anda untuk menjamin kualitas gizi dan ketepatan waktu.
              </p>
            </div>
            <div className="hidden md:flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-2xl p-4 border border-white/10 shrink-0">
              <div className={cn("size-10 rounded-xl flex items-center justify-center", theme.iconBox)}>
                <MapPin className={cn("size-5", theme.iconColor)} />
              </div>
              <div>
                <p className={cn("text-[10px] font-bold uppercase tracking-widest", theme.iconColor)}>Titik Dapur (GPS)</p>
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
              searchFocused ? `ring-4 ${theme.shadowFocus} shadow-2xl` : "shadow-lg"
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
                  <SelectTrigger className={cn("w-[140px] h-12 rounded-xl bg-slate-50 border-none shadow-none text-sm font-bold text-slate-700 hover:bg-slate-100 transition-all", theme.focusRing)}>
                    <MapPin className={cn("size-4 mr-2", theme.iconColorDark)} />
                    <SelectValue placeholder="Lokasi" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                    <SelectItem value="sleman" className={cn("rounded-lg font-bold text-sm py-3 cursor-pointer", theme.itemFocus)}>Sleman</SelectItem>
                    <SelectItem value="bantul" className={cn("rounded-lg font-bold text-sm py-3 cursor-pointer", theme.itemFocus)}>Bantul</SelectItem>
                    <SelectItem value="kulonprogo" className={cn("rounded-lg font-bold text-sm py-3 cursor-pointer", theme.itemFocus)}>Kulon Progo</SelectItem>
                  </SelectContent>
                </Select>
                <Button className={cn("h-12 px-8 rounded-xl font-bold text-sm gap-2 shadow-md text-white ml-2 transition-all", theme.buttonPrimary)}>
                  <Search className="size-4" />
                  Cari
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap items-center gap-6 mt-8">
            <div className="flex items-center gap-2 text-white/60 text-xs font-semibold">
              <BadgeCheck className="size-4 text-emerald-400" />
              <span><strong className="text-white">127</strong> supplier terverifikasi</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-white/60 text-xs font-semibold">
              <Package className={cn("size-4", theme.iconPulse)} />
              <span><strong className="text-white">2,340</strong> produk tersedia</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <div className="flex items-center gap-2 text-white/60 text-xs font-semibold">
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
                  ? theme.buttonPrimaryActive
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              )}
            >
              <cat.icon className="size-4" />
              {cat.label}
            </button>
          ))}
          <div className="flex-1" />
          <Button variant="outline" className="h-10 rounded-xl border-slate-200 text-slate-700 font-bold text-xs gap-2 shrink-0 px-5 hover:bg-slate-50 mr-2">
            <Filter className={cn("size-4", theme.iconColorDark)} />
            Filter
            <ChevronDown className="size-4 opacity-50" />
          </Button>
        </div>
      </div>

      {/* AI Location Notice */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className={cn("flex flex-col sm:flex-row sm:items-center gap-4 border rounded-2xl px-6 py-4 shadow-sm", theme.bgLight, theme.borderLight)}>
          <div className={cn("size-10 bg-white rounded-full flex items-center justify-center shrink-0 shadow-sm border", theme.borderLight)}>
            <Sparkles className={cn("size-5", theme.iconColorDark)} />
          </div>
          <p className={cn("text-sm font-medium leading-relaxed", theme.textDark)}>
            <span className={cn("font-extrabold uppercase tracking-wide mr-2", theme.textMedium)}>Rekomendasi AI:</span>
            Menampilkan <strong className={cn("font-bold", theme.textDark)}>5 supplier terdekat</strong> dari titik koordinat dapur SPPG Anda di Sleman, diurutkan berdasarkan jarak dan rating.
          </p>
        </div>
      </div>

      {/* Supplier Grid - 5 cards */}
      <div className="max-w-7xl mx-auto px-6 mt-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-slate-900">Supplier Terdekat</h2>
            <Badge className={cn("border-none font-bold text-[10px] px-2 py-0.5 uppercase tracking-widest shadow-sm", theme.bgLight, theme.textMedium)}>
              {suppliers.length} supplier
            </Badge>
          </div>
          <Select defaultValue="nearest">
            <SelectTrigger className={cn("w-[180px] h-10 rounded-xl border-slate-200 text-xs font-bold transition-all hover:bg-slate-50 focus:ring-2", theme.focusRing, theme.borderFocus)}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-xl">
              <SelectItem value="nearest" className={cn("rounded-lg font-bold text-sm py-3 cursor-pointer", theme.itemFocus)}>Terdekat</SelectItem>
              <SelectItem value="rating" className={cn("rounded-lg font-bold text-sm py-3 cursor-pointer", theme.itemFocus)}>Rating Tertinggi</SelectItem>
              <SelectItem value="reviews" className={cn("rounded-lg font-bold text-sm py-3 cursor-pointer", theme.itemFocus)}>Ulasan Terbanyak</SelectItem>
              <SelectItem value="newest" className={cn("rounded-lg font-bold text-sm py-3 cursor-pointer", theme.itemFocus)}>Terbaru</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Responsive grid */}
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
                      <Badge className={cn("text-white border-none font-bold text-[9px] px-2 py-0.5 gap-1 shadow-md uppercase tracking-widest", theme.badgeSolid)}>
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
                      <MapPin className={cn("size-3", theme.iconColorDark)} />
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
                      <h3 className={cn("text-base font-bold text-slate-900 leading-tight transition-colors line-clamp-2", theme.hoverText)}>
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
                    <span className="text-[10px] text-slate-300 mx-1">•</span>
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
                    <div className={cn("flex items-center gap-1.5 text-[10px] font-extrabold px-2 py-1 rounded-md uppercase tracking-widest", theme.bgLight, theme.textMedium)}>
                      <Truck className={cn("size-3.5", theme.iconColorDark)} />
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
