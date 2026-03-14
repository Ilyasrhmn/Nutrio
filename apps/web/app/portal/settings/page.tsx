"use client"

import * as React from "react"
import { 
  User, 
  Shield, 
  Bell, 
  Key, 
  LogOut, 
  Smartphone, 
  MessageSquare, 
  Laptop, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search,
  Lock,
  ChevronRight,
  MoreVertical
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@workspace/ui/components/tabs"
import { cn } from "@workspace/ui/lib/utils"

export default function SettingsPage() {
  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Profil & Pengaturan</h2>
          <p className="text-muted-foreground text-sm font-medium">Kelola preferensi akun dan protokol keamanan sistem MBG.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-10 h-10 bg-card border-border rounded-lg" placeholder="Cari pengaturan..." />
          </div>
          <Button variant="outline" size="icon" className="rounded-full bg-card border-border relative">
            <Bell className="size-4 text-muted-foreground" />
            <span className="absolute top-2 right-2.5 size-2 bg-destructive rounded-full border-2 border-card"></span>
          </Button>
          <Button variant="outline" className="gap-2 h-10 border-border text-destructive hover:bg-destructive/5 font-bold px-4">
            <LogOut className="size-4" />
            Keluar
          </Button>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-background border-b border-border/50" />
          <div className="px-8 pb-8 flex flex-col md:flex-row md:items-end justify-between gap-6 -mt-10">
            <div className="flex flex-col md:flex-row md:items-end gap-6">
              <Avatar className="size-24 border-4 border-card shadow-xl ring-1 ring-border">
                <AvatarImage src="" />
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-black">BS</AvatarFallback>
              </Avatar>
              <div className="space-y-1 md:pb-2">
                <h3 className="text-2xl font-black text-foreground">Budi Santoso</h3>
                <div className="flex flex-wrap items-center gap-3">
                  <p className="text-sm font-bold text-muted-foreground">Auditor Utama - Satgas MBG</p>
                  <div className="size-1 rounded-full bg-slate-300" />
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest bg-muted px-2 py-0.5 rounded">NIP: 198802142010121001</p>
                </div>
                <div className="flex items-center gap-4 mt-2">
                   <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                     <Shield className="size-3 text-primary" />
                     Badan Gizi Nasional
                   </div>
                   <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
                     <Clock className="size-3" />
                     Login Terakhir: Hari ini, 08:00 WIB
                   </div>
                </div>
              </div>
            </div>
            <div className="md:pb-2 flex items-center gap-3">
              <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold px-3 py-1">Status Aktif</Badge>
              <Button size="icon" variant="ghost" className="rounded-full border border-border">
                <MoreVertical className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Tabs */}
      <Tabs defaultValue="keamanan" className="w-full">
        <TabsList>
          <TabsTrigger value="profil">Profil</TabsTrigger>
          <TabsTrigger value="keamanan">Keamanan</TabsTrigger>
          <TabsTrigger value="notifikasi">Notifikasi</TabsTrigger>
          <TabsTrigger value="akses-api">Akses API</TabsTrigger>
        </TabsList>

        <TabsContent value="keamanan" className="mt-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Security Settings */}
            <div className="lg:col-span-2 space-y-8">
              {/* 2FA Card */}
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Lock className="size-4 text-primary" />
                      <CardTitle className="text-lg font-bold">Autentikasi Dua Langkah (2FA)</CardTitle>
                    </div>
                    <CardDescription className="text-muted-foreground font-medium">Lindungi akun Anda dengan lapisan keamanan tambahan.</CardDescription>
                  </div>
                  <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 font-bold">AKTIF</Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    <div className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                          <Key className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Aplikasi Authenticator</p>
                          <p className="text-xs text-muted-foreground">Gunakan Google Authenticator atau Authy.</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-wider rounded-full px-4">Konfigurasi</Button>
                    </div>

                    <div className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                          <MessageSquare className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Verifikasi WhatsApp / SMS</p>
                          <p className="text-xs text-muted-foreground">Kode dikirimkan ke +62 812-****-4402</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-wider rounded-full px-4">Edit</Button>
                    </div>

                    <div className="p-6 flex items-center justify-between hover:bg-muted/5 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                          <Smartphone className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">Kunci Perangkat Keras</p>
                          <p className="text-xs text-muted-foreground">Gunakan kunci fisik Yubikey atau sejenisnya.</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="h-8 text-[11px] font-bold uppercase tracking-wider rounded-full px-4">Tambah</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Active Sessions Card */}
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
                  <CardTitle className="text-lg font-bold">Sesi Perangkat Aktif</CardTitle>
                  <Button variant="ghost" size="sm" className="text-destructive hover:bg-destructive/5 font-bold text-xs">Keluarkan Semua Perangkat</Button>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-border/50">
                    <div className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                          <Laptop className="size-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold text-foreground">Windows PC - Chrome</p>
                            <Badge className="bg-emerald-50 text-emerald-600 border-emerald-100 text-[9px] font-black h-4 px-1">SEDANG AKTIF</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Jakarta, Indonesia • IP: 182.1.22.91</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>

                    <div className="p-6 flex items-center justify-between opacity-70">
                      <div className="flex items-center gap-4">
                        <div className="size-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
                          <Smartphone className="size-5" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-foreground">MacBook Pro - Safari</p>
                          <p className="text-xs text-muted-foreground">Jakarta, Indonesia • 2 jam lalu</p>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="text-muted-foreground">
                        <ChevronRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar Settings */}
            <div className="space-y-8">
              {/* Permissions Card */}
              <Card className="bg-primary text-primary-foreground shadow-xl border-0 overflow-hidden relative group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:rotate-12 transition-transform">
                  <Shield className="size-24" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Hak Akses Sistem</CardTitle>
                  <div className="mt-2 py-1 px-3 bg-white/20 backdrop-blur-md rounded-lg inline-block">
                    <p className="text-[10px] font-black uppercase tracking-widest">Administrator Tingkat 4</p>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="size-4 text-emerald-300" />
                      <span className="text-xs font-bold">Verifikasi Mutu Gizi</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="size-4 text-emerald-300" />
                      <span className="text-xs font-bold">Akses Buku Besar Blockchain</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="size-4 text-emerald-300" />
                      <span className="text-xs font-bold">Blokir Vendor Nakal</span>
                    </div>
                    <div className="flex items-center gap-3 opacity-50">
                      <XCircle className="size-4 text-red-300" />
                      <span className="text-xs font-bold line-through">Akses Root Sistem</span>
                    </div>
                  </div>
                  <Button className="w-full bg-white text-primary hover:bg-white/90 font-black text-[10px] uppercase tracking-widest mt-4">
                    Lihat Dokumen Kebijakan
                  </Button>
                </CardContent>
              </Card>

              {/* Security Logs Card */}
              <Card className="bg-card border-border shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-bold">Log Keamanan Terakhir</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6 relative before:absolute before:inset-0 before:left-2 before:border-l before:border-border before:border-dashed">
                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 size-4 bg-primary/10 rounded-full border-2 border-primary flex items-center justify-center z-10">
                        <div className="size-1.5 bg-primary rounded-full" />
                      </div>
                      <p className="text-[11px] font-bold text-foreground">Kata Sandi Diubah</p>
                      <p className="text-[10px] text-muted-foreground">Oleh sistem keamanan • 2 hari lalu</p>
                    </div>

                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 size-4 bg-primary/10 rounded-full border-2 border-primary flex items-center justify-center z-10">
                        <div className="size-1.5 bg-primary rounded-full" />
                      </div>
                      <p className="text-[11px] font-bold text-foreground">Perangkat Baru Terverifikasi</p>
                      <p className="text-[10px] text-muted-foreground">Chrome via Windows • 5 hari lalu</p>
                    </div>

                    <div className="relative pl-8">
                      <div className="absolute left-0 top-1 size-4 bg-destructive/10 rounded-full border-2 border-destructive flex items-center justify-center z-10">
                        <div className="size-1.5 bg-destructive rounded-full" />
                      </div>
                      <p className="text-[11px] font-bold text-destructive">Percobaan Login Gagal</p>
                      <p className="text-[10px] text-muted-foreground">IP: 192.168.1.10 • 1 minggu lalu</p>
                    </div>
                  </div>
                  
                  <Button variant="link" className="w-full mt-6 h-auto p-0 text-[10px] font-bold uppercase tracking-widest text-primary">
                    Lihat Semua Aktivitas
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
