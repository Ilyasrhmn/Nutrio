"use client"

import * as React from "react"
import {
  Search,
  Filter,
  Calendar,
  Layers,
  ShieldCheck,
  Lock,
} from "lucide-react"

import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"

export default function AuditPage() {
  return (
    <div className="min-h-screen bg-[#F4F7FA] px-4 sm:px-6 lg:px-12 py-8 space-y-8 max-w-[1400px] mx-auto animate-in fade-in duration-500">

      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-teal-900 via-teal-800 to-teal-950 shadow-2xl border border-teal-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <ShieldCheck className="size-48" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-amber-500/20 text-amber-100 border border-amber-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-amber-400 animate-pulse mr-2 inline-block" /> Belum Tersedia
            </Badge>
            <h1 className="text-3xl font-bold text-white tracking-tight">Arsip Validasi & Audit</h1>
            <p className="text-teal-100/80 text-sm max-w-xl leading-relaxed">
              Log audit lintas-vendor untuk seluruh checkpoint belum diekspos oleh backend. Halaman ini akan aktif setelah endpoint audit trail tersedia.
            </p>
          </div>

          <div className="bg-black/20 backdrop-blur-md rounded-2xl border border-white/10 p-4 w-full sm:w-auto flex items-center gap-4 shrink-0">
            <div className="size-10 bg-teal-500/20 rounded-xl flex items-center justify-center shrink-0">
              <Lock className="size-5 text-teal-300" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-teal-200 uppercase tracking-widest mb-0.5">Status</p>
              <p className="text-sm font-bold text-white">Menunggu Kontrak Backend</p>
            </div>
          </div>
        </div>
      </div>

      <Alert className="bg-amber-50 border-amber-200 rounded-2xl">
        <AlertDescription className="text-amber-800 text-sm font-semibold leading-relaxed">
          Belum ada endpoint audit-log lintas vendor di backend (yang ada hanya checkpoint harian milik vendor sendiri via <code className="bg-white px-1.5 py-0.5 rounded">GET /checkpoints/today</code>). Data di halaman ini sengaja dikosongkan agar tidak menampilkan angka rekaan.
        </AlertDescription>
      </Alert>

      {/* Disabled filter bar, kept for layout continuity */}
      <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/60 opacity-60 pointer-events-none">
        <CardContent className="p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400" />
            <Input disabled className="pl-12 h-12 bg-slate-50 border-slate-200 rounded-xl text-sm font-semibold" placeholder="Cari ID Audit, Nama Vendor, atau hasil AI..." />
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" disabled className="h-12 gap-2 font-bold text-xs rounded-xl px-5 flex-1 md:flex-none border-slate-200 text-slate-600">
              <Calendar className="size-4" />
              Semua Tanggal
            </Button>
            <Button variant="outline" disabled className="h-12 gap-2 font-bold text-xs rounded-xl px-5 flex-1 md:flex-none border-slate-200 text-slate-600">
              <Filter className="size-4" />
              Filter Status
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-white border-none shadow-sm rounded-2xl overflow-hidden ring-1 ring-slate-200/60">
        <CardHeader className="p-8 border-b border-slate-50 bg-slate-50/50">
          <div className="flex items-center justify-between">
            <div className="space-y-1.5">
              <CardTitle className="text-xl font-bold text-slate-900">Log Kepatuhan Digital</CardTitle>
              <CardDescription className="text-sm font-medium text-slate-500">
                Akan terisi otomatis setelah backend mengekspos audit trail lintas vendor.
              </CardDescription>
            </div>
            <div className="size-12 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center">
              <Layers className="size-6 text-slate-300" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-16 text-center text-sm text-slate-400">
          Belum ada data untuk ditampilkan.
        </CardContent>
      </Card>
    </div>
  )
}
