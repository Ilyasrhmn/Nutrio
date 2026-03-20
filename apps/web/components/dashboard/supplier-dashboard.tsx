"use client"

import React from "react"
import { 
  Store, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  MessageSquare, 
  ArrowUpRight, 
  Truck,
  CheckCircle2,
  Clock
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Progress } from "@workspace/ui/components/progress"

export function SupplierDashboard() {
  return (
    <div className="p-8 space-y-8 bg-slate-50/30 min-h-screen animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">KONTROL PENJUALAN</h1>
          <p className="text-slate-500 text-sm font-medium">Monitoring arus kas penjualan dan logistik bahan baku.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl font-bold border-slate-200">Kelola Produk</Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-100">
            Tambah Stok Bahan
          </Button>
        </div>
      </div>

      {/* Sales & Logistic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
          <div className="size-10 bg-emerald-50 flex items-center justify-center rounded-xl text-emerald-600">
            <TrendingUp className="size-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Penjualan (Bulan Ini)</p>
            <h3 className="text-2xl font-black text-slate-900">Rp 142.500.000</h3>
            <Badge variant="outline" className="text-[10px] font-bold border-emerald-100 text-emerald-600 bg-emerald-50 mt-2">+12% vs Jan</Badge>
          </div>
        </div>

        {[
          { label: "Pesanan Aktif (PO)", value: "24 PO", sub: "Menunggu Pengiriman", icon: ShoppingCart, color: "blue" },
          { label: "Produk Terlaris", value: "Daging Ayam", sub: "1.2 Ton terjual", icon: Package, color: "primary" },
          { label: "Rating Supplier", value: "4.9 / 5.0", sub: "Dari 120 Vendor", icon: CheckCircle2, color: "amber" },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-4">
            <div className={`size-10 bg-${stat.color}-50 flex items-center justify-center rounded-xl text-${stat.color}-600`}>
              <stat.icon className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
              <h3 className="text-2xl font-black text-slate-900">{stat.value}</h3>
              <p className="text-[10px] text-slate-400 italic mt-1">{stat.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Fulfillment */}
        <div className="lg:col-span-2 bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
            <h3 className="font-black text-slate-900 text-sm uppercase">Pesanan Baru dari Vendor</h3>
            <Button variant="ghost" size="sm" className="text-xs font-bold text-indigo-600">Lihat Semua PO</Button>
          </div>
          <Table>
            <TableHeader className="bg-slate-50/50">
              <TableRow>
                <TableHead className="text-[10px] font-black uppercase pl-6">Vendor</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Item & Qty</TableHead>
                <TableHead className="text-[10px] font-black uppercase">Status Logistik</TableHead>
                <TableHead className="text-[10px] font-black uppercase text-right pr-6">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[
                { vendor: "Catering Sehat", item: "Daging Ayam", qty: "200kg", status: "PENDING", time: "2 jam lalu" },
                { vendor: "Dapur Ibu", item: "Beras Premium", qty: "500kg", status: "SHIPPED", time: "5 jam lalu" },
                { vendor: "Mitra SPPG", item: "Sayur Sop", qty: "150kg", status: "ARRIVED", time: "1 hari lalu" },
              ].map((po, i) => (
                <TableRow key={i} className="group">
                  <TableCell className="pl-6 py-4">
                    <p className="font-bold text-slate-900 text-sm">{po.vendor}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">{po.time}</p>
                  </TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-slate-600">{po.item}</p>
                    <p className="font-black text-indigo-600 text-xs">{po.qty}</p>
                  </TableCell>
                  <TableCell>
                    <Badge className={po.status === 'PENDING' ? 'bg-amber-500' : po.status === 'SHIPPED' ? 'bg-blue-500' : 'bg-emerald-500'}>
                      {po.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <Button size="sm" className="bg-slate-900 text-white rounded-xl h-8 text-[10px] font-bold">Proses PO</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Logistic Performance */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-10">
              <Truck className="size-20" />
            </div>
            <h3 className="font-bold text-lg mb-6 flex items-center gap-2 uppercase tracking-tighter">
              Fulfillment Rate
            </h3>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-indigo-300">
                  <span>KECEPATAN KIRIM</span>
                  <span>98%</span>
                </div>
                <Progress value={98} className="h-1.5 bg-white/10" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-[10px] font-bold text-emerald-300">
                  <span>KUALITAS BAHAN</span>
                  <span>100%</span>
                </div>
                <Progress value={100} className="h-1.5 bg-white/10" />
              </div>
            </div>
            <div className="mt-8 p-4 bg-white/5 rounded-2xl border border-white/10">
              <div className="flex items-center gap-3">
                <MessageSquare className="size-4 text-indigo-400" />
                <p className="text-[11px] text-slate-300">Ada 3 pesan belum dibaca dari Vendor terkait spek produk.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
