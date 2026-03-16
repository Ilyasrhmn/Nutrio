"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  LayoutDashboard, 
  Map as MapIcon, 
  Wallet, 
  Truck,
  History, 
  FileBarChart,
  Settings, 
  HelpCircle, 
  ShieldCheck,
  User,
  LogOut,
  ClipboardCheck,
  Utensils,
  Camera,
  Store,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  Scale,
  ClipboardList,
  CookingPot,
  UtensilsCrossed
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"
import { useAuth } from "@/hooks/use-auth"
import { AppSubject } from "@/lib/casl"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, logout, ability } = useAuth()
  const [isOpsOpen, setIsOpsOpen] = React.useState(true)

  const navItems: { name: string; icon: any; href: string; subject: AppSubject }[] = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/portal", subject: "Dashboard" },
    { name: "Peta Sebaran", icon: MapIcon, href: "/portal/map", subject: "Map" },
    { name: "Pencairan Dana", icon: Wallet, href: "/portal/funds", subject: "Funds" },
    { 
      name: "Perencanaan & Operasional", 
      icon: UtensilsCrossed, 
      subject: "Menu",
      children: [
        { name: "Jadwal & Target Distribusi", icon: CalendarDays, href: "/portal/operasional/jadwal" },
        { name: "Kalkulasi Bahan (Auto-Scale)", icon: Scale, href: "/portal/operasional/kalkulasi-bahan" },
        { name: "Stock Opname Harian", icon: ClipboardList, href: "/portal/operasional/stock-opname" },
        { name: "Lembar Kerja Dapur (SOP)", icon: CookingPot, href: "/portal/operasional/kitchen-sop" },
      ]
    },
    { name: "Marketplace", icon: Store, href: "/portal/marketplace", subject: "Marketplace" },
    { name: "Eksekusi Checkpoint", icon: Camera, href: "/portal/live", subject: "LiveExecution" },
    { name: "Logistik & Pengiriman", icon: Truck, href: "/portal/logistics", subject: "Logistics" },
    { name: "Skor & Checkpoint", icon: ClipboardCheck, href: "/portal/checkpoints", subject: "Checkpoints" },
    { name: "Audit Log", icon: History, href: "/portal/audit", subject: "Audit" },
    { name: "Laporan AI", icon: FileBarChart, href: "/portal/reports", subject: "Reports" },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-68 border-r border-border bg-card flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="font-bold text-foreground leading-tight tracking-tight">VendorTrack</h1>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">MBG Monitoring</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto text-muted-foreground custom-scrollbar">
          {navItems.map((item) => {
            if (ability.cannot('view', item.subject)) return null;
            
            if (item.children) {
              return (
                <div key={item.name} className="space-y-1">
                  <Button 
                    variant="ghost" 
                    onClick={() => setIsOpsOpen(!isOpsOpen)}
                    className={cn(
                      "w-full justify-between gap-3 h-10 px-3 transition-all",
                      pathname.includes('/operasional') ? "text-primary bg-primary/5 font-bold" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="size-4" />
                      <span className="text-xs">{item.name}</span>
                    </div>
                    {isOpsOpen ? <ChevronDown className="size-3" /> : <ChevronRight className="size-3" />}
                  </Button>
                  
                  {isOpsOpen && (
                    <div className="pl-4 space-y-1 animate-in slide-in-from-top-1 duration-200">
                      {item.children.map((child) => {
                        const isChildActive = pathname === child.href
                        return (
                          <Link key={child.name} href={child.href}>
                            <Button 
                              variant="ghost" 
                              className={cn(
                                "w-full justify-start gap-3 h-9 px-3 text-[11px] transition-all rounded-lg",
                                isChildActive 
                                  ? "text-primary bg-primary/10 font-bold" 
                                  : "text-muted-foreground/70 hover:text-primary hover:bg-primary/5"
                              )}
                            >
                              <child.icon className="size-3.5" />
                              {child.name}
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            }

            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href || "#"}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3 transition-all rounded-lg",
                    isActive 
                      ? "text-primary bg-primary/10 font-bold shadow-sm" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <item.icon className="size-4" />
                  <span className="text-xs">{item.name}</span>
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <p className="px-3 mb-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-50">System</p>
          <div className="space-y-1">
            {ability.can('view', 'Settings') && (
              <Link href="/portal/settings">
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3 transition-colors text-xs",
                    pathname === "/portal/settings" ? "text-primary bg-primary/10 font-bold" : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <Settings className="size-4" />
                  Pengaturan
                </Button>
              </Link>
            )}
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/5 h-10 px-3 text-xs">
              <HelpCircle className="size-4" />
              Help Center
            </Button>
            
            <Button 
              variant="ghost" 
              onClick={logout}
              className="w-full justify-start gap-3 h-10 px-3 text-destructive hover:bg-destructive/5 hover:text-destructive transition-all text-xs font-medium"
            >
              <LogOut className="size-4" />
              Keluar (Log Out)
            </Button>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="p-3 bg-muted/50 rounded-2xl flex items-center gap-3 border border-border/50">
            <Avatar className="size-10 border-2 border-background shadow-sm">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {user?.fullName?.split(' ').map(n => n[0]).join('') || 'AD'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-bold text-foreground truncate">{user?.fullName || 'Admin BGN'}</p>
              <p className="text-[9px] font-black text-muted-foreground truncate uppercase tracking-tighter opacity-70">{user?.role || 'Superuser'}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">
        {children}
      </main>
    </div>
  )
}
