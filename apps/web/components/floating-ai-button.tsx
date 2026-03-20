"use client"

import React, { useState } from "react"
import { 
  Bot, 
  X, 
  Send, 
  Maximize2, 
  Minimize2, 
  Upload, 
  FileText, 
  ExternalLink,
  ClipboardCheck,
  MessageSquare,
  ShieldAlert,
  PanelRightClose,
  PanelRightOpen,
  Image as ImageIcon,
  FileCheck,
  Download
} from "lucide-react"
import { usePathname } from "next/navigation"
import { Button } from "@workspace/ui/components/button"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent } from "@workspace/ui/components/card"
import { cn } from "@workspace/ui/lib/utils"

// Tipe Data Pesan Baru
interface Message {
  role: "assistant" | "user";
  content: string;
  sources?: string[];
  attachment?: {
    type: "image" | "document";
    url: string;
    name?: string;
  };
}

export function FloatingAIButton() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isMaximized, setIsMaximized] = useState(false)
  const [showDocs, setShowDocs] = useState(true)
  
  // DUMMY DATA: Simulasi Konsultasi Nyata
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: "assistant", 
      content: "Halo! Saya Asisten AI Juknis. Ada yang bisa saya bantu terkait operasional MBG hari ini?",
    },
    {
      role: "user",
      content: "Saya mau tanya soal standar porsi protein untuk SD.",
    },
    {
      role: "assistant",
      content: "Berdasarkan Juknis BGN No. 2/2024, porsi protein hewani untuk siswa SD minimal adalah 40 gram. Berikut adalah dokumen referensinya.",
      sources: ["Juknis BGN Hal. 14"],
      attachment: {
        type: "document",
        url: "#",
        name: "STANDAR_GIZI_MBG_2026.pdf"
      }
    },
    {
      role: "user",
      content: "Oke, kalau foto masakan saya seperti ini apakah sudah sesuai standar CP3?",
      attachment: {
        type: "image",
        url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=500&auto=format&fit=crop",
        name: "foto_masakan_senin.jpg"
      }
    },
    {
      role: "assistant",
      content: "Analisa Vision menunjukkan porsi Anda sudah lengkap (Karbo, Protein, Sayur). Namun, uap panas tidak terlihat jelas. Sesuai SOP v3.1, foto CP3 harus menunjukkan uap untuk membuktikan makanan baru matang. Harap perhatikan pencahayaan saat memotret.",
      sources: ["SOP Dokumentasi Bab 5"]
    }
  ])
  
  const [input, setInput] = useState("")
  const isPortal = pathname.includes("/portal")

  if (pathname === "/portal/asisten" || pathname === "/asisten") return null

  const handleSend = () => {
    if (!input.trim()) return
    const newMsgs: Message[] = [...messages, { role: "user", content: input }]
    setMessages(newMsgs)
    setInput("")

    setTimeout(() => {
      setMessages([...newMsgs, { 
        role: "assistant", 
        content: "Pertanyaan Anda sedang saya proses dengan data Juknis terbaru. Ada lagi yang ingin ditambahkan?",
      }])
    }, 1000)
  }

  const renderMessage = (msg: Message, i: number) => (
    <div key={i} className={cn("flex gap-4", msg.role === "user" ? "flex-row-reverse" : "")}>
      <div className={cn(
        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm",
        msg.role === "assistant" ? "bg-indigo-600 text-white border-indigo-700" : "bg-white text-slate-500 border-slate-200"
      )}>
        {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <MessageSquare className="w-4 h-4" />}
      </div>
      <div className={cn("space-y-3 max-w-[85%]", msg.role === "user" ? "text-right" : "")}>
        <div className={cn(
          "p-4 rounded-2xl shadow-sm border text-left",
          msg.role === "assistant" ? "bg-indigo-50/30 border-indigo-100 text-slate-800" : "bg-white border-slate-200 text-slate-700"
        )}>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
          
          {/* ATTACHMENT RENDERING */}
          {msg.attachment && (
            <div className="mt-4 overflow-hidden rounded-xl border border-slate-200 bg-white">
              {msg.attachment.type === "image" ? (
                <div className="group relative">
                  <img src={msg.attachment.url} alt="Media" className="w-full h-auto max-h-60 object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button size="sm" variant="secondary" className="gap-2 font-bold"><Maximize2 className="size-3" /> Preview</Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-3">
                    <div className="size-10 bg-indigo-100 rounded-lg flex items-center justify-center text-indigo-600">
                      <FileCheck className="size-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700 truncate max-w-[150px]">{msg.attachment.name}</p>
                      <p className="text-[10px] text-slate-400">PDF Document • 2.4 MB</p>
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="text-slate-400"><Download className="size-4" /></Button>
                </div>
              )}
            </div>
          )}
        </div>
        
        {msg.sources && msg.sources.length > 0 && (
          <div className="flex gap-2 flex-wrap justify-start">
            {msg.sources.map((s, si) => (
              <Badge key={si} variant="secondary" className="text-[10px] bg-indigo-50 text-indigo-700 border-indigo-100 font-bold">
                <ClipboardCheck className="w-3 h-3 mr-1" /> {s}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* UNIFIED INTERFACE (MAXIMIZED) */}
      {isOpen && isMaximized && (
        <div 
          className={cn(
            "fixed inset-y-0 right-0 z-[110] bg-white shadow-2xl flex border-l animate-in slide-in-from-right duration-300",
            isPortal ? "left-64" : "left-0"
          )}
        >
          <div className="flex-1 flex flex-col bg-white border-r">
            <header className="p-4 border-b flex items-center justify-between bg-white">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm"><Bot className="w-5 h-5 animate-pulse" /></div>
                <div>
                  <h1 className="font-bold text-slate-900 leading-none">Pusat Analisis AI Juknis</h1>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Sesi Konsultasi Aktif</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => setShowDocs(!showDocs)} className="text-slate-400">
                  {showDocs ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
                </Button>
                <div className="w-px h-4 bg-slate-200 mx-1" />
                <Button variant="ghost" size="icon" onClick={() => setIsMaximized(false)} className="text-slate-400"><Minimize2 className="w-5 h-5" /></Button>
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400"><X className="w-5 h-5" /></Button>
              </div>
            </header>

            <ScrollArea className="flex-1 p-8 bg-white">
              <div className="max-w-4xl mx-auto space-y-10">
                {messages.map((msg, i) => renderMessage(msg, i))}
              </div>
            </ScrollArea>

            <div className="p-6 border-t bg-white">
              <div className="max-w-4xl mx-auto flex items-end gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm focus-within:border-indigo-500 transition-all">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600"><Upload className="w-5 h-5" /></Button>
                <textarea 
                  rows={1}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ketik pertanyaan atau unggah media..."
                  className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-2 resize-none"
                />
                <Button onClick={handleSend} size="icon" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 w-10 shadow-lg shadow-indigo-600/20"><Send className="w-4 h-4" /></Button>
              </div>
            </div>
          </div>

          <aside className={cn("bg-slate-50 border-l transition-all duration-300 ease-in-out", showDocs ? "w-80" : "w-0 overflow-hidden border-0")}>
            <div className="p-6">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2"><FileText className="w-3 h-3" /> Sumber Juknis</h2>
              <div className="space-y-3">
                {["Juknis BGN No. 2/2024", "Panduan Sanitasi MBG", "SOP Gizi Kemenkes"].map((doc, di) => (
                  <div key={di} className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all group">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-sm font-bold text-slate-700 truncate pr-2 group-hover:text-indigo-600">{doc}</span>
                      <ExternalLink className="w-3 h-3 text-slate-300" />
                    </div>
                    <Badge variant="outline" className="text-[10px] font-bold py-0 h-5 border-slate-200">Kepatuhan</Badge>
                  </div>
                ))}
              </div>
              <Card className="mt-8 bg-indigo-900 text-white border-0 shadow-xl overflow-hidden relative">
                <div className="absolute top-0 right-0 p-2 opacity-10"><Bot className="w-16 h-16" /></div>
                <CardContent className="p-6 relative z-10">
                  <h3 className="text-sm font-bold mb-2 uppercase tracking-tighter">AI Vision Ready</h3>
                  <p className="text-[11px] text-indigo-100 mb-4 leading-relaxed">Kirim foto masakan atau NIB untuk dianalisa AI secara real-time.</p>
                  <Button size="sm" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold h-8 text-[11px]">UPLOAD MEDIA</Button>
                </CardContent>
              </Card>
            </div>
          </aside>
        </div>
      )}

      {/* MINI POPUP MODE (Simulasi Chat Singkat) */}
      {isOpen && !isMaximized && (
        <div className="fixed bottom-24 right-6 z-[110] w-[360px] h-[520px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] border border-slate-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
          <div className="p-4 bg-indigo-600 text-white flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 animate-pulse" />
              <div className="leading-none">
                <h3 className="text-xs font-bold">Asisten AI Juknis</h3>
                <p className="text-[9px] opacity-80 uppercase tracking-widest font-black">Online</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={() => setIsMaximized(true)} className="h-8 w-8 text-white hover:bg-white/20"><Maximize2 className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8 text-white hover:bg-white/20"><X className="w-4 h-4" /></Button>
            </div>
          </div>
          <ScrollArea className="flex-1 p-4 bg-slate-50/50">
            <div className="space-y-4">
              {messages.map((msg, i) => (
                <div key={i} className={cn("flex gap-2 max-w-[85%]", msg.role === "user" ? "ml-auto flex-row-reverse" : "")}>
                   <div className={cn(
                    "p-3 rounded-2xl text-[13px] leading-relaxed shadow-sm border",
                    msg.role === "assistant" ? "bg-white border-slate-100 text-slate-700" : "bg-indigo-600 text-white border-indigo-700"
                  )}>
                    {msg.content}
                    {msg.attachment && (
                      <div className="mt-2 p-2 bg-black/5 rounded-lg border border-black/5 flex items-center gap-2">
                        {msg.attachment.type === 'image' ? <ImageIcon className="size-3" /> : <FileText className="size-3" />}
                        <span className="text-[10px] font-bold truncate max-w-[100px]">{msg.attachment.name}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          <div className="p-3 border-t bg-white">
            <div className="flex gap-2 bg-slate-100 rounded-xl p-1 px-2 border">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder="Tanya Juknis..."
                className="flex-1 bg-transparent border-0 focus:ring-0 text-xs py-2"
              />
              <Button onClick={handleSend} size="icon" className="bg-indigo-600 h-8 w-8 rounded-lg shrink-0"><Send className="w-3 h-3" /></Button>
            </div>
          </div>
        </div>
      )}

      {/* TRIGGER BUTTON */}
      <div className="fixed bottom-6 right-6 z-[120] group">
        {!isOpen && (
          <div className="absolute -left-32 top-1/2 -translate-y-1/2 bg-slate-900 text-white text-[10px] px-3 py-1.5 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all font-bold tracking-tight">
            Tanya Juknis (AI)
          </div>
        )}
        <button onClick={() => setIsOpen(!isOpen)} className={cn("relative flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all hover:-translate-y-1 active:scale-95 group overflow-hidden", isOpen ? "bg-slate-100 text-slate-500" : "bg-indigo-600 text-white")}>
          {isOpen ? <X className="w-6 h-6" /> : (
            <>
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600 to-violet-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              <Bot className="w-7 h-7 relative z-10" />
              <div className="absolute -top-1 -right-1">
                <span className="flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                </span>
              </div>
            </>
          )}
        </button>
      </div>
    </>
  )
}
