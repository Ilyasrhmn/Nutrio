"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  ChevronRight,
  CheckCircle2,
  Box,
  Tags,
  Layers,
  ArrowDownToLine,
  Package,
  Database
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@workspace/ui/components/dropdown-menu"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { cn } from "@workspace/ui/lib/utils"

export default function SupplierProductsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedProducts, setSelectedProducts] = React.useState<number[]>([])
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  const products = [
    {
      id: 1,
      name: "Daging Ayam Broiler Segar (Potong Karkas)",
      category: "Daging & Unggas",
      price: "Rp 32.000 / kg",
      moq: "50 kg",
      wholesalePrice: "Rp 29.500 (≥ 200 kg)",
      stock: "500 kg / hari",
      status: "Active",
      image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80",
      views: 450
    },
    {
      id: 2,
      name: "Telur Ayam Ras Grade A (Partai Besar)",
      category: "Telur",
      price: "Rp 26.500 / kg",
      moq: "20 tray",
      wholesalePrice: "Rp 25.000 (≥ 100 tray)",
      stock: "200 tray / hari",
      status: "Active",
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=800&q=80",
      views: 320
    },
    {
      id: 3,
      name: "Beras Rojolele Premium Organik",
      category: "Sembako",
      price: "Rp 15.000 / kg",
      moq: "100 kg",
      wholesalePrice: "Rp 14.200 (≥ 500 kg)",
      stock: "2.000 kg / hari",
      status: "Inactive",
      image: "https://plus.unsplash.com/premium_photo-1705338026411-00639520a438?auto=format&fit=crop&w=800&q=80",
      views: 180
    }
  ]

  const handleDelete = (name: string) => {
    toast({
      title: "Produk Dihapus",
      description: `Produk ${name} telah dihapus dari katalog.`,
      variant: "destructive"
    })
  }

  const toggleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([])
    } else {
      setSelectedProducts(products.map(p => p.id))
    }
  }

  const toggleProduct = (id: number) => {
    setSelectedProducts(prev => 
      prev.includes(id) ? prev.filter(pId => pId !== id) : [...prev, id]
    )
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto min-h-screen">
      {!mounted ? (
        <div className="h-96 flex items-center justify-center">
          <div className="animate-pulse text-slate-400 font-medium">Memuat katalog...</div>
        </div>
      ) : (
        <>
      
      {/* Deep Orange Hero Banner (Vendor Style) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-900 via-orange-800 to-slate-900 shadow-sm border border-orange-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Package className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-orange-500/20 text-orange-100 border border-orange-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-orange-400 animate-pulse mr-2 inline-block" /> B2B Wholesale Catalog
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Manajemen Produk & Harga</h1>
            <p className="text-orange-100/80 text-sm max-w-xl leading-relaxed">
              Kelola daftar produk, Minimum Order Quantity (MOQ), dan Harga Grosir untuk menarik lebih banyak pesanan massal dari Vendor BGN.
            </p>
          </div>
          
          <div className="shrink-0 flex items-center gap-3">
            <Link href="/portal/supplier/inventory">
              <Button className="rounded-xl h-10 px-5 font-bold bg-orange-800/50 text-white hover:bg-orange-800 border border-orange-700/50 shadow-sm transition-colors backdrop-blur-sm">
                <Database className="size-4 mr-2 text-orange-200" /> Back-Office Gudang
              </Button>
            </Link>
            <Link href="/portal/supplier/products/add">
              <Button className="rounded-xl h-10 px-6 font-bold bg-white text-orange-900 hover:bg-orange-50 shadow-sm transition-colors border border-white">
                <Plus className="size-4 mr-2" /> Tambah Produk
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Filter & Bulk Actions Bar (Bento Style) */}
      <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
        <CardContent className="p-3 flex flex-col md:flex-row items-center gap-4">
          <div className="flex items-center gap-3 px-3 border-r border-slate-100 pr-5 shrink-0">
            <Checkbox 
              checked={selectedProducts.length === products.length && products.length > 0}
              onCheckedChange={toggleSelectAll}
              className="border-slate-300 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 size-4 rounded"
            />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {selectedProducts.length > 0 ? `${selectedProducts.length} Terpilih` : 'Pilih Semua'}
            </span>
          </div>

          {selectedProducts.length > 0 ? (
            <div className="flex gap-2 flex-1 w-full animate-in fade-in zoom-in-95 duration-200">
              <Button variant="outline" size="sm" className="h-9 rounded-lg font-bold text-slate-700 bg-white border-slate-200 hover:bg-slate-50">
                <Edit3 className="size-3.5 mr-2" /> Edit Harga Massal
              </Button>
              <Button variant="outline" size="sm" className="h-9 rounded-lg font-bold text-red-600 bg-red-50 border-red-100 hover:bg-red-100">
                <Trash2 className="size-3.5 mr-2" /> Hapus
              </Button>
            </div>
          ) : (
            <div className="flex-1 flex gap-3 w-full">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                <Input 
                  placeholder="Cari produk atau SKU..." 
                  className="pl-9 h-9 bg-slate-50 border-slate-200 rounded-lg text-sm font-medium focus:bg-white focus:ring-0 focus:border-orange-500 transition-colors"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="sm" className="h-9 rounded-lg font-bold text-slate-600 px-4 border-slate-200 hover:bg-slate-50 shrink-0">
                <Filter className="size-3.5 mr-2" /> Kategori
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Product Grid - Bento Style */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className={cn(
            "group bg-white border border-slate-200 transition-all rounded-2xl overflow-hidden flex flex-col relative",
            selectedProducts.includes(product.id) ? "border-orange-500 bg-orange-50/10" : "hover:border-slate-300"
          )}>
            <div className="absolute top-3 left-3 z-20">
              <Checkbox 
                checked={selectedProducts.includes(product.id)}
                onCheckedChange={() => toggleProduct(product.id)}
                className="border-white/50 data-[state=checked]:bg-orange-600 data-[state=checked]:border-orange-600 size-5 rounded bg-black/20 backdrop-blur-sm"
              />
            </div>

            <div className="relative aspect-[16/9] overflow-hidden bg-slate-100">
              <img 
                src={product.image} 
                alt={product.name} 
                className="object-cover w-full h-full"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-80" />
              
              <div className="absolute bottom-3 left-3 flex gap-2">
                <Badge className={cn(
                  "border-none font-bold text-[8px] uppercase tracking-widest px-2 py-0.5 rounded backdrop-blur-md",
                  product.status === 'Active' ? "bg-emerald-500/90 text-white" : "bg-slate-700/90 text-white"
                )}>
                  {product.status === 'Active' ? 'Aktif' : 'Nonaktif'}
                </Badge>
              </div>

              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity z-20">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="size-8 rounded-lg bg-white/90 hover:bg-white text-slate-900 shadow-sm backdrop-blur-sm border border-slate-200/50">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl w-40 p-1 shadow-md border-slate-200">
                    <DropdownMenuItem className="font-bold text-xs py-2 rounded-lg cursor-pointer focus:bg-slate-50">
                      <Edit3 className="size-3.5 mr-2" /> Edit Produk
                    </DropdownMenuItem>
                    <DropdownMenuItem className="font-bold text-xs py-2 rounded-lg cursor-pointer focus:bg-slate-50">
                      {product.status === 'Active' ? <EyeOff className="size-3.5 mr-2" /> : <Eye className="size-3.5 mr-2" />}
                      {product.status === 'Active' ? 'Sembunyikan' : 'Tampilkan'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-slate-100" />
                    <DropdownMenuItem 
                      className="font-bold text-xs py-2 rounded-lg text-red-600 cursor-pointer focus:bg-red-50 focus:text-red-700"
                      onClick={() => handleDelete(product.name)}
                    >
                      <Trash2 className="size-3.5 mr-2" /> Hapus Produk
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <CardContent className="p-5 flex-1 space-y-4">
              <div>
                <p className="text-[9px] font-bold text-orange-600 uppercase tracking-widest flex items-center gap-1 mb-1">
                  <Box className="size-3" /> {product.category}
                </p>
                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {product.name}
                </h3>
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Harga Retail</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{product.price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Kapasitas</p>
                    <p className="text-xs font-bold text-slate-900 mt-0.5">{product.stock}</p>
                  </div>
                </div>

                {/* Wholesale Price Tag - B2B Core Feature */}
                <div className="p-3 rounded-xl bg-orange-50 border border-orange-100 flex items-start gap-2.5">
                  <div className="size-6 rounded-md bg-orange-100 flex items-center justify-center shrink-0 text-orange-600 mt-0.5">
                    <Layers className="size-3" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-[9px] font-bold text-orange-700 uppercase tracking-widest">Harga Grosir</p>
                      <Badge className="bg-orange-500 text-white border-none text-[8px] font-bold uppercase tracking-widest px-1.5 py-0 rounded-sm">
                        Min. {product.moq}
                      </Badge>
                    </div>
                    <p className="text-sm font-black text-slate-900 mt-0.5">{product.wholesalePrice}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {/* Add Card (Bento Style) */}
        <Link href="/portal/supplier/products/add" className="contents">
          <Card className="border border-dashed border-slate-300 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center p-6 gap-4 min-h-[350px] hover:border-orange-500 hover:bg-orange-50/30 transition-colors cursor-pointer group">
            <div className="size-14 bg-white rounded-xl flex items-center justify-center shadow-sm border border-slate-200 group-hover:bg-orange-500 group-hover:border-orange-500 transition-colors">
              <Plus className="size-6 text-slate-400 group-hover:text-white transition-colors" />
            </div>
            <div className="text-center space-y-1">
              <h4 className="text-sm font-bold text-slate-900">Tambah Produk</h4>
              <p className="text-[11px] text-slate-500 font-medium">Buat komoditas dengan tiering B2B.</p>
            </div>
          </Card>
        </Link>
      </div>
      </>
      )}
    </div>
  )
}
