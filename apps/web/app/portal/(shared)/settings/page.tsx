"use client"

import * as React from "react"
import { 
  User,
  Bell,
  Key,
  Shield,
  Smartphone,
  Mail,
  Save,
  Copy,
  CheckCircle2,
  AlertTriangle,
  LogOut,
  RefreshCw,
  Camera,
  Settings
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = React.useState("profile");
  const [copied, setCopied] = React.useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText("mbg_live_938472938472938472938472");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto bg-background min-h-[calc(100vh-64px)]">
      
      {/* Simple Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border pb-6 mb-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Settings className="size-6 text-muted-foreground" /> Pengaturan Akun
          </h2>
          <p className="text-muted-foreground text-sm">
            Kelola informasi profil, preferensi notifikasi, dan kredensial API Anda.
          </p>
        </div>
        <Button className="bg-primary text-primary-foreground font-bold gap-2">
          <Save className="size-4" />
          Simpan Perubahan
        </Button>
      </div>

      {/* 2-Column Layout for Settings */}
      <div className="flex flex-col md:flex-row gap-8 lg:gap-12 items-start">
        
        {/* Left Sidebar Menu */}
        <div className="w-full md:w-64 shrink-0 flex flex-col gap-1 sticky top-24">
          <button 
            onClick={() => setActiveTab("profile")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left",
              activeTab === "profile" 
                ? "bg-primary/10 text-primary font-bold" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <User className="size-4 shrink-0" />
            Profil Pengguna
          </button>
          
          <button 
            onClick={() => setActiveTab("notifications")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left",
              activeTab === "notifications" 
                ? "bg-primary/10 text-primary font-bold" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Bell className="size-4 shrink-0" />
            Preferensi Notifikasi
          </button>
          
          <button 
            onClick={() => setActiveTab("api")}
            className={cn(
              "flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors text-left",
              activeTab === "api" 
                ? "bg-primary/10 text-primary font-bold" 
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}
          >
            <Key className="size-4 shrink-0" />
            Akses API & Webhook
          </button>
        </div>

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          
          {/* TAB: PROFIL */}
          {activeTab === "profile" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">Informasi Pribadi</h3>
                <p className="text-sm text-muted-foreground">Perbarui foto dan detail kontak administratif Anda.</p>
              </div>

              {/* Avatar Edit */}
              <div className="flex flex-col sm:flex-row items-center gap-6 p-6 border border-border rounded-xl bg-card shadow-sm">
                <Avatar className="size-20">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                    AD
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2 text-center sm:text-left flex-1">
                  <h3 className="text-base font-bold text-foreground">Administrator BGN Pusat</h3>
                  <p className="text-sm text-muted-foreground">admin_bgn@nutrio.go.id</p>
                  <div className="flex gap-3 justify-center sm:justify-start pt-2">
                    <Button variant="outline" size="sm" className="h-9 font-medium">Ubah Foto</Button>
                    <Button variant="ghost" size="sm" className="h-9 font-medium text-destructive hover:text-destructive hover:bg-destructive/10">Hapus Gambar</Button>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Nama Lengkap</label>
                  <Input defaultValue="Administrator BGN Pusat" className="bg-background h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">NIP / ID Pegawai</label>
                  <Input defaultValue="198203112009121002" className="bg-background h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Email Instansi</label>
                  <Input defaultValue="admin_bgn@nutrio.go.id" className="bg-background h-11" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-foreground">Nomor Telepon</label>
                  <Input defaultValue="+62 812 3456 7890" className="bg-background h-11" />
                </div>
              </div>

              <div className="pt-6 border-t border-border mt-8">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border border-destructive/20 bg-destructive/5 rounded-xl">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Shield className="size-4 text-destructive" /> Keamanan Akun
                    </h3>
                    <p className="text-sm text-muted-foreground">Ubah kata sandi atau aktifkan autentikasi dua faktor (2FA) untuk mengamankan akun.</p>
                  </div>
                  <Button variant="outline" className="w-full sm:w-auto h-10 border-destructive/30 text-destructive hover:bg-destructive/10">
                    Atur Keamanan
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* TAB: NOTIFIKASI */}
          {activeTab === "notifications" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">Preferensi Notifikasi</h3>
                <p className="text-sm text-muted-foreground">Pilih jenis pemberitahuan dan saluran notifikasi yang ingin Anda terima.</p>
              </div>

              <div className="border border-border rounded-xl divide-y divide-border bg-card shadow-sm">
                <div className="p-6 flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                      <AlertTriangle className="size-4 text-destructive" /> Peringatan Fraud (Kritis)
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Pemberitahuan instan saat sistem mendeteksi anomali gizi tingkat tinggi atau indikasi kecurangan vendor.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
                
                <div className="p-6 flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Smartphone className="size-4 text-blue-500" /> Push Notification Mobile
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Terima notifikasi langsung ke perangkat mobile melalui aplikasi resmi BGN untuk update mendesak.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input type="checkbox" defaultChecked className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>

                <div className="p-6 flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <h4 className="text-base font-bold text-foreground flex items-center gap-2">
                      <Mail className="size-4 text-muted-foreground" /> Rekap Laporan Harian (Email)
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">Kirim ringkasan eksekutif harian mengenai status penyerapan anggaran dan logistik setiap sore.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB: AKSES API */}
          {activeTab === "api" && (
            <div className="space-y-8 animate-in fade-in duration-300">
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-foreground">API & Webhooks</h3>
                <p className="text-sm text-muted-foreground">Kelola API Keys dan konfigurasi Webhook untuk integrasi dengan sistem kementerian/lembaga lain.</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 border border-border rounded-xl bg-card shadow-sm space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-foreground">Production API Key</h3>
                      <p className="text-sm text-muted-foreground">Kunci utama untuk akses endpoint <code className="bg-muted px-1.5 py-0.5 rounded">/api/v1</code>.</p>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-2.5 py-1 rounded text-[11px] font-bold uppercase tracking-wider w-fit">Active</span>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                      <Input 
                        readOnly 
                        value="mbg_live_938472938472938472938472" 
                        className="font-mono text-sm pr-12 bg-muted/50 h-11" 
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={copyApiKey}
                        className="absolute right-1 top-1/2 -translate-y-1/2 size-9 hover:bg-background"
                      >
                        {copied ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Copy className="size-4 text-muted-foreground" />}
                      </Button>
                    </div>
                    <Button variant="outline" className="w-full sm:w-auto gap-2 h-11 font-medium">
                      <RefreshCw className="size-4" /> Rotate Key
                    </Button>
                  </div>
                </div>

                <div className="p-8 border border-border border-dashed rounded-xl bg-muted/30 flex flex-col items-center justify-center text-center space-y-4">
                  <div className="size-14 bg-background rounded-full shadow-sm border border-border flex items-center justify-center">
                    <Key className="size-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-foreground">Belum ada Webhook Aktif</p>
                    <p className="text-sm text-muted-foreground max-w-sm mx-auto">Tambahkan Webhook untuk menerima event real-time seperti validasi pencairan dana otomatis.</p>
                  </div>
                  <Button variant="default" className="mt-2">
                    Buat Endpoint Webhook
                  </Button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}
