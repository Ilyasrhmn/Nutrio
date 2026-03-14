"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  HelpCircle, 
  BookOpen, 
  Lock,
  Globe,
  Loader2
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { Checkbox } from "@workspace/ui/components/checkbox"
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent, 
  CardFooter 
} from "@workspace/ui/components/card"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { api, TokenStorage, ApiException } from "@/lib/api-client"

const loginSchema = z.object({
  email: z.string().email("Email tidak valid"),
  password: z.string().min(8, "Kata sandi minimal 8 karakter"),
  rememberMe: z.boolean().optional(),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const [showPassword, setShowPassword] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  })

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true)
    try {
      const response = await api.post("/auth/login", {
        email: data.email,
        password: data.password,
      })

      TokenStorage.setTokens(response.accessToken, response.refreshToken)
      
      toast({
        title: "Login Berhasil",
        description: `Selamat datang kembali, ${response.user.fullName}!`,
      })

      router.push("/portal")
    } catch (error) {
      const message = error instanceof ApiException ? error.message : "Terjadi kesalahan saat login"
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {/* Top Navbar */}
      <nav className="w-full border-b border-border bg-background px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
            <ShieldCheck className="size-5" />
          </div>
          <span className="font-bold text-xl text-foreground">VendorTrack</span>
        </div>
        
        <div className="flex items-center gap-6">
          <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors flex items-center gap-1.5">
            <BookOpen className="size-4" />
            Panduan Pengguna
          </Link>
          <Button variant="outline" size="sm" className="gap-2 h-9 border-border bg-background hover:bg-slate-50 text-slate-600">
            <HelpCircle className="size-4" />
            Bantuan Teknis
          </Button>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-[450px] shadow-xl border-border bg-card overflow-hidden">
          <CardHeader className="space-y-4 pt-10 text-center">
            <div className="mx-auto size-16 bg-primary/10 rounded-full flex items-center justify-center text-primary border-4 border-primary/5">
              <Lock className="size-8" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl font-bold tracking-tight text-foreground">Masuk ke VendorTrack</CardTitle>
              <CardDescription className="text-slate-500 font-medium">
                Portal Pengawasan Makan Bergizi Gratis (MBG)
              </CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 px-10 pb-10">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-700 font-semibold">Email atau NIK</Label>
                  <Input 
                    id="email" 
                    placeholder="Masukkan email atau NIK terdaftar" 
                    className="h-11 border-slate-200 bg-slate-50/30 focus-visible:bg-white transition-all"
                    disabled={isLoading}
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-xs font-medium text-destructive mt-1">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-slate-700 font-semibold">Kata Sandi</Label>
                    <Link href="#" className="text-xs font-bold text-primary hover:underline">Lupa sandi?</Link>
                  </div>
                  <div className="relative">
                    <Input 
                      id="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="••••••••" 
                      className="h-11 border-slate-200 bg-slate-50/30 pr-10 focus-visible:bg-white transition-all"
                      disabled={isLoading}
                      {...form.register("password")}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                  {form.formState.errors.password && (
                    <p className="text-xs font-medium text-destructive mt-1">
                      {form.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox 
                    id="remember" 
                    className="border-slate-300"
                    onCheckedChange={(checked) => form.setValue("rememberMe", checked as boolean)}
                  />
                  <Label htmlFor="remember" className="text-xs font-medium text-slate-500 cursor-pointer">
                    Ingat saya di perangkat ini
                  </Label>
                </div>
              </div>

              <Button 
                type="submit"
                className="w-full h-11 font-bold text-sm bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  "Masuk"
                )}
              </Button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-100" />
              </div>
              <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest text-slate-400">
                <span className="bg-card px-3">PILIHAN MASUK LAINNYA</span>
              </div>
            </div>

            <Button 
              variant="outline" 
              className="w-full h-11 border-slate-200 bg-background hover:bg-slate-50 text-slate-700 font-semibold gap-2"
              disabled={isLoading}
            >
              <ShieldCheck className="size-4 text-primary" />
              Masuk via SSO Pemerintah
            </Button>

            <div className="text-center pt-2">
              <p className="text-sm text-slate-500 font-medium">
                Belum terdaftar di sistem MBG?{" "}
                <Link href="/register" className="text-primary font-bold hover:underline">
                  Daftar sekarang
                </Link>
              </p>
            </div>
          </CardContent>
          
          <CardFooter className="bg-slate-50/80 border-t border-slate-100 p-6">
            <p className="text-[11px] leading-relaxed text-slate-500 text-center italic w-full">
              Sistem Resmi Pemerintah Republik Indonesia. Segala aktivitas di dalam sistem ini dicatat dan diawasi secara ketat.
            </p>
          </CardFooter>
        </Card>
      </main>

      {/* Page Footer */}
      <footer className="w-full py-10 px-6 space-y-4">
        <div className="flex items-center justify-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          <Link href="#" className="hover:text-primary transition-colors">Kebijakan Privasi</Link>
          <Link href="#" className="hover:text-primary transition-colors">Syarat & Ketentuan</Link>
          <Link href="#" className="hover:text-primary transition-colors flex items-center gap-1.5">
            <div className="size-1.5 bg-emerald-500 rounded-full animate-pulse" />
            Status Sistem
          </Link>
        </div>
        <div className="text-center space-y-2">
          <p className="text-xs text-slate-400 font-medium tracking-tight">
            © 2026 <span className="text-slate-500 font-bold">VendorTrack</span> - Badan Gizi Nasional. Hak Cipta Dilindungi.
          </p>
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-300 font-medium uppercase tracking-tighter">
            <Globe className="size-3" />
            NKRI - Keadilan Sosial Bagi Seluruh Rakyat Indonesia
          </div>
        </div>
      </footer>
    </div>
  )
}
