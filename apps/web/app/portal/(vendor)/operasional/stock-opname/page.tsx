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
  Save,
  CheckCircle2
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
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
    <div className="p-8 space-y-8 animate-in fade-in duration-700 bg-[#FBFBFE]">
      {/* 1. Header & Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <Warehouse className="size-8 text-primary" />
            Stock Opname Harian
          </h1>
          <p className="text-muted-foreground font-medium max-w-2xl text-sm leading-relaxed">
            Lakukan pencatatan sisa fisik bahan baku di gudang/kulkas setiap selesai operasional dapur.
          </p>
        </div>
        
        <Badge variant="outline" className="h-10 px-4 rounded-xl border-slate-200 bg-white font-bold text-slate-600 gap-2 self-start md:self-center">
          <History className="size-4" />
          Log Terakhir: 15 Mar 2026
        </Badge>
      </div>

      <Alert className="bg-amber-50 border-amber-100 rounded-3xl shadow-sm shadow-amber-100/50 p-6 animate-in slide-in-from-top-2 duration-500">
        <AlertTriangle className="size-5 text-amber-600" />
        <div className="ml-2">
          <AlertTitle className="text-amber-900 font-black uppercase text-xs tracking-widest mb-1">PENTING: Sinkronisasi Inventaris</AlertTitle>
          <AlertDescription className="text-amber-700 text-sm font-bold leading-relaxed">
            Data sisa fisik yang diinput sebagai <span className="underline decoration-2">"Layak Pakai"</span> akan otomatis terhubung menjadi pengurang target belanja Anda pada halaman Kalkulasi Bahan besok pagi.
          </AlertDescription>
        </div>
      </Alert>

      {/* 2. Main Interactive Table */}
      <Card className="border-none shadow-xl bg-white rounded-[32px] overflow-hidden ring-1 ring-slate-100">
        <CardHeader className="p-8 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="size-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <Package className="size-6" />
            </div>
            <div>
              <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Daftar Inventaris Dapur</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 uppercase tracking-tighter">Inventory Post-Production</CardDescription>
            </div>
          </div>
          <Button 
            onClick={handleAddRow}
            className="rounded-2xl font-black text-xs uppercase tracking-widest h-12 px-6 gap-2 shadow-lg shadow-primary/20 active:scale-95 transition-all"
          >
            <Plus className="size-4" />
            Tambah Baris Bahan
          </Button>
        </CardHeader>

        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50/50 hover:bg-slate-50/50 border-b border-slate-100">
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-12 pl-8">Kategori</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-12">Nama Bahan</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center h-12">Sisa Fisik</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-12">Satuan</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest h-12">Kondisi Barang</TableHead>
                <TableHead className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center h-12 pr-8">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stockItems.map((item) => (
                <TableRow 
                  key={item.id} 
                  className={cn(
                    "hover:bg-slate-50/30 transition-colors border-b border-slate-50 last:border-0",
                    (item.condition === "Rusak" || item.condition === "Dibuang") && "bg-red-50/30"
                  )}
                >
                  <TableCell className="pl-8 py-5">
                    <Select 
                      value={item.category} 
                      onValueChange={(val) => handleUpdateField(item.id, 'category', val)}
                    >
                      <SelectTrigger className="w-[160px] h-10 rounded-xl border-slate-200 bg-white font-bold text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="Sembako" className="font-medium text-xs">Sembako</SelectItem>
                        <SelectItem value="Daging & Unggas" className="font-medium text-xs">Daging & Unggas</SelectItem>
                        <SelectItem value="Sayur & Buah" className="font-medium text-xs">Sayur & Buah</SelectItem>
                        <SelectItem value="Bumbu/Lainnya" className="font-medium text-xs">Bumbu/Lainnya</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input 
                      value={item.name}
                      placeholder="Contoh: Beras Pandan Wangi..."
                      onChange={(e) => handleUpdateField(item.id, 'name', e.target.value)}
                      className="h-10 rounded-xl border-slate-200 bg-white font-bold text-xs min-w-[200px]"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="max-w-[100px] mx-auto">
                      <Input 
                        type="number"
                        value={item.qty}
                        onChange={(e) => handleUpdateField(item.id, 'qty', e.target.value)}
                        className="h-10 text-center rounded-xl border-slate-200 bg-white font-black text-xs"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={item.unit} 
                      onValueChange={(val) => handleUpdateField(item.id, 'unit', val)}
                    >
                      <SelectTrigger className="w-[100px] h-10 rounded-xl border-slate-200 bg-white font-bold text-xs uppercase tracking-tighter">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="kg" className="font-medium text-xs uppercase">kg</SelectItem>
                        <SelectItem value="liter" className="font-medium text-xs uppercase">liter</SelectItem>
                        <SelectItem value="kotak" className="font-medium text-xs uppercase">kotak</SelectItem>
                        <SelectItem value="gram" className="font-medium text-xs uppercase">gram</SelectItem>
                        <SelectItem value="pack" className="font-medium text-xs uppercase">pack</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      value={item.condition} 
                      onValueChange={(val) => handleUpdateField(item.id, 'condition', val)}
                    >
                      <SelectTrigger className={cn(
                        "w-[140px] h-10 rounded-xl border-slate-200 font-bold text-xs transition-all shadow-sm",
                        item.condition === "Layak Pakai" ? "bg-white text-emerald-600" : "bg-red-50 text-red-600 border-red-100"
                      )}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-slate-200">
                        <SelectItem value="Layak Pakai" className="font-bold text-emerald-600 text-xs">Layak Pakai</SelectItem>
                        <SelectItem value="Rusak" className="font-bold text-red-600 text-xs">Rusak</SelectItem>
                        <SelectItem value="Dibuang" className="font-bold text-slate-400 text-xs">Dibuang</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell className="text-center pr-8">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleDeleteRow(item.id)}
                      className="size-9 rounded-full text-slate-300 hover:text-red-600 hover:bg-red-50 transition-all"
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {stockItems.length === 0 && (
            <div className="p-20 text-center space-y-4">
              <div className="size-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto">
                <Warehouse className="size-8" />
              </div>
              <p className="text-sm font-bold text-slate-400">Belum ada bahan baku yang dicatat.</p>
            </div>
          )}
        </CardContent>

        <CardFooter className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-full bg-white flex items-center justify-center border border-slate-100 shadow-sm text-slate-400 italic font-black text-xs">
              ?
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Dokumen</p>
              <p className="text-xs font-bold text-slate-500 italic">Terakhir diperbarui: Belum disimpan.</p>
            </div>
          </div>

          <Button 
            onClick={handleSave}
            className="w-full md:w-auto h-14 rounded-2xl px-10 font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 gap-3 active:scale-95 transition-all"
          >
            <ClipboardCheck className="size-5" />
            Kunci & Simpan Opname Hari Ini
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
