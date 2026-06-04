"use client";

import { useState, useEffect } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Info,
  ChevronLeft,
  Loader2,
  Package,
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@workspace/ui/components/card";
import { apiClient } from "@/lib/api-client";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

const ICON_MAP: Record<string, { icon: React.ElementType; color: string }> = {
  checkpoint: { icon: CheckCircle2, color: "bg-green-100 text-green-600" },
  alert: { icon: AlertTriangle, color: "bg-amber-100 text-amber-600" },
  delivery: { icon: Truck, color: "bg-blue-100 text-blue-600" },
  order: { icon: Package, color: "bg-indigo-100 text-indigo-600" },
  info: { icon: Info, color: "bg-slate-100 text-slate-500" },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "Baru saja";
  if (minutes < 60) return `${minutes} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  return `${days} hari lalu`;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiClient.get<Notification[]>("/notifications/me")
      .then((r) => setNotifications(r.data ?? []))
      .catch(() => setNotifications([]))
      .finally(() => setLoading(false));
  }, []);

  const markRead = (id: string) => {
    apiClient.post(`/notifications/${id}/read`).catch(() => {});
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const unread = notifications.filter((n) => !n.isRead);
  const read = notifications.filter((n) => n.isRead);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 h-16 flex items-center gap-3">
        <Link href="/" className="p-2 -ml-2 text-slate-500">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-black text-slate-900 tracking-tight">Notifikasi</h1>
        {unread.length > 0 && (
          <span className="ml-auto text-[10px] font-black text-primary bg-primary/10 px-2 py-0.5 rounded-full">
            {unread.length} belum dibaca
          </span>
        )}
      </div>

      <div className="p-4 space-y-3">
        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center py-16 gap-3 text-slate-400">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center">
              <Bell className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-sm font-bold">Tidak ada notifikasi</p>
          </div>
        ) : (
          <>
            {unread.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Belum Dibaca</p>
                {unread.map((notif) => {
                  const { icon: Icon, color } = ICON_MAP[notif.type] ?? ICON_MAP.info!;
                  return (
                    <Card
                      key={notif.id}
                      className="border-none shadow-sm rounded-2xl overflow-hidden active:scale-[0.98] transition-all cursor-pointer ring-1 ring-primary/20"
                      onClick={() => markRead(notif.id)}
                    >
                      <CardContent className="p-4 flex gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-black text-slate-900">{notif.title}</h3>
                            <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">{timeAgo(notif.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed">{notif.body}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {read.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 pt-2">Sudah Dibaca</p>
                {read.map((notif) => {
                  const { icon: Icon, color } = ICON_MAP[notif.type] ?? ICON_MAP.info!;
                  return (
                    <Card key={notif.id} className="border-none shadow-sm rounded-2xl overflow-hidden opacity-60">
                      <CardContent className="p-4 flex gap-4">
                        <div className={`h-12 w-12 rounded-2xl flex-shrink-0 flex items-center justify-center ${color}`}>
                          <Icon className="h-6 w-6" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className="text-sm font-bold text-slate-700">{notif.title}</h3>
                            <span className="text-[10px] font-bold text-slate-400 shrink-0 ml-2">{timeAgo(notif.createdAt)}</span>
                          </div>
                          <p className="text-xs text-slate-400 font-medium leading-relaxed">{notif.body}</p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
