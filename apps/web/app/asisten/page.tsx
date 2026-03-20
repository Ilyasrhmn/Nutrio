"use client"

import React, { useState } from "react"
import { 
  Bot, 
  FileText, 
  Upload, 
  Send, 
  ShieldAlert, 
  ClipboardCheck, 
  MessageSquare,
  Search,
  ExternalLink,
  Info
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/components/tabs"

// Mock Data Juknis
const juknisDocs = [
  { id: 1, title: "Juknis BGN No. 2/2024", category: "Legalitas", status: "Active" },
  { id: 2, title: "Panduan Sanitasi MBG", category: "Operasional", status: "Active" },
  { id: 3, title: "SOP Gizi Kemenkes", category: "Nutrisi", status: "Active" },
  { id: 4, title: "Matriks Penalti Fraud", category: "Kepatuhan", status: "Internal" },
]

export default function GlobalAIAssistantPage() {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Halo! Saya Asisten MBG. Saya memegang seluruh data Juknis & SOP resmi. Silakan tanya apa saja, atau unggah foto porsi makan/dokumen untuk saya analisa kepatuhannya.",
      sources: []
    }
  ])
  const [inputValue, setInputValue] = useState("")

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    setMessages([...messages, { role: "user", content: inputValue, sources: [] }])
    setInputValue("")
    
    // Simulate AI Response
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Berdasarkan Juknis BGN No. 2/2024 hal 14, pendaftaran vendor memerlukan NIB aktif dan Sertifikat SLHS. Untuk porsi makan, minimal protein adalah 15g per sajian.",
        sources: ["Juknis BGN Hal. 14", "Panduan Nutrisi Bab 3"]
      }])
    }, 1500)
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar - Sumber Data AI */}
      <aside className="w-80 border-r bg-white hidden md:flex flex-col shadow-sm">
        <div className="p-6 border-b bg-slate-900 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Bot className="w-6 h-6 text-blue-400" />
            <h1 className="font-bold text-lg tracking-tight">ASISTEN MBG</h1>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            Satu Otak AI untuk Juknis, SOP, & Analisis Fraud Nasional.
          </p>
        </div>
        
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-6">
            <div>
              <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Sumber Data AI
              </h2>
              <div className="space-y-2">
                {juknisDocs.map(doc => (
                  <div key={doc.id} className="p-3 border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors group">
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-sm font-medium text-slate-700 truncate pr-2">{doc.title}</span>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-blue-500" />
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline" className="text-[10px] py-0">{doc.category}</Badge>
                      <Badge variant="secondary" className="text-[10px] py-0 bg-green-50 text-green-700 border-green-100">Ready</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="bg-blue-50 border-blue-100">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">Analisis Vision</h3>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      Unggah foto untuk deteksi porsi otomatis atau verifikasi NIB/Sertifikat.
                    </p>
                    <Button variant="outline" size="sm" className="mt-3 w-full bg-white border-blue-200 text-blue-600 hover:bg-blue-100">
                      <Upload className="w-3 h-3 mr-2" /> Mulai Analisa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </ScrollArea>
        
        <div className="p-4 border-t bg-slate-50">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            AI Engine: RAG-MBG-V1.0 (Online)
          </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative bg-white">
        {/* Header (Mobile-ish) */}
        <header className="p-4 border-b flex items-center justify-between md:hidden">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            <span className="font-bold">Asisten MBG</span>
          </div>
          <Button variant="ghost" size="icon"><Search className="w-5 h-5" /></Button>
        </header>

        {/* Chat Content */}
        <ScrollArea className="flex-1 p-6 lg:p-12">
          <div className="max-w-3xl mx-auto space-y-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant" ? "bg-blue-600 text-white" : "bg-slate-200 text-slate-600"
                  }`}>
                    {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div className="space-y-3">
                    <div className={`p-4 rounded-2xl shadow-sm border ${
                      msg.role === "assistant" ? "bg-white border-slate-200" : "bg-blue-600 text-white border-blue-600"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((src, sIdx) => (
                          <Badge key={sIdx} variant="outline" className="text-[10px] flex items-center gap-1 cursor-pointer hover:bg-slate-50">
                            <ClipboardCheck className="w-3 h-3 text-green-600" /> Sumber: {src}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t bg-white">
          <div className="max-w-3xl mx-auto flex items-end gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200 shadow-sm focus-within:border-blue-500 transition-all">
            <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 hover:text-blue-600">
              <Upload className="w-5 h-5" />
            </Button>
            <textarea 
              rows={1}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Tanyakan juknis, porsi, atau analisa dokumen..."
              className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-2 resize-none max-h-32"
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="shrink-0 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-10 w-10"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          <div className="max-w-3xl mx-auto mt-2 flex justify-center gap-4">
            <p className="text-[10px] text-slate-400">
              AI dapat melakukan kesalahan. Selalu verifikasi data di Juknis Resmi.
            </p>
          </div>
        </div>
      </main>

      {/* Floating Alerts Area (Right Sidebar - Contextual) */}
      <aside className="w-72 border-l bg-white hidden xl:flex flex-col">
        <div className="p-6 border-b">
          <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Analisa Real-time</h2>
          <p className="text-[10px] text-slate-400 italic">Deteksi anomali di halaman aktif</p>
        </div>
        <ScrollArea className="flex-1 p-4 space-y-4">
          <div className="p-4 bg-orange-50 border border-orange-100 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-orange-700 font-semibold text-xs">
              <ShieldAlert className="w-4 h-4" /> Peringatan Kepatuhan
            </div>
            <p className="text-[11px] text-orange-600 leading-relaxed">
              Kamu sedang di halaman Registrasi. Pastikan NIB berformat RBA (Risk Based Approach) agar lolos validasi otomatis.
            </p>
          </div>

          <div className="p-4 bg-green-50 border border-green-100 rounded-xl space-y-2">
            <div className="flex items-center gap-2 text-green-700 font-semibold text-xs">
              <ClipboardCheck className="w-4 h-4" /> Tips Juknis
            </div>
            <p className="text-[11px] text-green-600 leading-relaxed">
              Standard porsi protein hewani untuk siswa SD adalah minimal 40g per paket. Cek panduan Gizi Hal 12.
            </p>
          </div>
        </ScrollArea>
      </aside>
    </div>
  )
}
