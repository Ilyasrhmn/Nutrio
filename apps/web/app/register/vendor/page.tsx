"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, ShieldCheck } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { api } from "../../../lib/api-client"

interface FormData {
  email: string
  password: string
  confirmPassword: string
  fullName: string
  businessName: string
  phone: string
}

const initialForm: FormData = {
  email: "",
  password: "",
  confirmPassword: "",
  fullName: "",
  businessName: "",
  phone: "",
}

function FormField({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  required,
}: {
  id: string
  label: string
  type?: string
  placeholder?: string
  value: string
  onChange: (v: string) => void
  required?: boolean
}) {
  return (
    <div className="space-y-2">
      <Label
        htmlFor={id}
        className="text-slate-700 font-bold text-[10px] uppercase tracking-wider pl-1"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </Label>
      <Input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-2xl h-12 border-slate-200 bg-slate-50/50 px-5 font-medium"
        required={required}
      />
    </div>
  )
}

function VendorRegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [formData, setFormData] = React.useState<FormData>(initialForm)
  const [isLoading, setIsLoading] = React.useState(false)
  const [validationError, setValidationError] = React.useState<string | null>(null)

  const eligibilityToken = searchParams?.get("from_eligibility") ?? null

  const setField = (field: keyof FormData) => (value: string) =>
    setFormData((prev) => ({ ...prev, [field]: value }))

  const validate = (): string | null => {
    if (!formData.email.trim()) return "Email wajib diisi."
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return "Format email tidak valid."
    if (!formData.password) return "Kata sandi wajib diisi."
    if (formData.password.length < 8) return "Kata sandi minimal 8 karakter."
    if (formData.password !== formData.confirmPassword) return "Konfirmasi kata sandi tidak cocok."
    if (!formData.fullName.trim()) return "Nama lengkap PIC wajib diisi."
    if (!formData.businessName.trim()) return "Nama usaha wajib diisi."
    if (!formData.phone.trim()) return "Nomor HP wajib diisi."
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) {
      setValidationError(err)
      return
    }
    setValidationError(null)
    setIsLoading(true)
    try {
      await api.post("/auth/register", {
        email: formData.email.trim(),
        password: formData.password,
        fullName: formData.fullName.trim(),
        role: "vendor",
        businessName: formData.businessName.trim(),
        phone: formData.phone.trim(),
        ...(eligibilityToken ? { eligibilityToken } : {}),
      })
      toast({
        title: "Pendaftaran Berhasil",
        description: "Akun Anda telah dibuat. Silakan masuk.",
      })
      router.push("/login?registered=true")
    } catch (error: any) {
      toast({
        title: "Pendaftaran Gagal",
        description: error?.message ?? "Terjadi kesalahan. Silakan coba lagi.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center py-10 px-4">
      {/* Header bar */}
      <div className="w-full max-w-md mb-4 flex items-center gap-2">
        <button
          onClick={() => router.push("/register")}
          className="p-2 rounded-xl hover:bg-slate-200 transition-colors text-slate-500"
          aria-label="Kembali"
        >
          <ArrowLeft className="size-5" />
        </button>
        <div className="flex items-center gap-2 ml-1">
          <div className="size-7 bg-primary rounded-lg flex items-center justify-center">
            <ShieldCheck className="size-4 text-primary-foreground" />
          </div>
          <span className="font-black text-foreground text-sm">Nutrio</span>
        </div>
      </div>

      <Card className="w-full max-w-md shadow-xl border-slate-200/60 rounded-3xl overflow-hidden">
        <CardContent className="pt-8 pb-8 px-8 space-y-6">
          {/* Title */}
          <div className="space-y-1">
            <h1 className="text-2xl font-black text-foreground leading-tight">
              Daftar sebagai Vendor
            </h1>
            <p className="text-sm text-slate-500 font-medium">
              Bergabung dengan ekosistem MBG dan mulai perjalanan Anda.
            </p>
          </div>

          {/* Eligibility token badge */}
          {eligibilityToken && (
            <Badge className="bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold px-4 py-2 rounded-xl text-xs w-full justify-start gap-2">
              <span>✅</span>
              <span>Cek kelayakan selesai — hasil akan terhubung ke akun Anda</span>
            </Badge>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <FormField
              id="email"
              label="Email"
              type="email"
              placeholder="admin@usaha.com"
              value={formData.email}
              onChange={setField("email")}
              required
            />
            <FormField
              id="password"
              label="Kata Sandi"
              type="password"
              placeholder="Min. 8 karakter"
              value={formData.password}
              onChange={setField("password")}
              required
            />
            <FormField
              id="confirmPassword"
              label="Konfirmasi Kata Sandi"
              type="password"
              placeholder="Ulangi kata sandi"
              value={formData.confirmPassword}
              onChange={setField("confirmPassword")}
              required
            />
            <FormField
              id="fullName"
              label="Nama Lengkap PIC"
              placeholder="Nama sesuai identitas"
              value={formData.fullName}
              onChange={setField("fullName")}
              required
            />
            <FormField
              id="businessName"
              label="Nama Usaha / Badan Usaha"
              placeholder="Cth: PT Catering Berkah"
              value={formData.businessName}
              onChange={setField("businessName")}
              required
            />
            <FormField
              id="phone"
              label="Nomor HP"
              type="tel"
              placeholder="0812..."
              value={formData.phone}
              onChange={setField("phone")}
              required
            />

            {/* Validation error */}
            {validationError && (
              <div className="rounded-2xl bg-red-50 border border-red-200 px-4 py-3">
                <p className="text-sm text-red-600 font-medium">{validationError}</p>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={isLoading}
              className={cn(
                "w-full h-14 rounded-2xl font-black text-base shadow-lg shadow-primary/20",
                "transition-all active:scale-95 disabled:opacity-50 mt-2"
              )}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="size-5 animate-spin" />
                  Mendaftar...
                </span>
              ) : (
                "Daftar sebagai Vendor"
              )}
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-slate-500 font-medium">
            Sudah punya akun?{" "}
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="text-primary font-bold hover:underline underline-offset-2"
            >
              Masuk
            </button>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function VendorRegisterPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="size-8 animate-spin text-muted-foreground" /></div>}>
      <VendorRegisterForm />
    </React.Suspense>
  )
}
