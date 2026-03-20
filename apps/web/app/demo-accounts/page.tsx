"use client"

import * as React from "react"
import Link from "next/link"
import {
  ShieldCheck,
  Copy,
  Check,
  ArrowLeft,
  Users,
  Store,
  Truck,
  Building2,
  Stethoscope,
  UserCheck,
  Globe,
  Sparkles,
  LogIn
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { cn } from "@workspace/ui/lib/utils"

interface DemoAccount {
  email: string
  password: string
  name: string
  role: string
  roleLabel: string
  description: string
  icon: React.ReactNode
  colorClass: string
  badgeClass: string
}

const demoAccounts: DemoAccount[] = [
  {
    email: "admin@bgn.go.id",
    password: "Admin123!",
    name: "Administrator BGN Pusat",
    role: "admin_bgn",
    roleLabel: "Admin BGN",
    description: "Akses penuh ke semua fitur: RBAC, laporan, audit, peta distribusi, dan manajemen vendor.",
    icon: <ShieldCheck className="size-5" />,
    colorClass: "bg-violet-500",
    badgeClass: "bg-violet-100 text-violet-700 border-violet-200",
  },
  {
    email: "vendor@sppg.go.id",
    password: "Vendor123!",
    name: "Mitra SPPG Jakarta",
    role: "vendor",
    roleLabel: "Vendor",
    description: "Akses ke jadwal, menu, kalkulasi bahan, marketplace, live checkpoint, dan laporan dana.",
    icon: <Store className="size-5" />,
    colorClass: "bg-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    email: "vendor2@sppg.go.id",
    password: "Vendor123!",
    name: "Mitra SPPG Bandung",
    role: "vendor",
    roleLabel: "Vendor",
    description: "Akun vendor kedua untuk simulasi multi-SPPG dari kota berbeda.",
    icon: <Store className="size-5" />,
    colorClass: "bg-emerald-500",
    badgeClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  {
    email: "supplier@bgn.go.id",
    password: "Supplier123!",
    name: "PT Tani Makmur Sejahtera",
    role: "supplier",
    roleLabel: "Supplier",
    description: "Akses ke etalase toko, manajemen produk, dan chat negosiasi dengan Vendor.",
    icon: <Truck className="size-5" />,
    colorClass: "bg-amber-500",
    badgeClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
]

function AccountCard({ account }: { account: DemoAccount }) {
  const { toast } = useToast()
  const [copiedField, setCopiedField] = React.useState<"email" | "password" | null>(null)

  const copyToClipboard = async (text: string, field: "email" | "password") => {
    await navigator.clipboard.writeText(text)
    setCopiedField(field)
    toast({
      title: "Disalin!",
      description: `${field === "email" ? "Email" : "Password"} berhasil disalin ke clipboard.`,
    })
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <Card className="group border-border bg-card hover:shadow-lg transition-all duration-300 rounded-2xl overflow-hidden flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn("size-10 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md", account.colorClass)}>
              {account.icon}
            </div>
            <div>
              <CardTitle className="text-sm font-bold text-slate-900 leading-tight">{account.name}</CardTitle>
              <Badge variant="outline" className={cn("text-[9px] font-black uppercase tracking-wider mt-1 border", account.badgeClass)}>
                {account.roleLabel}
              </Badge>
            </div>
          </div>
        </div>
        <CardDescription className="text-xs font-medium text-slate-500 leading-relaxed mt-2">
          {account.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0 space-y-2 mt-auto">
        {/* Email Row */}
        <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Email</p>
            <p className="text-xs font-bold text-slate-800 truncate">{account.email}</p>
          </div>
          <button
            onClick={() => copyToClipboard(account.email, "email")}
            className="size-7 shrink-0 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-700"
            title="Salin email"
          >
            {copiedField === "email" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          </button>
        </div>

        {/* Password Row */}
        <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
          <div className="flex-1 min-w-0">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Password</p>
            <p className="text-xs font-bold text-slate-800 font-mono">{account.password}</p>
          </div>
          <button
            onClick={() => copyToClipboard(account.password, "password")}
            className="size-7 shrink-0 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors text-slate-400 hover:text-slate-700"
            title="Salin password"
          >
            {copiedField === "password" ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
          </button>
        </div>

        <Link href={`/login`} className="block pt-1">
          <Button
            size="sm"
            variant="outline"
            className="w-full rounded-xl text-xs font-bold h-9 gap-2 border-slate-200 hover:bg-primary hover:text-white hover:border-primary transition-all"
          >
            <LogIn className="size-3.5" />
            Gunakan Akun Ini
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export default function DemoAccountsPage() {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Navbar */}
      <nav className="w-full border-b border-border bg-background px-6 h-16 flex items-center justify-between">
        <Link href="/login" className="flex items-center gap-2">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="size-5" />
          </div>
          <span className="font-bold text-xl text-foreground">Nutrio</span>
        </Link>
        <Link href="/login">
          <Button variant="outline" size="sm" className="gap-2 h-9 border-border">
            <ArrowLeft className="size-4" />
            Kembali ke Login
          </Button>
        </Link>
      </nav>

      {/* Main */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-12 space-y-10">
        {/* Header */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-xs font-black uppercase tracking-widest border border-primary/20">
            <Sparkles className="size-3.5" />
            Demo Environment
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Akun Demo Tersedia</h1>
          <p className="text-slate-500 font-medium leading-relaxed">
            Gunakan salah satu akun di bawah ini untuk menjelajahi fitur platform Nutrio sesuai peran masing-masing. 
            Klik ikon <Copy className="size-3.5 inline-block text-slate-600" /> untuk menyalin kredensial.
          </p>
        </div>

        {/* Warning Banner */}
        <div className="flex items-start gap-4 p-5 bg-amber-50 border border-amber-100 rounded-2xl max-w-2xl mx-auto w-full">
          <Globe className="size-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-amber-800">Lingkungan Demo — Data Tidak Nyata</p>
            <p className="text-xs text-amber-700 font-medium leading-relaxed mt-1">
              Semua data di platform ini adalah data simulasi untuk keperluan demonstrasi hackathon. 
            </p>
          </div>
        </div>

        {/* Account Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {demoAccounts.map((account) => (
            <AccountCard key={account.email} account={account} />
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-400 font-medium pb-6">
          Semua akun di atas sudah terdaftar untuk melakukan demo.
        </p>
      </main>
    </div>
  )
}
