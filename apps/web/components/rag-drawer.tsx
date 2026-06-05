"use client"

import * as React from "react"
import { api } from "@/lib/api-client"
import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { MessageSquare, Send, X, Loader2, BookOpen } from "lucide-react"
import { cn } from "@workspace/ui/lib/utils"

interface Message {
  role: "user" | "assistant"
  text: string
  sources?: string[]
}

export function RAGDrawer() {
  const [open, setOpen] = React.useState(false)
  const [messages, setMessages] = React.useState<Message[]>([
    {
      role: "assistant",
      text: "Halo! Saya asisten BGN. Tanya saya tentang regulasi MBG, SOP dapur, prosedur pengiriman, atau kriteria penilaian vendor.",
      sources: [],
    },
  ])
  const [input, setInput] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const bottomRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const send = async () => {
    const question = input.trim()
    if (!question || loading) return

    setInput("")
    setMessages(prev => [...prev, { role: "user", text: question }])
    setLoading(true)

    try {
      const res = await api.post<{ answer: string; sources: string[] }>("/rag/query", { question })
      setMessages(prev => [...prev, {
        role: "assistant",
        text: res.answer,
        sources: res.sources,
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        text: "Maaf, terjadi kesalahan. Coba lagi.",
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send() }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-40 size-12 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:scale-105 transition-all flex items-center justify-center",
          open && "hidden"
        )}
        title="Asisten Juknis BGN"
      >
        <MessageSquare className="size-5" />
      </button>

      {/* Drawer */}
      {open && (
        <div className="fixed bottom-0 right-0 z-50 w-full sm:w-96 sm:bottom-6 sm:right-6 sm:rounded-3xl overflow-hidden shadow-2xl border border-border bg-white flex flex-col"
          style={{ maxHeight: "min(600px, 90dvh)" }}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-primary text-primary-foreground shrink-0">
            <div className="p-1.5 bg-white/20 rounded-xl">
              <BookOpen className="size-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm leading-tight">Asisten Juknis BGN</p>
              <p className="text-[10px] opacity-70">Tanya seputar regulasi & SOP MBG</p>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/20 rounded-lg transition-colors">
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0">
            {messages.map((m, i) => (
              <div key={i} className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn("max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-sm"
                    : "bg-slate-100 text-slate-800 rounded-bl-sm"
                )}>
                  <p>{m.text}</p>
                  {m.sources && m.sources.length > 0 && (
                    <div className="mt-2 space-y-0.5">
                      {m.sources.map((s, j) => (
                        <p key={j} className="text-[10px] opacity-60 font-medium">📄 {s}</p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <Loader2 className="size-4 animate-spin text-slate-400" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t shrink-0 flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Tanya tentang SOP, regulasi, penalti..."
              className="flex-1 h-10 text-sm rounded-xl"
              disabled={loading}
            />
            <Button size="icon" className="size-10 rounded-xl shrink-0" onClick={send} disabled={loading || !input.trim()}>
              <Send className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
