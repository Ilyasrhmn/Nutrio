"use client"

import * as React from "react"
import { Bell } from "lucide-react"
import { Button } from "@workspace/ui/components/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover"
import { api, TokenStorage } from "@/lib/api-client"
import { opsClient } from "@/lib/realtime-client"
import { cn } from "@workspace/ui/lib/utils"

interface Notif {
  id: string
  subject: string | null
  body: string
  createdAt: string
  readAt: string | null
}

export function NotificationBell() {
  const [notifs, setNotifs] = React.useState<Notif[]>([])
  const [open, setOpen] = React.useState(false)

  const unreadCount = notifs.filter(n => !n.readAt).length

  // Initial fetch
  React.useEffect(() => {
    api.get<Notif[]>("/notifications/me").catch(() => null).then(data => {
      if (data) setNotifs(data)
    })
  }, [])

  // WebSocket subscription for real-time notifications
  React.useEffect(() => {
    const token = TokenStorage.getAccessToken()
    if (!token) return
    opsClient.connect(token)
    const handler = (payload: unknown) => {
      const notif = payload as Notif
      setNotifs(prev => [notif, ...prev].slice(0, 50))
    }
    opsClient.on("notification:new", handler)
    return () => opsClient.off("notification:new", handler)
  }, [])

  const markRead = async (id: string) => {
    await api.post(`/notifications/${id}/read`, {}).catch(() => {})
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
  }

  const markAllRead = () => {
    notifs.filter(n => !n.readAt).forEach(n => markRead(n.id))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative size-8 text-muted-foreground hover:text-primary shrink-0">
          <Bell className="size-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full border-2 border-card" />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" side="right" align="end">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <div className="flex items-center gap-2">
            <p className="font-bold text-sm">Notifikasi</p>
            {unreadCount > 0 && (
              <span className="text-[10px] font-black bg-red-500 text-white rounded-full px-1.5 py-0.5">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="text-xs text-primary hover:underline">
              Semua dibaca
            </button>
          )}
        </div>
        <div className="max-h-72 overflow-y-auto divide-y">
          {notifs.length === 0 ? (
            <p className="text-sm text-slate-500 text-center py-10">Belum ada notifikasi</p>
          ) : (
            notifs.map(n => (
              <div
                key={n.id}
                onClick={() => { if (!n.readAt) markRead(n.id) }}
                className={cn(
                  "px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors",
                  !n.readAt && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                {n.subject && (
                  <p className="text-xs font-bold text-foreground mb-0.5">{n.subject}</p>
                )}
                <p className="text-xs text-slate-700 leading-relaxed">{n.body}</p>
                <p className="text-[10px] text-slate-400 mt-1">
                  {new Date(n.createdAt).toLocaleString("id-ID", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
