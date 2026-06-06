"use client"

import * as React from "react"
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Plus, 
  Trash2, 
  Package, 
  Warehouse,
  History,
  Save
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@workspace/ui/components/card"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"
import { Alert, AlertDescription, AlertTitle } from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"

interface StockItem {
  id: string
  category: string
  name: string
  qty: number
  unit: string
  condition: string
}

export default function StockOpnamePage() {
  const { toast } = useToast()
  
  const [stockItems, setStockItems] = React.useState<StockItem[]>([
    { id: "1", category: "Sembako", name: "Beras Putih (Premium)", qty: 5, unit: "kg", condition: "Layak Pakai" },
    { id: "2", category: "Daging & Unggas", name: "Daging Ayam Fillet", qty: 2.5, unit: "kg", condition: "Layak Pakai" },
    { id: "3", category: "Sayur & Buah", name: "Tomat Merah", qty: 1.2, unit: "kg", condition: "Rusak" },
  ])

  const handleUpdateField = (id: string, field: keyof StockItem, value: any) => {
    setStockItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ))
  }

  const handleAddRow = () => {
    const newItem: StockItem = {
      id: Math.random().toString(36).substr(2, 9),
      category: "Sembako",
      name: "",
      qty: 0,
      unit: "kg",
      condition: "Layak Pakai"
    }
    setStockItems(prev => [...prev, newItem])
  }

  const handleDeleteRow = (id: string) => {
    setStockItems(prev => prev.filter(item => item.id !== id))
    toast({
      title: "Baris Dihapus",
      description: "Data bahan baku telah dihapus dari daftar.",
    })
  }

  const handleSave = () => {
    toast({
      title: "Data Tersimpan",
      description: "Stock opname hari ini telah dikunci dan masuk ke sistem.",
    })
  }

  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      
      {/* 1. Deep Teal Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Warehouse className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-teal-500/20 text-teal-100 border border-teal-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse mr-2 inline-block" /> Inventory Control
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Stock Opname Harian</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Lakukan pencatatan sisa fisik bahan baku di gudang dapur setiap selesai operasional untuk efisiensi belanja besok.
            </p>
          </div>
          
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-4 shrink-0">
            <History className="size-5 text-teal-300" />
            <div>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest">Log Terakhir</p>
              <p className="text-sm font-bold text-white mt-0.5">15 Mar 2026</p>
            </div>
          </div>
        </div>
      </div>

      <Alert className="bg-amber-50 border-amber-200 rounded-2xl shadow-sm p-6 flex gap-4 items-start">
        <AlertTriangle className="size-6 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <AlertTitle className="text-amber-900 font-bold uppercase text-xs tracking-widest mb-1.5">PENTING: Sinkronisasi Inventaris</AlertTitle>
          <AlertDescription className="text-amber-800 text-sm font-semibold leading-relaxed">
            Data sisa fisik yang diinput sebagai <Badge className="bg-emerald-100 text-emerald-800 border-none px-2 mx-1 rounded-md">Layak Pakai</Badge> 
            akan otomatis terhubung menjadi pengurang target belanja Anda pada halaman Kalkulasi Bahan besok pagi.
          </AlertDescription>
        </div>
      </Alert>

      {/* 2. Main Interactive Table */}
      <Card className="border-none shadow-sm bg-white rounded-2xl overflow-hidden ring-1 ring-slate-200/60">
        <CardHeader className="p-6 md:p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-sm border border-teal-100">
              <Package className="size-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold text-slate-900 tracking-tight">Daftar Inventaris Dapur</CardTitle>
              <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Inventory Post-Production</CardDescription>
            </div>
          </div>
          <Button 
            onClick={handleAddRow}
            className="rounded-xl font-bold text-xs uppercase tracking-widest h-12 px-6 gap-2 shadow-md bg-teal-600 hover:bg-teal-700 text-white active:scale-95 transition-all"
          >
            <Plus className="size-4" />
            Tambah Baris Bahan
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white border-b border-slate-100">
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-14 pl-8">Kategori</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-14 min-w-[250px]">Nama Bahan</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center h-14">Sisa Fisik</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-14">Satuan</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest h-14">Kondisi Barang</TableHead>
                <TableHead className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center h-14 pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockItems.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={cn(
                    "hover:bg-slate-50/50 transition-colors border-b border-slate-50 last:border-0",
                    (item.condition === "Rusak" || item.condition === "Dibuang") && "bg-red-50/30 hover:bg-red-50/50"
                  )}
                >
                  <TableCell className="pl-8 py-5">
                    <Select 
                      value={item.category} 
                      onValueChange={(val) => handleUpdateField(item.id, 'category', val)}
                    >
                      <SelectTrigger className="w-[160px] h-12 rounded-xl border-slate-200 bg-white font-bold text-xs text-slate-700 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        <SelectItem value="Sembako" className="rounded-lg font-bold text-xs py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Sembako</SelectItem>
                        <SelectItem value="Daging & Unggas" className="rounded-lg font-bold text-xs py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Daging & Unggas</SelectItem>
                        <SelectItem value="Sayur & Buah" className="rounded-lg font-bold text-xs py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Sayur & Buah</SelectItem>
                        <SelectItem value="Bumbu/Lainnya" className="rounded-lg font-bold text-xs py-3 focus:bg-teal-50 focus:text-teal-900 cursor-pointer">Bumbu/Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={item.name}
                      placeholder="Contoh: Beras Pandan Wangi..."
                      onChange={(e) => handleUpdateField(item.id, 'name', e.target.value)}
                      className="h-12 rounded-xl border-slate-200 bg-white font-bold text-sm text-slate-900 w-full focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="max-w-[100px] mx-auto">
                      <Input 
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleUpdateField(item.id, 'qty', e.target.value)}
                        className="h-12 text-center rounded-xl border-slate-200 bg-white font-black text-sm text-slate-900 focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 shadow-sm"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={item.unit} 
                      onValueChange={(val) => handleUpdateField(item.id, 'unit', val)}
                    >
                      <SelectTrigger className="w-[100px] h-12 rounded-xl border-slate-200 bg-white font-bold text-xs uppercase tracking-widest focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        <SelectItem value="kg" className="rounded-lg font-bold text-xs uppercase py-3 cursor-pointer">KG</SelectItem>
                        <SelectItem value="liter" className="rounded-lg font-bold text-xs uppercase py-3 cursor-pointer">LITER</SelectItem>
                        <SelectItem value="kotak" className="rounded-lg font-bold text-xs uppercase py-3 cursor-pointer">KOTAK</SelectItem>
                        <SelectItem value="gram" className="rounded-lg font-bold text-xs uppercase py-3 cursor-pointer">GRAM</SelectItem>
                        <SelectItem value="pack" className="rounded-lg font-bold text-xs uppercase py-3 cursor-pointer">PACK</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={item.condition} 
                      onValueChange={(val) => handleUpdateField(item.id, 'condition', val)}
                    >
                      <SelectTrigger className={cn(
                        "w-[140px] h-12 rounded-xl border font-bold text-xs transition-all shadow-sm focus:ring-2 focus:ring-teal-500/20",
                        item.condition === "Layak Pakai" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : 
                        item.condition === "Rusak" ? "bg-red-50 text-red-700 border-red-200" :
                        "bg-slate-50 text-slate-500 border-slate-200"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200 shadow-xl">
                        <SelectItem value="Layak Pakai" className="rounded-lg font-bold text-emerald-700 text-xs py-3 focus:bg-emerald-50 cursor-pointer">Layak Pakai</SelectItem>
                        <SelectItem value="Rusak" className="rounded-lg font-bold text-red-700 text-xs py-3 focus:bg-red-50 cursor-pointer">Rusak</SelectItem>
                        <SelectItem value="Dibuang" className="rounded-lg font-bold text-slate-500 text-xs py-3 focus:bg-slate-50 cursor-pointer">Dibuang</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center pr-8">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteRow(item.id)}
                      className="size-10 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent transition-all"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {stockItems.length === 0 && (
            <div className="p-24 text-center space-y-4">
              <div className="size-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-300 mx-auto">
                <Warehouse className="size-8" />
              </div>
              <p className="text-sm font-bold text-slate-500">Belum ada bahan baku yang dicatat.</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white flex items-center justify-center border border-slate-200 shadow-sm text-slate-400 font-black text-sm">
              ?
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Dokumen</p>
              <p className="text-xs font-semibold text-slate-500 italic">Terakhir diperbarui: Belum disimpan.</p>
            </div>
          </div>

          <Button 
            onClick={handleSave}
            className="w-full md:w-auto h-14 rounded-xl px-10 font-bold text-sm uppercase tracking-widest shadow-lg bg-teal-600 hover:bg-teal-700 text-white gap-3 active:scale-95 transition-all"
          >
            <ClipboardCheck className="size-5" />
            Kunci & Simpan Opname Hari Ini
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
