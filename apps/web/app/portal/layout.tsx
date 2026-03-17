"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  ChevronRight,
  ChevronDown,
  Folder,
  Circle,
} from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { useUserMenu } from "@/hooks/use-user-menu";
import { MenuTree } from "@workspace/common";

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
};

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
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
          href={item.path}
          onClick={(e) => hasChildren && toggleExpand(item.id, e)}
        >
          <Button
            variant="ghost"
            className={cn(
              "w-full !justify-start gap-3 h-10 px-3 transition-colors",
              pathname === item.path
                ? "text-primary bg-primary/10 font-semibold"
                : "text-muted-foreground hover:text-primary hover:bg-primary/5",
              level > 0 && "pl-8",
            )}
          >
            <Icon className={cn("size-4 shrink-0", level > 0 && "size-2.5")} />
            <span className="flex-1 truncate text-left">{item.name}</span>
            {hasChildren && (
              <div onClick={(e) => toggleExpand(item.id, e)}>
                {isExpanded ? (
                  <ChevronDown className="size-4 shrink-0 opacity-50" />
                ) : (
                  <ChevronRight className="size-4 shrink-0 opacity-50" />
                )}
              </div>
            )}
          </Button>
        </Link>
        {hasChildren && isExpanded && (
          <div className="space-y-1">
            {item.children.map((child) => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-64 border-r border-border bg-card flex flex-col z-20">
        <div className="p-6 flex items-center gap-3">
          <div className="size-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <h1 className="font-bold text-foreground leading-tight">
              VendorTrack
            </h1>
            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              MBG Monitoring
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto text-muted-foreground custom-scrollbar">
          {loading ? (
            <div className="space-y-2 p-2">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-10 w-full bg-muted animate-pulse rounded-lg"
                />
              ))}
            </div>
          ) : (
            menus.map((item) => renderMenuItem(item))
          )}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <p className="px-3 mb-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">
            System
          </p>
          <div className="space-y-1">
            <Link href="/portal/settings">
              <Button
                variant="ghost"
                className={cn(
                  "w-full !justify-start gap-3 h-10 px-3 transition-colors",
                  pathname === "/portal/settings"
                    ? "text-primary bg-primary/10 font-semibold"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5",
                )}
              >
                <Settings className="size-4" />
                Pengaturan
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full !justify-start gap-3 text-muted-foreground hover:text-primary hover:bg-primary/5 h-10 px-3 transition-colors"
            >
              <HelpCircle className="size-4" />
              Help Center
            </Button>

            {/* Logout Button */}
            <Button
              variant="ghost"
              onClick={logout}
              className="w-full !justify-start gap-3 h-10 px-3 text-destructive hover:bg-destructive/5 hover:text-destructive transition-colors"
            >
              <LogOut className="size-4" />
              Keluar (Log Out)
            </Button>
          </div>
        </div>

        <div className="p-4 border-t border-border">
          <div className="p-3 bg-muted rounded-2xl flex items-center gap-3">
            <Avatar className="size-10 border-2 border-background shadow-sm">
              <AvatarImage src="" />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-xs">
                {user?.fullName
                  ?.split(" ")
                  .map((n) => n[0])
                  .join("") || "AD"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground truncate">
                {user?.fullName || "Admin BGN"}
              </p>
              <p className="text-[11px] font-medium text-muted-foreground truncate uppercase">
                {user?.role || "Superuser"}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen">{children}</main>
    </div>
  );
}
