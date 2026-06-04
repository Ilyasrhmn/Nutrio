"use client"

import * as React from "react"
import { 
  Search, 
  Send, 
  Paperclip, 
  MoreHorizontal, 
  Phone, 
  Video,
  User,
  Check,
  CheckCheck,
  Package,
  Clock,
  Circle,
  Info
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar"
import { Card, CardContent } from "@workspace/ui/components/card"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Separator } from "@workspace/ui/components/separator"
import { cn } from "@workspace/ui/lib/utils"

export default function SupplierChatPage() {
  const [mounted, setMounted] = React.useState(false)
  const [activeChat, setActiveChat] = React.useState(1)
  const [message, setMessage] = React.useState("")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const chats: { id: number; name: string; lastMsg: string; time: string; unread: number; online: boolean; avatar: string }[] = []

  const messages: { id: number; text: string; sender: string; time: string }[] = []

  return (
    <div className="h-[calc(100vh-2rem)] flex overflow-hidden border-t border-border">
      {/* Sidebar Chat List */}
      <div className="w-80 border-r border-border bg-card flex flex-col">
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-black text-slate-900 tracking-tight">Pesan</h2>
            <Button variant="ghost" size="icon" className="rounded-full">
              <MoreHorizontal className="size-5" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input placeholder="Cari percakapan..." className="pl-10 h-10 bg-slate-50 border-none rounded-xl" />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="px-3 space-y-1 pb-4">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 rounded-2xl transition-all",
                  activeChat === chat.id ? "bg-primary/10" : "hover:bg-slate-50"
                )}
              >
                <div className="relative">
                  <Avatar className="size-12 border-2 border-background shadow-sm">
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">{chat.avatar}</AvatarFallback>
                  </Avatar>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 rounded-full border-2 border-white" />
                  )}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center mb-0.5">
                    <span className="font-bold text-slate-900 text-sm truncate">{chat.name}</span>
                    <span className="text-[10px] font-medium text-slate-400">{chat.time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground truncate font-medium">{chat.lastMsg}</p>
                    {chat.unread > 0 && (
                      <div className="size-4 bg-primary rounded-full flex items-center justify-center">
                        <span className="text-[9px] font-black text-white">{chat.unread}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col bg-slate-50/30">
        {/* Chat Header */}
        <header className="h-20 bg-card border-b border-border px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 border border-border shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                <User className="size-4" />
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pilih Percakapan</h3>
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Belum ada chat aktif</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
              <Phone className="size-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
              <Video className="size-5" />
            </Button>
            <Separator orientation="vertical" className="h-6 mx-2" />
            <Button variant="ghost" size="icon" className="rounded-full text-slate-400">
              <Info className="size-5" />
            </Button>
          </div>
        </header>

        {/* Messages Area */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex justify-center">
              <Badge variant="secondary" className="bg-slate-100 text-slate-500 font-bold text-[10px] uppercase rounded-full px-4">Hari Ini</Badge>
            </div>

            {messages.map((msg) => (
              <div key={msg.id} className={cn(
                "flex w-full",
                msg.sender === 'me' ? "justify-end" : "justify-start"
              )}>
                <div className={cn(
                  "max-w-[70%] space-y-1",
                  msg.sender === 'me' ? "items-end" : "items-start"
                )}>
                  <div className={cn(
                    "p-4 rounded-2xl text-sm font-medium shadow-sm",
                    msg.sender === 'me' 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-white border border-border rounded-tl-none text-slate-900"
                  )}>
                    {msg.text}
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 px-1",
                    msg.sender === 'me' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <span className="text-[10px] font-bold text-slate-400">{msg.time}</span>
                    {msg.sender === 'me' && <CheckCheck className="size-3 text-primary" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <footer className="p-6 bg-transparent">
          <Card className="max-w-4xl mx-auto border-border shadow-lg rounded-2xl overflow-hidden">
            <CardContent className="p-3 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-primary shrink-0">
                <Paperclip className="size-5" />
              </Button>
              <Input 
                placeholder="Tulis pesan atau nego harga..." 
                className="flex-1 border-none focus-visible:ring-0 text-sm font-medium"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-xl text-slate-400 hover:text-primary hidden sm:flex">
                  <Package className="size-5" />
                </Button>
                <Button className="rounded-xl px-5 font-bold gap-2">
                  <Send className="size-4" /> Kirim
                </Button>
              </div>
            </CardContent>
          </Card>
          <p className="text-center mt-3 text-[10px] text-muted-foreground font-medium flex items-center justify-center gap-1.5">
            <Clock className="size-3" /> Waktu respons rata-rata Anda: <span className="text-slate-900 font-bold">12 Menit</span>
          </p>
        </footer>
      </div>
    </div>
  )
}
