"use client"

import * as React from "react"
import Link from "next/link"
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit3, 
  Trash2, 
  Eye, 
  EyeOff,
  ChevronRight,
  Sparkles,
  CheckCircle2
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
import { useToast } from "@workspace/ui/hooks/use-toast"
import { cn } from "@workspace/ui/lib/utils"

export default function SupplierProductsPage() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = React.useState("")

  const products = [
    {
      id: 1,
      name: "Daging Ayam Broiler Segar",
      category: "Daging & Unggas",
      price: "Rp 32.000 / kg",
      stock: "500 kg / hari",
      status: "Active",
      image: "https://images.unsplash.com/photo-1587593810167-a84920ea0781?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      views: 450
    },
    {
      id: 2,
      name: "Telur Ayam Ras Grade A",
      category: "Telur",
      price: "Rp 26.500 / kg",
      stock: "200 kg / hari",
      status: "Active",
      image: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      views: 320
    },
    {
      id: 3,
      name: "Beras Rojolele Premium",
      category: "Sembako",
      price: "Rp 15.000 / kg",
      stock: "2.000 kg / hari",
      status: "Inactive",
      image: "https://plus.unsplash.com/premium_photo-1705338026411-00639520a438?fm=jpg&q=60&w=3000&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
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

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Katalog Produk</h1>
          <p className="text-muted-foreground font-medium mt-1">Kelola daftar bahan baku yang Anda tawarkan ke Vendor SPPG.</p>
        </div>
        
        <Link href="/portal/supplier/products/add">
          <Button className="rounded-full px-6 font-bold gap-2 shadow-lg shadow-primary/20 text-white">
            <Plus className="size-5" /> Tambah Produk Baru
          </Button>
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <Card className="border-border shadow-sm rounded-2xl overflow-hidden">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input 
              placeholder="Cari nama produk..." 
              className="pl-10 h-11 bg-slate-50/50 rounded-xl border-slate-200"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold text-slate-600 px-5">
              <Filter className="size-4" /> Kategori
            </Button>
            <Button variant="outline" className="h-11 rounded-xl gap-2 font-bold text-slate-600 px-5">
              Urutkan
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {products.map((product) => (
          <Card key={product.id} className="group border-border shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden flex flex-col">
            <div className="relative aspect-video overflow-hidden">
              <img 
                src={product.image} 
                alt={product.name} 
                className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute top-3 left-3 flex gap-2">
                <Badge className={cn(
                  "border-none font-black text-[9px] uppercase tracking-tighter px-2",
                  product.status === 'Active' ? "bg-emerald-500 text-white" : "bg-slate-500 text-white"
                )}>
                  {product.status}
                </Badge>
                <Badge className="bg-white/90 text-slate-900 border-none shadow-sm font-black text-[9px] uppercase tracking-tighter flex gap-1 items-center">
                  <CheckCircle2 className="size-3 text-emerald-500" /> Real Photo
                </Badge>
              </div>
              <div className="absolute top-3 right-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="size-8 rounded-full bg-white/80 hover:bg-white text-slate-900 shadow-sm backdrop-blur-sm">
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl w-40">
                    <DropdownMenuItem className="gap-2 font-bold text-xs py-2.5">
                      <Edit3 className="size-4" /> Edit Produk
                    </DropdownMenuItem>
                    <DropdownMenuItem className="gap-2 font-bold text-xs py-2.5">
                      {product.status === 'Active' ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                      {product.status === 'Active' ? 'Sembunyikan' : 'Tampilkan'}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      className="gap-2 font-bold text-xs py-2.5 text-destructive focus:text-destructive"
                      onClick={() => handleDelete(product.name)}
                    >
                      <Trash2 className="size-4" /> Hapus Produk
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
            
            <CardContent className="p-6 flex-1 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-primary uppercase tracking-widest">{product.category}</p>
                <h3 className="font-bold text-slate-900 leading-tight group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Harga Satuan</p>
                  <p className="text-xs font-black text-slate-900">{product.price}</p>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                  <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Kapasitas</p>
                  <p className="text-xs font-black text-slate-900">{product.stock}</p>
                </div>
              </div>
            </CardContent>

            <CardFooter className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Eye className="size-3.5" />
                <span className="text-[10px] font-bold uppercase">{product.views} Views</span>
              </div>
              <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest gap-1 hover:bg-transparent hover:text-primary p-0 h-auto">
                Detail <ChevronRight className="size-3" />
              </Button>
            </CardFooter>
          </Card>
        ))}

        {/* Empty State / Add Card */}
        <Link href="/portal/supplier/products/add" className="contents">
          <Card className="border-2 border-dashed border-slate-200 bg-slate-50/30 rounded-3xl flex flex-col items-center justify-center p-8 gap-4 min-h-[350px] group hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer">
            <div className="size-16 bg-white rounded-full flex items-center justify-center shadow-sm border border-slate-100 group-hover:scale-110 transition-transform">
              <Plus className="size-8 text-slate-400 group-hover:text-primary transition-colors" />
            </div>
            <div className="text-center">
              <h4 className="font-bold text-slate-900">Tambah Produk</h4>
              <p className="text-xs text-muted-foreground font-medium">Klik untuk menambah item baru ke katalog.</p>
            </div>
          </Card>
        </Link>
      </div>

      {/* Success Badge Banner */}
      <div className="bg-primary/5 border border-primary/10 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6">
        <div className="size-12 bg-primary rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
          <Sparkles className="size-6" />
        </div>
        <div className="space-y-1 text-center md:text-left">
          <h4 className="font-bold text-slate-900">Tips: Gunakan Foto Produk Riil</h4>
          <p className="text-xs text-muted-foreground font-medium">Produk dengan label <span className="text-emerald-600 font-bold">"Real Photo"</span> memiliki tingkat kepercayaan 4x lebih tinggi di mata Vendor SPPG.</p>
        </div>
        <Button className="md:ml-auto rounded-full bg-white text-primary border-primary/20 border hover:bg-primary hover:text-white font-bold text-xs transition-all px-6">
          Pelajari Caranya
        </Button>
      </div>
    </div>
  )
}
