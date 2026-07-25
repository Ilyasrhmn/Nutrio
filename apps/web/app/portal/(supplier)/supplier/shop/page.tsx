"use client"

import * as React from "react"
import {
  Building,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
  Save,
  Star,
  Eye,
  Store,
  Info,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Textarea } from "@workspace/ui/components/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { useToast } from "@workspace/ui/hooks/use-toast"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { api } from "@/lib/api-client"
import { toQueryError } from "@/lib/services/error-handler"

interface SupplierProfile {
  id: string;
  businessName: string;
  ownerName: string;
  phone: string;
  email: string;
  description: string;
  addressStreet: string | null;
  addressCity: string | null;
  addressProvince: string | null;
  status: string;
  hasHalalCert: boolean;
  hasBpomCert: boolean;
  productCount: number;
}

export default function SupplierShopPage() {
  const { toast } = useToast()
  const [profile, setProfile] = React.useState<SupplierProfile | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)
  const [saving, setSaving] = React.useState(false)

  const [phone, setPhone] = React.useState("")
  const [email, setEmail] = React.useState("")
  const [description, setDescription] = React.useState("")

  const load = React.useCallback(async () => {
    try {
      setLoading(true)
      setLoadError(null)
      const data = await api.get<SupplierProfile>('/suppliers/me/profile')
      setProfile(data)
      setPhone(data.phone ?? "")
      setEmail(data.email ?? "")
      setDescription(data.description ?? "")
    } catch (error) {
      setLoadError(toQueryError(error))
    } finally {
      setLoading(false)
    }
  }, [])

  React.useEffect(() => {
    load()
  }, [load])

  async function handleSave() {
    setSaving(true)
    try {
      await api.patch('/suppliers/me/profile', { phone, email, description })
      toast({
        title: "Profil Diperbarui",
        description: "Kontak dan deskripsi toko Anda berhasil disimpan.",
      })
      await load()
    } catch (error) {
      const { errorMessage } = toQueryError(error)
      toast({ title: "Gagal menyimpan profil", description: errorMessage, variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto min-h-screen">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-900 via-orange-800 to-slate-900 shadow-sm border border-orange-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Store className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />

        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-orange-500/20 text-orange-100 border border-orange-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-orange-400 animate-pulse mr-2 inline-block" /> Profil Toko
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Profil Bisnis B2B</h1>
            <p className="text-orange-100/80 text-sm max-w-xl leading-relaxed">
              Kelola kontak dan deskripsi bisnis yang dilihat Vendor BGN.
            </p>
          </div>

          <div className="shrink-0">
            <Button onClick={handleSave} disabled={saving || loading} className="rounded-xl h-10 px-6 font-bold gap-2 bg-white text-orange-900 hover:bg-orange-50 shadow-sm transition-colors border border-white">
              <Save className="size-4" /> {saving ? "Menyimpan..." : "Simpan"}
            </Button>
          </div>
        </div>
      </div>

      <QueryState
        status={loadError ? loadError.status : loading ? "loading" : !profile ? "empty" : "success"}
        errorMessage={loadError?.errorMessage}
        isNetworkError={loadError?.isNetworkError}
        onRetry={load}
        emptyTitle="Profil belum ditemukan"
        emptyMessage="Hubungi admin BGN untuk mendaftarkan profil supplier Anda."
      >
        {profile && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            <div className="xl:col-span-7 space-y-6">
              <Card className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-inner">
                      <Building className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold tracking-tight text-slate-900">Identitas Perusahaan</CardTitle>
                      <CardDescription className="text-[11px] font-semibold text-slate-500 mt-0.5">
                        Terdaftar di sistem BGN, tidak dapat diubah dari sini.
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Nama Perusahaan</label>
                    <div className="h-10 rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 px-3 flex items-center">
                      {profile.businessName}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Deskripsi</label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      className="min-h-[100px] rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-0 focus:border-slate-400 p-3 leading-relaxed resize-none transition-colors"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white border-none shadow-sm ring-1 ring-slate-200/60 rounded-2xl overflow-hidden">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-5">
                  <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100 shadow-inner">
                      <Phone className="size-4" />
                    </div>
                    <div>
                      <CardTitle className="text-sm font-bold tracking-tight text-slate-900">Kontak</CardTitle>
                      <CardDescription className="text-[11px] font-semibold text-slate-500 mt-0.5">Ditampilkan ke Vendor yang tertarik.</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-5 space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">No. Telepon / WhatsApp</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                        <Input
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="pl-9 h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-0 focus:border-slate-400 transition-colors"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Email Bisnis</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-slate-400" />
                        <Input
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="pl-9 h-10 rounded-lg border-slate-200 bg-slate-50 text-sm font-semibold text-slate-900 focus:bg-white focus:ring-0 focus:border-slate-400 transition-colors"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Alamat</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 size-3.5 text-slate-400" />
                      <div className="pl-9 min-h-[60px] rounded-lg border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 p-3">
                        {[profile.addressStreet, profile.addressCity, profile.addressProvince].filter(Boolean).join(', ') || 'Belum diisi'}
                      </div>
                    </div>
                  </div>

                  <Alert className="bg-blue-50 border-blue-100/50 rounded-xl">
                    <Info className="size-3.5 text-blue-500" />
                    <AlertDescription className="text-blue-700 text-[11px] font-medium">
                      Perubahan nama, alamat, dan logo perusahaan hanya dapat dilakukan melalui verifikasi admin BGN.
                    </AlertDescription>
                  </Alert>
                </CardContent>
              </Card>
            </div>

            <div className="xl:col-span-5 sticky top-24 pt-1">
              <div className="mb-3 flex items-center gap-2 px-1">
                <Eye className="size-4 text-slate-400" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Preview (Vendor App)</h3>
              </div>

              <div className="border-[6px] border-slate-800 rounded-[2.5rem] overflow-hidden bg-white relative aspect-[9/18] max-h-[700px] mx-auto w-full max-w-[340px]">
                <div className="absolute top-0 inset-x-0 h-5 bg-slate-800 rounded-b-2xl w-32 mx-auto z-50 flex items-center justify-center">
                  <div className="h-1 w-8 rounded-full bg-slate-700" />
                </div>

                <div className="h-full w-full overflow-y-auto hide-scrollbar bg-slate-50 relative pb-8">
                  <div className="h-32 bg-slate-800 relative">
                    <Badge className="absolute top-6 right-3 bg-black/50 backdrop-blur text-white border-none font-bold text-[8px] uppercase tracking-widest flex items-center gap-1 px-2">
                      <ShieldCheck className="size-2.5 text-emerald-400" /> {profile.status === 'verified' ? 'Verified' : profile.status}
                    </Badge>
                  </div>

                  <div className="px-3 -mt-8 relative z-10">
                    <Card className="bg-white border border-slate-200 rounded-xl overflow-hidden p-3">
                      <div className="flex gap-3 items-start">
                        <div className="size-12 rounded-lg bg-slate-50 border border-slate-100 shrink-0 flex items-center justify-center text-sm font-bold text-slate-400">
                          {profile.businessName.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="space-y-0.5">
                          <h2 className="text-sm font-bold text-slate-900 leading-tight">{profile.businessName}</h2>
                          <p className="text-[9px] text-slate-500 font-semibold line-clamp-1">{profile.ownerName}</p>
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-50 flex items-center justify-between">
                        <div className="flex flex-col items-center">
                          <p className="text-xs font-bold text-slate-900">{profile.productCount}</p>
                          <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Produk</p>
                        </div>
                      </div>
                    </Card>
                  </div>

                  <div className="p-3 space-y-3">
                    <div className="space-y-1.5">
                      <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 px-1">Tentang Kami</h3>
                      <p className="text-[10px] text-slate-600 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                        {description || 'Deskripsi belum diisi.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-24 h-1 bg-slate-800/20 rounded-full z-50" />
              </div>
            </div>
          </div>
        )}
      </QueryState>
    </div>
  )
}
