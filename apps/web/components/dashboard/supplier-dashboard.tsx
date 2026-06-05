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
  Plus,
  ArrowRight,
  Star,
  FileText,
  Boxes,
  ArrowUpRight,
  Activity,
  Database
} from "lucide-react"
import Link from "next/link"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@workspace/ui/components/table"
import { Progress } from "@workspace/ui/components/progress"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

export function SupplierDashboard() {
  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto min-h-screen">
      
      {/* 1. Deep Orange Hero Banner (Vendor Style) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-900 via-orange-800 to-slate-900 shadow-sm border border-orange-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Store className="size-40 -rotate-12" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-orange-500/20 text-orange-100 border border-orange-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-orange-400 animate-pulse mr-2 inline-block" /> Seller Center Pro
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Dashboard Pemasok BGN</h1>
            <p className="text-orange-100/80 text-sm max-w-xl leading-relaxed">
              Pusat kendali bisnis grosir Anda. Pantau pipeline pesanan, atur harga wholesale, dan optimalkan logistik ke Dapur Vendor.
            </p>
          </div>
          
          <div className="flex bg-black/20 backdrop-blur-md rounded-xl border border-white/10 p-3 gap-4 shrink-0">
            <div>
              <p className="text-[9px] font-bold text-orange-200 uppercase tracking-widest">Aset Gudang</p>
              <p className="text-white font-bold flex items-center mt-1 text-sm">
                184.2 Ton Tersedia
              </p>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex items-center">
              <Link href="/portal/supplier/inventory">
                <Button variant="outline" className="h-8 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:text-white rounded-lg text-xs font-bold px-4 transition-colors">
                  <Database className="size-3.5 mr-2 text-orange-200" />
                  Buka Gudang
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* B2B Order Pipeline (Compact Funnel) */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Pipeline Pesanan</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Nego Harga", value: 12, icon: MessageSquare, color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-100" },
            { label: "PO Masuk", value: 45, icon: FileText, color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-100" },
            { label: "Pengiriman", value: 28, icon: Truck, color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-100" },
            { label: "Selesai", value: 104, icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-100" },
          ].map((stage, i) => (
            <Card key={i} className={cn("bg-white border border-slate-200 rounded-2xl relative overflow-hidden group hover:-translate-y-0.5 transition-transform cursor-pointer", stage.border)}>
              <CardContent className="p-4 md:p-5 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tighter">{stage.value}</h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">{stage.label}</p>
                </div>
                <div className={cn("size-10 rounded-xl flex items-center justify-center shrink-0", stage.bg, stage.color)}>
                  <stage.icon className="size-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Primary KPI Metrics (Bento Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Omset Grosir</p>
              <div className="size-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100">
                <TrendingUp className="size-4" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">Rp 428<span className="text-base text-slate-400 font-bold ml-1">Juta</span></h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-emerald-50 text-emerald-700 border-none font-bold text-[9px] px-2 py-0.5">+18.5%</Badge>
                <span className="text-[10px] font-semibold text-slate-400">Bulan Ini</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden group">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Perputaran Stok</p>
              <div className="size-8 bg-slate-50 rounded-lg flex items-center justify-center text-slate-500 border border-slate-100">
                <Boxes className="size-4" />
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter">18.5 <span className="text-base text-slate-400 font-bold ml-1">Ton</span></h3>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-orange-50 text-orange-700 border-none font-bold text-[9px] px-2 py-0.5">12 Restock</Badge>
                <span className="text-[10px] font-semibold text-slate-400">Terjadwal</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-900 to-slate-800 border-none rounded-2xl overflow-hidden relative group text-white">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Star className="size-16" />
          </div>
          <CardContent className="p-6 relative z-10">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest">Rating B2B</p>
              <div className="size-8 bg-orange-500 rounded-lg flex items-center justify-center text-white shadow-inner">
                <CheckCircle2 className="size-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-1">
                <h3 className="text-3xl font-black tracking-tighter">4.9</h3>
                <span className="text-sm font-bold text-slate-400">/ 5.0</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge className="bg-white/10 text-white border-none font-bold text-[9px] px-2 py-0.5">Top Supplier</Badge>
                <span className="text-[10px] font-semibold text-slate-400">Dari 120 PO</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Bulk Orders List (Compact) */}
        <Card className="xl:col-span-2 bg-white border border-slate-200 rounded-2xl flex flex-col overflow-hidden">
          <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-6 flex flex-row justify-between items-center">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 tracking-tight">Purchase Order Aktif</CardTitle>
              <CardDescription className="text-[11px] font-semibold text-slate-500 mt-1">Daftar pesanan grosir berjalan.</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="text-[10px] font-bold text-slate-600 border-slate-200 hover:bg-slate-50 rounded-lg gap-1.5 h-8">
              Semua PO <ArrowRight className="size-3" />
            </Button>
          </CardHeader>
          <div className="flex-1 overflow-x-auto">
            <Table>
              <TableHeader className="bg-white border-b border-slate-100">
                <TableRow className="border-none hover:bg-transparent">
                  <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 pl-6 h-10">Data Vendor</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 h-10">Pesanan</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 h-10">Status</TableHead>
                  <TableHead className="font-bold text-[9px] uppercase tracking-widest text-slate-400 text-right pr-6 h-10">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  { id: "PO-9921", vendor: "Catering Sehat", item: "Ayam Fillet (200kg)", price: "Rp 8.000.000", status: "PENDING", time: "2 jam lalu", urgent: true },
                  { id: "PO-9920", vendor: "Dapur Ibu Budi", item: "Beras (500kg)", price: "Rp 6.500.000", status: "SHIPPED", time: "5 jam lalu" },
                  { id: "PO-9918", vendor: "Mitra SPPG Sleman", item: "Sayur Mix (150kg)", price: "Rp 1.500.000", status: "ARRIVED", time: "1 hari lalu" },
                ].map((po, i) => (
                  <TableRow key={i} className="hover:bg-slate-50/50 transition-colors border-b border-slate-100 last:border-0 cursor-pointer">
                    <TableCell className="pl-6 py-4">
                      <p className="font-bold text-slate-900 text-xs">{po.vendor}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-mono text-[9px] text-slate-500 font-bold">{po.id}</span>
                        <span className="text-[9px] text-slate-400 font-semibold">{po.time}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <p className="text-xs font-bold text-slate-900">{po.item}</p>
                      <p className="text-[10px] font-bold text-slate-500 mt-0.5">{po.price}</p>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge className={cn(
                        "border-none text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 shadow-sm rounded",
                        po.status === 'PENDING' ? 'bg-orange-100 text-orange-700' : 
                        po.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : 
                        'bg-emerald-100 text-emerald-700'
                      )}>
                        {po.status}
                      </Badge>
                      {po.urgent && (
                         <div className="mt-1 text-[8px] font-bold text-red-500 uppercase tracking-widest animate-pulse flex items-center gap-1">
                           <Activity className="size-2.5" /> SLA Kritis
                         </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right pr-6 py-4">
                      <Button size="sm" className={cn(
                        "rounded-lg h-8 text-[10px] font-bold px-3 shadow-sm transition-colors",
                        po.status === 'PENDING' ? "bg-slate-900 hover:bg-slate-800 text-white" : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                      )}>
                        {po.status === 'PENDING' ? 'Terima PO' : 'Lacak'}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Action Panel (Compact Bento) */}
        <div className="space-y-4">
          <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden cursor-pointer hover:bg-slate-50 transition-colors">
            <CardContent className="p-5 flex items-start gap-4">
              <div className="size-10 bg-orange-50 border border-orange-100 rounded-xl flex items-center justify-center text-orange-600 shrink-0 shadow-inner">
                <MessageSquare className="size-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">Nego Harga Masuk</h3>
                <p className="text-[11px] text-slate-500 font-medium leading-relaxed">Ada <strong className="text-orange-600 font-bold">3 pesan baru</strong> menunggu balasan penawaran grosir.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900 border-none rounded-2xl overflow-hidden relative">
            <div className="absolute -right-2 -bottom-2 opacity-10">
              <Truck className="size-24" />
            </div>
            <CardHeader className="p-5 pb-3">
              <CardTitle className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                Logistik Terjadwal
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-4 relative z-10">
              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold text-white">
                  <span>SLA Pemenuhan</span>
                  <span className="text-orange-400">98%</span>
                </div>
                <Progress value={98} className="h-1.5 bg-slate-800 border border-slate-700 [&>div]:bg-orange-500" />
              </div>
              
              <div className="mt-4 p-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                <div>
                  <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Kirim Besok</p>
                  <p className="text-sm font-bold text-white mt-0.5">8 Armada</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 rounded-lg border-slate-700 bg-slate-800 text-white hover:bg-slate-700 text-[10px] font-bold px-3">
                  Atur
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  )
}
