"use client";

import { Bell, User, Settings } from "lucide-react";
import { Button } from "@workspace/ui/components/button";
import { useAuth } from "@/components/providers/auth-provider";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  showNotifications?: boolean;
  showProfile?: boolean;
}

export function PageHeader({ title, showNotifications = true, showProfile = true }: PageHeaderProps) {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 h-16 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {showProfile && user && (
          <Link href="/settings">
            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs border border-green-200">
              {user.avatar || user.name.charAt(0)}
            </div>
          </Link>
        )}
        <h1 className="text-lg font-black text-slate-900 tracking-tight">{title}</h1>
      </div>
      
      <div className="flex items-center gap-1">
        {showNotifications && (
          <Button variant="ghost" size="icon" className="text-slate-500 rounded-full h-10 w-10" asChild>
            <Link href="/notifications">
              <Bell className="h-5 w-5" />
            </Link>
          </Button>
        )}
        <Button variant="ghost" size="icon" className="text-slate-500 rounded-full h-10 w-10" asChild>
          <Link href="/settings">
            <Settings className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </header>
  );
}
