"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, ClipboardList, Package, School, Globe } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";
import { UserRole } from "@workspace/common/types";

const ALL_NAV_ITEMS = [
  { label: "Home", href: "/", icon: Home, roles: [UserRole.VENDOR, UserRole.SUPPLIER, UserRole.COORDINATOR_SPPG, UserRole.PUBLIC] },
  { label: "Operasional", href: "/operasional/live", icon: ClipboardList, roles: [UserRole.VENDOR] },
  { label: "Orders", href: "/orders", icon: Package, roles: [UserRole.SUPPLIER] },
  { label: "Sekolah", href: "/sekolah", icon: School, roles: [UserRole.COORDINATOR_SPPG] },
  { label: "Publik", href: "/publik", icon: Globe, roles: [UserRole.VENDOR, UserRole.SUPPLIER, UserRole.COORDINATOR_SPPG, UserRole.PUBLIC] },
];

export function BottomNavigation() {
  const pathname = usePathname();
  const { user } = useAuth();

  if (!user || pathname === "/login") return null;

  const filteredItems = ALL_NAV_ITEMS.filter(item => item.roles.includes(user.role));

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 pb-safe shadow-[0_-1px_10px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full transition-all duration-200",
                isActive ? "text-green-600 scale-110" : "text-slate-400 hover:text-slate-600"
              )}
            >
              <item.icon className={cn("h-5 w-5 mb-1", isActive && "stroke-[2.5px]")} />
              <span className="text-[10px] font-bold leading-none">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
