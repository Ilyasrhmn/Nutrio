"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
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
  Bot,
  User,
  LogOut,
  ClipboardCheck,
  Utensils,
  Camera,
  Store,
  ChevronRight,
  ChevronDown,
  Folder,
  Circle,
  CalendarDays,
  Scale,
  ClipboardList,
  CookingPot,
  UtensilsCrossed,
  AlertCircle,
  BookOpen,
  Package,
  MessageSquare,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { cn } from "@workspace/ui/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useUserMenu } from "@/hooks/use-user-menu";
import { MenuTree } from "@workspace/common";
import { AppSubject } from "@/lib/casl";

const ICON_MAP: Record<string, any> = {
  LayoutDashboard,
  Map: MapIcon,
  Wallet,
  Utensils,
  Store,
  Camera,
  Truck,
  ClipboardCheck,
  History,
  FileBarChart,
  ShieldCheck,
  Settings,
  Folder,
  CalendarDays,
  Scale,
  ClipboardList,
  CookingPot,
  UtensilsCrossed,
  AlertCircle,
  BookOpen,
  Package,
  MessageSquare,
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout, ability } = useAuth();
  const { menus, loading } = useUserMenu();
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});

  const toggleExpand = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to render menu items recursively
  const renderMenuItem = (item: MenuTree, level = 0) => {
    const Icon = ICON_MAP[item.icon] || (level === 0 ? Folder : Circle);
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expanded[item.id];
    const isActive =
      pathname === item.path ||
      (hasChildren && item.children.some((child) => pathname === child.path));

    return (
      <div key={item.id} className="space-y-1">
        <Link
          href={item.path || "#"}
          onClick={(e) => hasChildren && toggleExpand(item.id, e)}
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full !justify-start gap-3 h-10 px-3 transition-all rounded-xl",
              pathname === item.path
                ? "text-primary bg-primary/10 font-bold shadow-sm"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50",
              level > 0 && "pl-9",
              hasChildren && isActive && "text-primary bg-primary/5 font-bold"
            )}
          >
            <div className="relative">
              <Icon className={cn("shrink-0", level > 0 ? "size-3.5" : "size-4")} />
              {/* Optional: Add badge for specific items if needed */}
              {item.name.includes("Monitoring") && (
                <div className="absolute -top-1 -right-1 size-2 bg-red-500 rounded-full border-2 border-white" />
              )}
            </div>
            <span className="flex-1 truncate text-left text-xs">{item.name}</span>
            {hasChildren && (
              <div onClick={(e) => toggleExpand(item.id, e)}>
                {isExpanded ? (
                  <ChevronDown className="size-3.5 shrink-0 opacity-50" />
                ) : (
                  <ChevronRight className="size-3.5 shrink-0 opacity-50" />
                )}
              </div>
            )}
          </Button>
        </Link>
        {hasChildren && isExpanded && (
          <div className="space-y-1 animate-in slide-in-from-top-1 duration-200 mt-1">
            {item.children.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-[#F0F3F7]">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-[260px] bg-white border-r border-slate-200/80 flex flex-col z-50 shadow-sm">
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="size-8 bg-gradient-to-br from-primary to-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-primary/20">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-none text-lg tracking-tight">
                Nutrio
              </h1>
              <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">
                MBG Monitoring
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 w-full">
          <nav className="p-4 space-y-1.5 w-full">
            {loading ? (
              <div className="space-y-2 p-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-full bg-slate-100 animate-pulse rounded-xl"
                  />
                ))}
              </div>
            ) : (
              menus.map((item) => renderMenuItem(item))
            )}
          </nav>
        </ScrollArea>

        {/* System & Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <p className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            Sistem
          </p>
          <div className="space-y-1 mb-4">
            {ability.can("read", "Settings") && (
              <Link href="/portal/settings">
                <Button
                  variant="ghost"
                  className={cn(
                    "w-full !justify-start gap-3 h-9 px-3 transition-colors text-xs rounded-xl",
                    pathname === "/portal/settings"
                      ? "text-primary bg-primary/10 font-bold"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                  )}
                >
                  <Settings className="size-4" />
                  Pengaturan
                </Button>
              </Link>
            )}
            <Link href="/portal/asisten">
              <Button
                variant="ghost"
                className={cn(
                  "w-full !justify-start gap-3 h-9 px-3 transition-colors text-xs rounded-xl text-indigo-600 hover:bg-indigo-50",
                  pathname === "/portal/asisten" && "bg-indigo-50 font-bold"
                )}
              >
                <Bot className="size-4" />
                Asisten AI (Juknis)
              </Button>
            </Link>
            <Link href="/portal/help">
              <Button
                variant="ghost"
                className={cn(
                  "w-full !justify-start gap-3 h-9 px-3 transition-colors text-xs rounded-xl",
                  pathname === "/portal/help"
                    ? "text-primary bg-primary/10 font-bold"
                    : "text-slate-500 hover:text-slate-900 hover:bg-slate-100",
                )}
              >
                <HelpCircle className="size-4" />
                Help Center
              </Button>
            </Link>
          </div>

          {/* User Card */}
          <div className="p-3 bg-white rounded-xl border border-slate-200/60 shadow-sm flex items-center gap-3 group relative">
            <Avatar className="size-9 border-2 border-white shadow-sm ring-1 ring-slate-100">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">
                {user?.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.fullName || "Admin BGN"}
              </p>
              <p className="text-[10px] font-semibold text-slate-500 truncate mt-0.5">
                {user?.role || "Superuser"}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="size-8 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg absolute right-2 opacity-0 group-hover:opacity-100 transition-all"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-[260px] min-h-screen">
        {/* Top Navbar Component (Optional, but good for global actions) */}
        <header className="h-16 bg-white border-b border-slate-200/80 flex items-center justify-between px-6 sticky top-0 z-40">
          {/* Breadcrumb or Page Title Placeholder */}
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            {/* Contextual top bar content could go here */}
          </div>
          
          {/* Global Actions */}
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Cari menu, fitur, atau data..." 
                className="h-9 w-64 pl-9 pr-4 rounded-full bg-slate-100/80 border-transparent text-sm focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
            <Button variant="ghost" size="icon" className="size-9 text-slate-500 hover:text-slate-900 rounded-full bg-slate-100/50">
              <Bell className="size-4" />
            </Button>
          </div>
        </header>

        {children}
      </main>
    </div>
  );
}
