"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
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
  User
} from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { cn } from "@workspace/ui/lib/utils"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const navItems = [
    { name: "Dashboard", icon: LayoutDashboard, href: "/portal" },
    { name: "Peta Sebaran", icon: MapIcon, href: "/portal/map" },
    { name: "Pencairan Dana", icon: Wallet, href: "/portal/funds" },
    { name: "Logistik & Pengiriman", icon: Truck, href: "/portal/logistics" },
    { name: "Audit Log", icon: History, href: "/portal/audit" },
    { name: "Laporan AI", icon: FileBarChart, href: "/portal/reports" },
  ]

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-card flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="font-bold text-foreground leading-tight">VendorTrack</h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">MBG Monitoring</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link key={item.name} href={item.href}>
                <Button 
                  variant="ghost" 
                  className={cn(
                    "w-full justify-start gap-3 h-10 px-3 transition-colors",
                    isActive 
                      ? "text-primary bg-primary/10 font-semibold" 
                      : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                  )}
                >
                  <item.icon className="size-4" />
                  {item.name}
                </Button>
              </Link>
            )
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">System</p>
          <div className="space-y-1">
            <Link href="/portal/settings">
              <Button 
                variant="ghost" 
                className={cn(
                  "w-full justify-start gap-3 h-10 px-3 transition-colors",
                  pathname === "/portal/settings" 
                    ? "text-primary bg-primary/10 font-semibold" 
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                )}
              >
                <Settings className="size-4" />
                Pengaturan
              </Button>
            </Link>
            <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/5 h-10 px-3 transition-colors">
              <HelpCircle className="size-4" />
              Help Center
            </Button>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="p-3 bg-muted rounded-2xl flex items-center gap-3">
            <Avatar className="size-10 border-2 border-background shadow-sm">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">AD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">Admin BGN</p>
              <p className="text-[11px] font-medium text-muted-foreground truncate">Superuser Nasional</p>
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
