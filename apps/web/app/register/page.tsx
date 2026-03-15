"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  ShieldCheck, 
  ArrowRight,
  Shield,
  Lock,
  UserCircle2
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Label } from "@workspace/ui/components/label"
import { 
  Card, 
  CardContent, 
} from "@workspace/ui/components/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select"

const gatewaySchema = z.object({
  role: z.enum(["vendor", "supplier", "school", "parent"], {
    required_error: "Silakan pilih peran Anda",
  }),
})

type GatewayFormValues = z.infer<typeof gatewaySchema>

export default function RegisterGatewayPage() {
  const router = useRouter()

  const form = useForm<GatewayFormValues>({
    resolver: zodResolver(gatewaySchema),
  })

  async function onSubmit(data: GatewayFormValues) {
    if (data.role === "vendor") {
      router.push("/register/vendor")
    } else if (data.role === "supplier") {
      router.push("/register/supplier")
    } else {
      // Basic handling for other roles if they don't have dedicated sub-routes yet
      router.push("/login")
    }
  }

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
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Bergabung dengan VendorTrack</h1>
          <p className="text-slate-500 font-medium max-w-md mx-auto">
            Portal Pengawasan Makan Bergizi Gratis (MBG) Nasional
          </p>
        </div>
      </div>

      {/* Role Selection Card */}
      <Card className="w-full max-w-[500px] shadow-xl border-border bg-card">
        <CardContent className="p-10 space-y-8">
          <div className="space-y-6 text-center">
            <div className="mx-auto size-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
              <UserCircle2 className="size-10" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-900">Pilih Peran Pengguna</h3>
              <p className="text-sm text-slate-500">Kami akan menyesuaikan proses pendaftaran berdasarkan peran Anda di ekosistem MBG.</p>
            </div>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-3">
              <Label htmlFor="role" className="text-slate-700 font-bold text-xs uppercase tracking-wider pl-1">Peran Saya Sebagai</Label>
              <Controller
                control={form.control}
                name="role"
                render={({ field }) => (
                  <Select onValueChange={field.onChange} value={field.value}>
                    <SelectTrigger id="role" className="rounded-2xl h-14 border-slate-200 bg-slate-50/50 text-base">
                      <SelectValue placeholder="Pilih Peran Pendaftaran" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="vendor" className="py-3">Vendor Katering (SPPG)</SelectItem>
                      <SelectItem value="supplier" className="py-3">Supplier Bahan Baku</SelectItem>
                      <SelectItem value="school" className="py-3">Pihak Sekolah / Guru</SelectItem>
                      <SelectItem value="parent" className="py-3">Orang Tua / Wali Murid</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
              {form.formState.errors.role && (
                <p className="text-xs font-medium text-destructive mt-1 pl-1">
                  {form.formState.errors.role.message}
                </p>
              )}
            </div>

            <Button 
              type="submit"
              className="w-full h-14 font-black text-base bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all rounded-2xl gap-2 mt-4"
            >
              Lanjutkan Pendaftaran
              <ArrowRight className="size-5" />
            </Button>
          </form>

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
      <div className="mt-12 w-full max-w-[500px] space-y-8">
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
