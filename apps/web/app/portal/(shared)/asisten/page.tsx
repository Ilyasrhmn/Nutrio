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
  Info,
  ChevronRight,
  PanelRightClose,
  PanelRightOpen
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { ScrollArea } from "@workspace/ui/components/scroll-area"
import { cn } from "@workspace/ui/lib/utils"

// Mock Data Juknis
const juknisDocs = [
  { id: 1, title: "Juknis BGN No. 2/2024", category: "Legalitas" },
  { id: 2, title: "Panduan Sanitasi MBG", category: "Operasional" },
  { id: 3, title: "SOP Gizi Kemenkes", category: "Nutrisi" },
]

export default function PortalAIAssistantPage() {
  const [messages, setMessages] = useState([
    { 
      role: "assistant", 
      content: "Halo! Saya Asisten MBG. Saya memegang seluruh data Juknis & SOP resmi. Silakan tanya apa saja, atau unggah foto porsi makan/dokumen untuk saya analisa kepatuhannya.",
      sources: [] as string[]
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const [showDocs, setShowDocs] = useState(true)

  const handleSendMessage = () => {
    if (!inputValue.trim()) return
    setMessages([...messages, { role: "user", content: inputValue, sources: [] as string[] }])
    setInputValue("")
    
    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Berdasarkan Juknis BGN No. 2/2024 hal 14, pendaftaran vendor memerlukan NIB aktif dan Sertifikat SLHS. Untuk porsi makan, minimal protein adalah 15g per sajian.",
        sources: ["Juknis BGN Hal. 14", "Panduan Nutrisi Bab 3"]
      }])
    }, 1500)
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white overflow-hidden">
      {/* Main Chat Area - Terintegrasi dengan Portal Layout */}
      <main className="flex-1 flex flex-col relative bg-white border-r">
        <header className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 leading-none">Asisten AI Juknis</h1>
              <p className="text-[10px] text-slate-400 mt-1 uppercase font-bold tracking-widest">Global MBG Knowledge Base</p>
            </div>
          </div>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowDocs(!showDocs)}
            className="text-slate-500 hover:text-indigo-600"
          >
            {showDocs ? <PanelRightClose className="w-5 h-5" /> : <PanelRightOpen className="w-5 h-5" />}
          </Button>
        </header>

        {/* Chat Content */}
        <ScrollArea className="flex-1 p-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`flex gap-4 max-w-[85%] ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-sm ${
                    msg.role === "assistant" ? "bg-indigo-600 text-white border-indigo-700" : "bg-white text-slate-600 border-slate-200"
                  }`}>
                    {msg.role === "assistant" ? <Bot className="w-5 h-5" /> : <MessageSquare className="w-4 h-4" />}
                  </div>
                  <div className="space-y-3">
                    <div className={`p-4 rounded-2xl shadow-sm border ${
                      msg.role === "assistant" ? "bg-indigo-50/30 border-indigo-100 text-slate-800" : "bg-white border-slate-200 text-slate-700"
                    }`}>
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {msg.sources.map((src, sIdx) => (
                          <Badge key={sIdx} variant="secondary" className="text-[10px] flex items-center gap-1 cursor-pointer bg-indigo-50 text-indigo-700 border-indigo-100 hover:bg-indigo-100 transition-colors">
                            <ClipboardCheck className="w-3 h-3" /> Sumber: {src}
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
        <div className="p-6 border-t bg-white">
          <div className="max-w-4xl mx-auto flex items-end gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all">
            <Button variant="ghost" size="icon" className="shrink-0 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-xl h-10 w-10">
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
              className="flex-1 bg-transparent border-0 focus:ring-0 text-sm py-2 resize-none max-h-32 placeholder:text-slate-400"
            />
            <Button 
              size="icon" 
              onClick={handleSendMessage}
              disabled={!inputValue.trim()}
              className="shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 w-10 shadow-lg shadow-indigo-600/20"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </main>

      {/* Docs Side Panel - Collapsible */}
      <aside className={cn(
        "bg-slate-50 border-l transition-all duration-300 ease-in-out",
        showDocs ? "w-80" : "w-0 overflow-hidden border-0"
      )}>
        <div className="p-6">
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
            <FileText className="w-3 h-3" /> Sumber Juknis
          </h2>
          <div className="space-y-3">
            {juknisDocs.map(doc => (
              <div key={doc.id} className="p-4 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-200 cursor-pointer transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-bold text-slate-700 truncate pr-2 group-hover:text-indigo-600 transition-colors">{doc.title}</span>
                  <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-500" />
                </div>
                <Badge variant="outline" className="text-[10px] font-bold py-0 h-5 border-slate-200">{doc.category}</Badge>
              </div>
            ))}
          </div>

          <Card className="mt-8 bg-indigo-900 text-white border-0 shadow-xl overflow-hidden relative">
             <div className="absolute top-0 right-0 p-2 opacity-10">
              <Bot className="w-16 h-16" />
            </div>
            <CardContent className="p-6 relative z-10">
              <h3 className="text-sm font-bold mb-2">Analisa Vision</h3>
              <p className="text-[11px] text-indigo-100 leading-relaxed mb-4">
                Sistem AI dapat menganalisa foto porsi makan atau dokumen sertifikat secara otomatis.
              </p>
              <Button size="sm" className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-bold border-0 h-8 text-[11px]">
                Mulai Upload
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>
    </div>
  )
}
