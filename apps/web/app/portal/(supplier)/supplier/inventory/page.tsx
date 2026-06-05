"use client"

import * as React from "react"
import { 
  Search, 
  Filter, 
  PackageSearch,
  ArrowRight,
  TrendingUp,
  Download,
  AlertTriangle,
  ArrowDownToLine,
  ArrowUpToLine,
  MoreHorizontal,
  RefreshCw,
  Box,
  Boxes,
  Database
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@workspace/ui/components/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu"
import { cn } from "@workspace/ui/lib/utils"

export default function SupplierInventoryPage() {
  const [hoveredRow, setHoveredRow] = React.useState<number | null>(null);

  // Mock Data untuk Tabel Stok Gudang
  const inventoryData = [
    { 
      sku: "DGS-001", 
      name: "Daging Sapi Paha Belakang", 
      category: "Daging",
      physical: 1200, 
      booked: 450, 
      unit: "Kg",
      lastRestock: "12 Nov 2023",
      status: "Aman"
    },
    { 
      sku: "DGA-002", 
      name: "Daging Ayam Karkas Segar", 
      category: "Unggas",
      physical: 850, 
      booked: 800, 
      unit: "Kg",
      lastRestock: "14 Nov 2023",
      status: "Kritis" // Karena efektif sisa 50kg
    },
    { 
      sku: "BTR-001", 
      name: "Beras Premium Rojolele", 
      category: "Sembako",
      physical: 5000, 
      booked: 1200, 
      unit: "Kg",
      lastRestock: "01 Nov 2023",
      status: "Aman"
    },
    { 
      sku: "TLR-003", 
      name: "Telur Ayam Ras Grade A", 
      category: "Protein",
      physical: 300, 
      booked: 250, 
      unit: "Tray",
      lastRestock: "13 Nov 2023",
      status: "Menipis"
    },
    { 
      sku: "MYK-005", 
      name: "Minyak Goreng Sawit 2L", 
      category: "Sembako",
      physical: 1200, 
      booked: 300, 
      unit: "Pouch",
      lastRestock: "05 Nov 2023",
      status: "Aman"
    },
    { 
      sku: "SYR-011", 
      name: "Sayur Sop Pack (Wortel, Buncis, Kentang)", 
      category: "Sayuran",
      physical: 150, 
      booked: 140, 
      unit: "Pack",
      lastRestock: "Hari Ini",
      status: "Kritis"
    }
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto min-h-screen">
      
      {/* 1. Deep Orange Hero Banner (Vendor Style) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-900 via-orange-800 to-slate-900 shadow-sm border border-orange-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Database className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-orange-500/20 text-orange-100 border border-orange-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-orange-400 animate-pulse mr-2 inline-block" /> Back-Office Gudang
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Manajemen Stok (Inventory)</h1>
            <p className="text-orange-100/80 text-sm max-w-xl leading-relaxed">
              Pantau mutasi barang, kalkulasi stok efektif setelah dipotong PO (Purchase Order) yang masuk, dan cegah kekosongan suplai ke Dapur Vendor.
            </p>
          </div>
          
          <div className="flex bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-3 gap-4 shrink-0">
            <div>
              <p className="text-[9px] font-bold text-orange-200 uppercase tracking-widest">Total SKU Aktif</p>
              <p className="text-white font-bold flex items-center mt-1 text-sm">
                <Box className="size-3.5 mr-1.5 text-orange-400" />
                1,248 Item
              </p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex items-center">
              <Button variant="outline" className="h-8 bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-lg text-xs font-bold px-3 transition-colors">
                <RefreshCw className="size-3.5 mr-2" />
                Sinkronisasi
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Stats Khusus Gudang */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nilai Aset Gudang</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">Rp 2.45<span className="text-sm font-bold text-slate-400 ml-1">Miliar</span></h3>
            </div>
            <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-100">
              <TrendingUp className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Total Tonase Fisik</p>
              <h3 className="text-xl font-black text-slate-900 tracking-tighter">184.2<span className="text-sm font-bold text-slate-400 ml-1">Ton</span></h3>
            </div>
            <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 border border-blue-100">
              <Boxes className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <CardContent className="p-5 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">PO Belum Dikirim</p>
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-black text-slate-900 tracking-tighter">45</h3>
                <span className="text-xs font-bold text-orange-600 bg-orange-50 px-1.5 py-0.5 rounded-md">12.5 Ton</span>
              </div>
            </div>
            <div className="size-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 border border-orange-100">
              <PackageSearch className="size-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-50 border border-red-100 rounded-2xl overflow-hidden shadow-sm relative">
          <CardContent className="p-5 flex items-center justify-between relative z-10">
            <div>
              <p className="text-[10px] font-bold text-red-700 uppercase tracking-widest mb-1 flex items-center gap-1">
                <AlertTriangle className="size-3" /> SKU Kritis
              </p>
              <h3 className="text-xl font-black text-red-900 tracking-tighter">12 <span className="text-sm font-bold text-red-700">Barang</span></h3>
            </div>
            <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white shadow-sm h-8 px-3 rounded-lg text-xs font-bold">
              Restock
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Section */}
      <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Spreadsheet Gudang Terpusat</h2>
            <p className="text-[11px] font-semibold text-slate-500 mt-0.5">Pemantauan *real-time* ketersediaan stok fisik vs alokasi order berjalan.</p>
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input 
                placeholder="Cari SKU atau nama barang..." 
                className="pl-9 h-9 bg-white border-slate-200 rounded-lg text-sm font-medium focus:ring-1 focus:ring-orange-500 focus:border-orange-500 transition-colors"
              />
            </div>
            <Button variant="outline" size="sm" className="h-9 rounded-lg font-bold text-slate-600 px-3 border-slate-200 bg-white hover:bg-slate-50 shrink-0">
              <Filter className="size-3.5 mr-2" /> Kategori
            </Button>
            <Button variant="outline" size="sm" className="h-9 rounded-lg font-bold text-orange-700 px-3 border-orange-200 bg-orange-50 hover:bg-orange-100 shrink-0 hidden md:flex">
              <Download className="size-3.5 mr-2" /> Export .CSV
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow className="border-b border-slate-200 hover:bg-transparent">
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 pl-6 h-12 w-[280px]">Barang & SKU</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 h-12 text-right">Stok Fisik</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-orange-600 h-12 text-right">Ter-Booking (PO)</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-emerald-600 h-12 text-right bg-emerald-50/50">Stok Efektif</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 h-12 text-center">Status</TableHead>
                <TableHead className="font-bold text-[10px] uppercase tracking-widest text-slate-500 text-right pr-6 h-12">Manajemen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {inventoryData.map((item, i) => {
                const effectiveStock = item.physical - item.booked;
                const progressPercentage = (effectiveStock / item.physical) * 100;
                
                return (
                  <TableRow 
                    key={i} 
                    className={cn(
                      "group border-b border-slate-100 last:border-0 transition-colors cursor-pointer",
                      hoveredRow === i ? "bg-slate-50/80" : "bg-white"
                    )}
                    onMouseEnter={() => setHoveredRow(i)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    <TableCell className="pl-6 py-4">
                      <p className="font-bold text-slate-900 text-xs mb-1">{item.name}</p>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-slate-400 font-bold bg-slate-100 px-1.5 py-0.5 rounded">{item.sku}</span>
                        <span className="text-[10px] text-orange-600 font-bold uppercase tracking-widest">{item.category}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 text-right">
                      <p className="text-sm font-black text-slate-900">{item.physical.toLocaleString('id-ID')} <span className="text-[10px] text-slate-500 font-bold ml-0.5">{item.unit}</span></p>
                      <p className="text-[9px] text-slate-400 font-semibold mt-1">Refill: {item.lastRestock}</p>
                    </TableCell>
                    
                    <TableCell className="py-4 text-right">
                      <div className="inline-flex items-center justify-end gap-1.5 bg-orange-50 border border-orange-100 px-2 py-1 rounded-md">
                        <PackageSearch className="size-3 text-orange-500" />
                        <span className="text-sm font-black text-orange-700">{item.booked.toLocaleString('id-ID')}</span>
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 text-right bg-emerald-50/20 group-hover:bg-emerald-50/50 transition-colors">
                      <p className={cn(
                        "text-sm font-black",
                        effectiveStock <= 50 ? "text-red-600" : effectiveStock <= 300 ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {effectiveStock.toLocaleString('id-ID')} <span className="text-[10px] font-bold ml-0.5 opacity-70">{item.unit}</span>
                      </p>
                      {/* Visual bar mini */}
                      <div className="w-16 h-1.5 bg-slate-100 rounded-full ml-auto mt-1.5 overflow-hidden">
                        <div 
                          className={cn(
                            "h-full rounded-full",
                            effectiveStock <= 50 ? "bg-red-500" : effectiveStock <= 300 ? "bg-amber-500" : "bg-emerald-500"
                          )} 
                          style={{ width: `${Math.max(progressPercentage, 5)}%` }} 
                        />
                      </div>
                    </TableCell>
                    
                    <TableCell className="py-4 text-center">
                      <Badge className={cn(
                        "border-none text-[9px] uppercase font-bold tracking-widest px-2 py-1 shadow-sm rounded-md",
                        item.status === 'Kritis' ? 'bg-red-100 text-red-700' : 
                        item.status === 'Menipis' ? 'bg-amber-100 text-amber-700' : 
                        'bg-emerald-100 text-emerald-700'
                      )}>
                        {item.status}
                      </Badge>
                    </TableCell>
                    
                    <TableCell className="text-right pr-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        {/* Quick Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity mr-2">
                          <Button size="icon" variant="ghost" className="size-7 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-md" title="Stok Masuk">
                            <ArrowDownToLine className="size-3.5" />
                          </Button>
                          <Button size="icon" variant="ghost" className="size-7 bg-red-50 hover:bg-red-100 text-red-700 rounded-md" title="Stok Keluar/Rusak">
                            <ArrowUpToLine className="size-3.5" />
                          </Button>
                        </div>
                        
                        {/* Dropdown Menu */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="icon" className="size-8 rounded-lg text-slate-500 border-slate-200">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-lg border-slate-200 p-1">
                            <DropdownMenuLabel className="text-[10px] uppercase font-bold text-slate-400 tracking-widest px-2">Aksi Gudang</DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem className="text-xs font-bold py-2 rounded-lg cursor-pointer">
                              <ArrowDownToLine className="size-3.5 mr-2 text-emerald-600" /> Tambah Stok (Inbound)
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs font-bold py-2 rounded-lg cursor-pointer">
                              <ArrowUpToLine className="size-3.5 mr-2 text-amber-600" /> Mutasi Keluar (Outbound)
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem className="text-xs font-bold py-2 rounded-lg cursor-pointer text-slate-600">
                              <PackageSearch className="size-3.5 mr-2" /> Lihat Riwayat Kartu Stok
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
