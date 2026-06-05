"use client";

import * as React from "react";
import {
  Search,
  Send,
  Paperclip,
  MoreHorizontal,
  Phone,
  Video,
  CheckCheck,
  Clock,
  Circle,
  Info,
  ShieldCheck,
  FileText,
  MessageSquare
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Badge } from "@workspace/ui/components/badge";
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar";
import { Card, CardContent } from "@workspace/ui/components/card";
import { ScrollArea } from "@workspace/ui/components/scroll-area";
import { Separator } from "@workspace/ui/components/separator";
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { cn } from "@workspace/ui/lib/utils";

export default function SupplierChatPage() {
  const [mounted, setMounted] = React.useState(false);
  const [activeChat, setActiveChat] = React.useState(1);
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const chats = [
    {
      id: 1,
      name: "Budi (Vendor SPPG Jakarta)",
      lastMsg: "Bisa kirim 200kg ayam besok pagi?",
      time: "14:20",
      unread: 2,
      online: true,
      avatar: "B",
      label: "Nego Aktif",
    },
    {
      id: 2,
      name: "Siti (Mitra SPPG Bandung)",
      lastMsg: "Terima kasih, barang sudah sampai.",
      time: "Kemarin",
      unread: 0,
      online: false,
      avatar: "S",
      label: "Selesai",
    },
    {
      id: 3,
      name: "Agus (Koordinator SPPG)",
      lastMsg: "Tolong kirimkan sertifikat Halal terbaru.",
      time: "Selasa",
      unread: 0,
      online: true,
      avatar: "A",
      label: "Reguler",
    },
  ];

  const messages = [
    { id: 1, type: "system", text: "Koneksi terenkripsi E2E aktif. Chat ini ditautkan dengan Purchase Order #PO-9921.", time: "14:10" },
    { id: 2, type: "text", text: "Halo, selamat siang PT Tani Makmur.", sender: "vendor", time: "14:15" },
    { id: 3, type: "text", text: "Siang Pak Budi. Ada yang bisa kami bantu?", sender: "me", time: "14:16" },
    { id: 4, type: "text", text: "Saya mau tanya stok daging ayam broiler untuk besok. Bisa kirim 200kg ke Dapur SPPG Tebet?", sender: "vendor", time: "14:18" },
    { id: 5, type: "text", text: "Bisa kirim 200kg ayam besok pagi?", sender: "vendor", time: "14:20" },
    { id: 6, type: "quotation", title: "Penawaran Harga B2B", items: "Daging Ayam Broiler (200kg)", price: "Rp 6.000.000", discount: "Rp 400.000", sender: "me", time: "14:25" },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto animate-in fade-in duration-500 min-h-screen">
      
      {/* 1. Deep Orange Hero Banner (Vendor Style) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-orange-900 via-orange-800 to-slate-900 shadow-sm border border-orange-700/50">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <MessageSquare className="size-40" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3">
            <Badge className="bg-orange-500/20 text-orange-100 border border-orange-500/30 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full backdrop-blur-sm">
              <span className="size-1.5 rounded-full bg-orange-400 animate-pulse mr-2 inline-block" /> B2B Communication
            </Badge>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Pusat Negosiasi & Chat</h1>
            <p className="text-orange-100/80 text-sm max-w-xl leading-relaxed">
              Diskusikan penawaran harga grosir, cek riwayat kesepakatan, dan kelola Purchase Order langsung dari ruang obrolan Anda.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Bento-Box Chat Application */}
      <Card className="border-none rounded-2xl overflow-hidden bg-white ring-1 ring-slate-200/60 shadow-sm flex flex-col md:flex-row h-[700px]">
        
        {/* Sidebar Chat List */}
        <div className="w-full md:w-80 border-r border-slate-100 bg-slate-50/50 flex flex-col shrink-0">
          <div className="p-5 border-b border-slate-100 bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold text-slate-900">Daftar Pesan</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors">
                <MoreHorizontal className="size-4" />
              </Button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <Input 
                placeholder="Cari vendor atau PO..." 
                className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-300 focus:ring-0 rounded-lg text-xs font-medium transition-all" 
              />
            </div>
          </div>

          <div className="px-4 py-3 bg-white border-b border-slate-100">
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="w-full h-auto p-1 bg-slate-100/80 rounded-lg grid grid-cols-3 gap-1">
                <TabsTrigger value="all" className="rounded-md text-[10px] py-1.5 font-bold uppercase tracking-widest border-none data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-none outline-none">Semua</TabsTrigger>
                <TabsTrigger value="nego" className="rounded-md text-[10px] py-1.5 font-bold uppercase tracking-widest border-none data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-none outline-none">Nego</TabsTrigger>
                <TabsTrigger value="deal" className="rounded-md text-[10px] py-1.5 font-bold uppercase tracking-widest border-none data-[state=active]:bg-white data-[state=active]:text-emerald-600 data-[state=active]:shadow-none outline-none">Deal</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          <ScrollArea className="flex-1">
            <div className="p-3 space-y-1">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => setActiveChat(chat.id)}
                  className={cn(
                    "w-full flex items-center gap-3 p-3 rounded-xl transition-colors border text-left outline-none",
                    activeChat === chat.id 
                      ? "bg-slate-100 border-slate-200 shadow-none" 
                      : "border-transparent hover:bg-slate-50"
                  )}
                >
                  <div className="relative">
                    <Avatar className="size-10 border border-slate-200">
                      <AvatarFallback className={cn(
                        "font-bold text-sm",
                        activeChat === chat.id ? "bg-orange-600 text-white" : "bg-slate-100 text-slate-500"
                      )}>
                        {chat.avatar}
                      </AvatarFallback>
                    </Avatar>
                    {chat.online && (
                      <div className="absolute bottom-0 right-0 size-2.5 bg-emerald-500 rounded-full border border-white" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className={cn(
                        "font-bold text-xs truncate",
                        activeChat === chat.id ? "text-slate-900" : "text-slate-700"
                      )}>{chat.name}</span>
                      <span className={cn(
                        "text-[9px] font-semibold",
                        chat.unread > 0 ? "text-orange-600" : "text-slate-400"
                      )}>{chat.time}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <p className={cn(
                        "text-[11px] truncate font-medium",
                        chat.unread > 0 ? "text-slate-900 font-bold" : "text-slate-500"
                      )}>{chat.lastMsg}</p>
                      {chat.unread > 0 && (
                        <div className="size-4 bg-orange-600 rounded-full flex items-center justify-center shrink-0 ml-2">
                          <span className="text-[9px] font-bold text-white">{chat.unread}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-1.5">
                      <Badge className={cn(
                        "border-none px-1.5 py-0 h-3.5 text-[8px] font-bold uppercase tracking-widest rounded-sm",
                        chat.label === 'Nego Aktif' ? "bg-amber-100 text-amber-700" :
                        chat.label === 'Selesai' ? "bg-emerald-100 text-emerald-700" :
                        "bg-slate-100 text-slate-500"
                      )}>
                        {chat.label}
                      </Badge>
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
          <header className="h-[72px] bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <Avatar className="size-10 border border-slate-200">
                <AvatarFallback className="bg-orange-600 text-white font-bold text-sm">B</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Budi (Vendor SPPG Jakarta)</h3>
                <div className="flex items-center gap-1 mt-0.5">
                  <Circle className="size-2 fill-emerald-500 text-emerald-500" />
                  <span className="text-[10px] font-bold text-slate-500">Online</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 px-3 font-bold text-xs text-slate-700 border-slate-200 hover:bg-slate-50 gap-2 hidden sm:flex">
                <FileText className="size-3.5" /> Buat Penawaran
              </Button>
              <Separator orientation="vertical" className="h-4 mx-1 hidden sm:block bg-slate-200" />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
                <Phone className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md">
                <Info className="size-4" />
              </Button>
            </div>
          </header>

          {/* Messages Area */}
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              <div className="flex justify-center">
                <span className="bg-white border border-slate-200 text-slate-400 font-bold text-[9px] uppercase tracking-widest rounded-md px-3 py-1 shadow-sm">
                  Hari Ini
                </span>
              </div>

              {messages.map((msg) => {
                if (msg.type === 'system') {
                  return (
                    <div key={msg.id} className="flex justify-center my-4">
                      <div className="bg-amber-50 border border-amber-100/50 rounded-lg px-4 py-2 flex items-center gap-2 text-center">
                        <ShieldCheck className="size-4 text-amber-500 shrink-0" />
                        <p className="text-[10px] font-bold text-amber-800 uppercase tracking-widest">
                          {msg.text}
                        </p>
                      </div>
                    </div>
                  );
                }

                if (msg.type === 'quotation') {
                  return (
                     <div key={msg.id} className="flex w-full justify-end group my-4">
                       <div className="max-w-[85%] md:max-w-[60%] space-y-1 flex flex-col items-end">
                         <Card className="bg-white border border-orange-200 rounded-xl overflow-hidden w-full">
                           <div className="bg-orange-50 px-4 py-3 flex items-center justify-between border-b border-orange-100">
                             <div className="flex items-center gap-2 text-orange-800">
                               <FileText className="size-4" />
                               <span className="font-bold text-xs uppercase tracking-widest">{msg.title}</span>
                             </div>
                             <span className="text-[10px] font-bold text-orange-600 bg-white px-2 py-0.5 rounded border border-orange-100">PO-9921</span>
                           </div>
                           <CardContent className="p-4 space-y-3">
                             <div>
                               <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Detail Item</p>
                               <p className="text-xs font-bold text-slate-900 mt-0.5">{msg.items}</p>
                             </div>
                             <div className="flex justify-between items-end border-t border-slate-100 pt-3 border-dashed">
                               <div>
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Diskon Grosir</p>
                                 <p className="text-xs font-bold text-emerald-600 mt-0.5">-{msg.discount}</p>
                               </div>
                               <div className="text-right">
                                 <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total Bayar</p>
                                 <p className="text-lg font-black text-slate-900 mt-0.5">{msg.price}</p>
                               </div>
                             </div>
                             <Button size="sm" variant="outline" className="w-full text-xs font-bold border-slate-200 text-slate-600 mt-2 h-8 rounded-lg hover:bg-slate-50">
                               Tarik Penawaran
                             </Button>
                           </CardContent>
                         </Card>
                         <div className="flex items-center gap-1.5 px-1 flex-row-reverse">
                           <span className="text-[9px] font-bold text-slate-400">{msg.time}</span>
                           <CheckCheck className="size-3 text-emerald-500" />
                         </div>
                       </div>
                     </div>
                  );
                }

                return (
                  <div key={msg.id} className={cn(
                    "flex w-full group",
                    msg.sender === 'me' ? "justify-end" : "justify-start"
                  )}>
                    <div className={cn(
                      "max-w-[75%] md:max-w-[60%] space-y-1",
                      msg.sender === 'me' ? "items-end flex flex-col" : "items-start flex flex-col"
                    )}>
                      <div className={cn(
                        "px-4 py-2.5 text-sm font-medium relative",
                        msg.sender === 'me' 
                          ? "bg-orange-600 text-white rounded-2xl rounded-tr-sm" 
                          : "bg-white border border-slate-200 text-slate-900 rounded-2xl rounded-tl-sm"
                      )}>
                        {msg.text}
                      </div>
                      <div className={cn(
                        "flex items-center gap-1.5 px-1 opacity-0 group-hover:opacity-100 transition-opacity",
                        msg.sender === 'me' ? "flex-row-reverse" : "flex-row"
                      )}>
                        <span className="text-[9px] font-bold text-slate-400">{msg.time}</span>
                        {msg.sender === 'me' && <CheckCheck className="size-3 text-emerald-500" />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>

          {/* Input Area (Flush with bottom) */}
          <footer className="p-4 bg-white border-t border-slate-100 shrink-0">
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl shrink-0">
                <Paperclip className="size-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 text-orange-600 hover:bg-orange-50 bg-orange-50/50 rounded-xl shrink-0 hidden sm:flex" title="Kirim Penawaran">
                <FileText className="size-4" />
              </Button>
              
              <Input 
                placeholder="Tulis pesan..." 
                className="flex-1 bg-slate-50 border-slate-200 focus:bg-white focus:border-slate-300 focus:ring-0 text-sm h-10 px-4 rounded-xl transition-colors"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              
              <Button className="h-10 px-5 font-bold gap-2 bg-orange-600 hover:bg-orange-700 text-white rounded-xl shadow-sm transition-colors shrink-0">
                <Send className="size-4" /> <span className="hidden md:inline">Kirim</span>
              </Button>
            </div>
          </footer>
        </div>
      </Card>
    </div>
  );
}
