"use client"

import * as React from "react"
import Link from "next/link"
import { 
  ShieldCheck, 
  Mail, 
  IdCard, 
  Eye, 
  EyeOff, 
  ArrowRight,
  Shield,
  Lock,
  Globe
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = React.useState(false)

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col items-center py-12 px-6">
      {/* Top Header */}
      <div className="text-center space-y-4 mb-10">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="size-6" />
          </div>
          <span className="font-bold text-2xl text-foreground">VendorTrack</span>
        </div>
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Buat Akun VendorTrack</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Bergabung dengan ekosistem pengawasan Makan Bergizi Gratis (MBG)
          </p>
        </div>
      </div>

      {/* Registration Card */}
      <Card className="w-full max-w-[600px] shadow-xl border-border bg-card">
        <CardContent className="p-10 space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Field 1: Nama */}
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-700 font-semibold">Nama Lengkap / Nama Usaha</Label>
              <Input 
                id="name" 
                placeholder="Cth: Budi Santoso atau Catering Berkah" 
                className="h-11 border-slate-200 bg-slate-50/30 focus-visible:bg-white transition-all rounded-full px-5"
              />
            </div>

            {/* Field 2: Email */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-700 font-semibold">Email Aktif</Label>
              <div className="relative">
                <Input 
                  id="email" 
                  type="email"
                  placeholder="nama@email.com" 
                  className="h-11 border-slate-200 bg-slate-50/30 focus-visible:bg-white transition-all rounded-full pl-12"
                />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              </div>
            </div>

            {/* Field 3 & 4: Peran & NIK/NIB */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="role" className="text-slate-700 font-semibold">Peran Pengguna</Label>
                <Select>
                  <SelectTrigger id="role" className="rounded-full">
                    <SelectValue placeholder="Pilih Peran" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vendor">Vendor Katering</SelectItem>
                    <SelectItem value="school">Pihak Sekolah</SelectItem>
                    <SelectItem value="parent">Wali Murid</SelectItem>
                    <SelectItem value="inspector">Inspektur</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="identity" className="text-slate-700 font-semibold">NIK / NIB</Label>
                <div className="relative">
                  <Input 
                    id="identity" 
                    placeholder="Masukkan 16 digit angka" 
                    className="h-11 border-slate-200 bg-slate-50/30 focus-visible:bg-white transition-all rounded-full pl-12"
                  />
                  <IdCard className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
                </div>
              </div>
            </div>

            {/* Field 5: Password */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-700 font-semibold">Kata Sandi</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  type={showPassword ? "text" : "password"} 
                  placeholder="••••••••" 
                  className="h-11 border-slate-200 bg-slate-50/30 focus-visible:bg-white transition-all rounded-full pl-5 pr-12"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              <p className="text-[11px] text-slate-400 font-medium pl-1">
                Minimal 8 karakter, mengandung huruf dan angka.
              </p>
            </div>
          </div>

          <Button className="w-full h-12 font-bold text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all rounded-full gap-2 mt-4">
            Daftar Sekarang
            <ArrowRight className="size-4" />
          </Button>

          <div className="text-center pt-2">
            <p className="text-sm text-slate-500 font-medium">
              Sudah memiliki akun?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline">
                Masuk di sini
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Trust Badges & Footer */}
      <div className="mt-12 w-full max-w-[600px] space-y-8">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            <Shield className="size-4 text-emerald-500 fill-emerald-50" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Terintegrasi Sistem BGN</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-full border border-slate-100 shadow-sm">
            <Lock className="size-4 text-indigo-500 fill-indigo-50" />
            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-tight">Enkripsi Data End-to-End</span>
          </div>
        </div>

        <div className="space-y-4 text-center">
          <p className="text-xs text-slate-400 font-medium">
            © 2026 <span className="text-slate-500 font-bold">VendorTrack</span> - Badan Gizi Nasional. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center justify-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            <Link href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
            <span className="text-slate-200">•</span>
            <Link href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link>
          </div>
        </div>
      </div>
    </div>
  )
}
