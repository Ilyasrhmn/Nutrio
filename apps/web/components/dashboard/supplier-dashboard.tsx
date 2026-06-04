"use client"

import React from "react"
import {
  Store,
  Package,
  ShoppingCart,
  TrendingUp,
  MessageSquare,
  Truck,
  CheckCircle2,
  Clock,
  Plus
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Progress } from "@workspace/ui/components/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

export function SupplierDashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Kontrol Penjualan</h1>
          <p className="text-slate-500 text-sm mt-1">Monitoring arus kas penjualan dan logistik bahan baku.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" className="rounded-lg font-semibold border-slate-200 text-slate-600 h-10">
            Kelola Produk
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-semibold shadow-sm h-10 gap-2">
            <Plus className="size-4" />
            Tambah Stok Bahan
          </Button>
        </div>
      </div>

      {/* Sales & Logistic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-slate-200/60 shadow-sm rounded-xl">
          <CardContent className="p-6 space-y-4">
            <div className="size-10 bg-emerald-50 flex items-center justify-center rounded-lg text-emerald-600">
              <TrendingUp className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Penjualan (Bulan Ini)</p>
              <h3 className="text-2xl font-bold text-slate-900 mt-1">Rp 142.500.000</h3>
              <Badge className="bg-emerald-50 hover:bg-emerald-50 text-emerald-600 border-none font-bold mt-2 text-[10px]">
                +12% vs Jan
              </Badge>
            </div>
          </CardContent>
        </Card>

        {[
          { label: "Pesanan Aktif (PO)", value: "—", sub: "Menunggu Pengiriman", icon: ShoppingCart, color: "blue" },
          { label: "Produk Terlaris", value: "—", sub: "Belum ada data", icon: Package, color: "primary" },
          { label: "Rating Supplier", value: "—", sub: "Belum ada ulasan", icon: CheckCircle2, color: "amber" },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-200/60 shadow-sm rounded-xl">
            <CardContent className="p-6 space-y-4">
              <div className={`size-10 bg-${stat.color}-50 flex items-center justify-center rounded-lg text-${stat.color}-600`}>
                <stat.icon className="size-5" />
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-900 mt-1">{stat.value}</h3>
                <p className="text-xs font-medium text-slate-500 mt-1">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Fulfillment */}
        <Card className="lg:col-span-2 border-slate-200/60 shadow-sm rounded-xl flex flex-col overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5 flex flex-row justify-between items-center">
            <CardTitle className="text-sm font-bold text-slate-900 uppercase tracking-tight">Pesanan Baru dari Vendor</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs font-semibold text-indigo-600 hover:bg-indigo-50">
              Lihat Semua PO
            </Button>
          </CardHeader>
          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader className="bg-slate-50/50 hidden md:table-header-group">
                <TableRow>
                  <TableHead className="font-semibold text-xs h-10 pl-6">Vendor</TableHead>
                  <TableHead className="font-semibold text-xs h-10">Item & Qty</TableHead>
                  <TableHead className="font-semibold text-xs h-10">Status Logistik</TableHead>
                  <TableHead className="text-right pr-6 h-10"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { vendor: "Catering Sehat Bantul", item: "Daging Ayam Fillet", qty: "200kg", status: "PENDING", time: "2 jam lalu" },
                  { vendor: "Dapur Ibu Budi", item: "Beras Premium", qty: "500kg", status: "SHIPPED", time: "5 jam lalu" },
                  { vendor: "Mitra SPPG Sleman", item: "Sayur Sop Mix", qty: "150kg", status: "ARRIVED", time: "1 hari lalu" },
                  { vendor: "Dapur Rakyat Nusantara", item: "Telur Ayam Ras", qty: "50 tray", status: "PENDING", time: "3 jam lalu" },
                ].map((po, i) => (
                  <TableRow key={i} className="group hover:bg-slate-50/80">
                    <TableCell className="pl-6 py-4">
                      <p className="font-bold text-slate-900 text-sm">{po.vendor}</p>
                      <p className="text-[10px] text-slate-500 font-medium mt-0.5">{po.time}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-xs font-semibold text-slate-700">{po.item}</p>
                      <p className="font-bold text-indigo-600 text-xs mt-0.5">{po.qty}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={cn(
                        "border-none text-[10px] uppercase font-bold",
                        po.status === 'PENDING' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 
                        po.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : 
                        'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      )}>
                        {po.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <Button size="sm" className={cn(
                        "rounded-lg h-8 text-[10px] font-bold px-4",
                        po.status === 'PENDING' ? "bg-slate-900 hover:bg-slate-800 text-white" : "bg-slate-100 text-slate-400 hover:bg-slate-200 hover:text-slate-600"
                      )}>
                        {po.status === 'PENDING' ? 'Proses PO' : 'Lihat Detail'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Logistic Performance */}
        <div className="space-y-6">
          <Card className="border-slate-200/60 shadow-sm rounded-xl overflow-hidden relative bg-gradient-to-br from-slate-900 to-slate-800 text-white">
            <div className="absolute top-0 right-0 p-6 opacity-10 pointer-events-none">
              <Truck className="size-24" />
            </div>
            <CardHeader className="p-6 pb-4">
              <CardTitle className="text-base font-bold flex items-center gap-2 uppercase tracking-tight">
                Fulfillment Rate
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0 space-y-6 relative z-10">
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-bold text-indigo-200">
                  <span>Kecepatan Kirim</span>
                  <span>98%</span>
                </div>
                <Progress value={98} className="h-1.5 bg-white/20" />
              </div>
              <div className="space-y-2.5">
                <div className="flex justify-between text-xs font-bold text-emerald-200">
                  <span>Kualitas Bahan</span>
                  <span>100%</span>
                </div>
                <Progress value={100} className="h-1.5 bg-white/20" />
              </div>
              
              <div className="mt-8 p-4 bg-white/10 rounded-xl border border-white/10 backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer">
                <div className="flex items-start gap-3">
                  <MessageSquare className="size-4 text-indigo-300 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-white">Pesan Masuk</p>
                    <p className="text-[10px] text-slate-300 mt-1 leading-relaxed">Ada 3 pesan belum dibaca dari Vendor terkait spesifikasi produk dan negosiasi harga.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
