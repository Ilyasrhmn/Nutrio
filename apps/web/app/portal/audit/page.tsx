"use client"

import * as React from "react"
import { 
  Search, 
  Box, 
  Server, 
  CheckCircle2, 
  AlertCircle,
  Calendar,
  Filter,
  RefreshCw,
  ExternalLink,
  ChevronDown
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Input } from "@workspace/ui/components/input"
import { Badge } from "@workspace/ui/components/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@workspace/ui/components/accordion"
import { cn } from "@workspace/ui/lib/utils"

export default function AuditLogPage() {
  const auditData = [
    {
      block: "18294402",
      hash: "0x8a2f...39b1",
      node: "BGN-Node-Alpha",
      time: "1 min ago",
      status: "Verified",
      statusVariant: "success",
      payload: {
        contract_id: "mbg_distribution_v4",
        execution_status: true,
        payload: {
          vendor_id: "VN-8842-X",
          ai_nutrition_score: 98.5,
          compliance_checks: ["gps_matched", "sop_verified"]
        }
      }
    },
    {
      block: "18294398",
      hash: "0x4c1d...a82e",
      node: "BGN-Node-Beta",
      time: "5 min ago",
      status: "Menunggu Review",
      statusVariant: "warning",
      payload: {
        contract_id: "mbg_payment_v1",
        execution_status: "pending",
        payload: {
          vendor_id: "VN-9921-A",
          amount: "Rp 45.000.000",
          reason: "Manual verification required for high-value transaction"
        }
      }
    },
    {
      block: "18294385",
      hash: "0xf9e0...b271",
      node: "BGN-Node-Gamma",
      time: "12 min ago",
      status: "Ditolak",
      statusVariant: "destructive",
      payload: {
        contract_id: "mbg_quality_v2",
        execution_status: false,
        payload: {
          vendor_id: "VN-8832-B",
          error: "AI_SCORE_BELOW_THRESHOLD",
          score: 65.2
        }
      }
    }
  ]

  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold text-foreground">Log Audit Blockchain</h2>
          <p className="text-muted-foreground text-sm">Verifikasi real-time eksekusi smart contract dan validasi AI.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input className="pl-10 h-10 bg-card border-border rounded-lg" placeholder="Cari Hash atau ID Vendor..." />
          </div>
          <Badge variant="outline" className="h-10 px-4 gap-2 bg-emerald-50 text-emerald-600 border-emerald-100 font-bold uppercase tracking-wider">
            <div className="size-2 bg-emerald-500 rounded-full animate-pulse" />
            Mainnet: BGN-Active
          </Badge>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Blok Terakhir</p>
                <h3 className="text-xl font-bold text-foreground">#18,294,402</h3>
              </div>
              <div className="size-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                <Box className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Konsensus Node</p>
                <h3 className="text-xl font-bold text-foreground">24 Node Aktif</h3>
              </div>
              <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <Server className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Transaksi (24J)</p>
                <h3 className="text-xl font-bold text-foreground">12,402</h3>
              </div>
              <div className="size-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                <CheckCircle2 className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border shadow-sm">
          <CardContent className="p-6 border-l-4 border-destructive/20">
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Anomali Ditentukan</p>
                <h3 className="text-xl font-bold text-destructive">3</h3>
              </div>
              <div className="size-10 bg-destructive/10 rounded-xl flex items-center justify-center text-destructive">
                <AlertCircle className="size-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Ledger Section */}
      <Card className="bg-card border-border shadow-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <CardTitle className="text-lg font-bold">Buku Besar Transaksi</CardTitle>
              <Badge variant="outline" className="bg-emerald-50 text-emerald-600 border-emerald-100 flex items-center gap-1.5 h-6">
                <div className="size-1.5 bg-emerald-500 rounded-full animate-ping" />
                Live
              </Badge>
            </div>
            <CardDescription className="text-muted-foreground font-medium">Immutable ledger untuk validasi distribusi MBG.</CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 border-border text-xs font-semibold">
              <Calendar className="size-3.5" />
              Rentang Waktu
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 border-border text-xs font-semibold">
              <Filter className="size-3.5" />
              Filter
            </Button>
            <Button variant="outline" size="sm" className="h-9 size-9 p-0 border-border">
              <RefreshCw className="size-3.5" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Custom Header for the List */}
          <div className="grid grid-cols-5 px-6 py-4 bg-muted/30 border-b border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            <span>Blok</span>
            <span>Hash Transaksi</span>
            <span>Node Validator</span>
            <span>Waktu</span>
            <span className="text-right pr-6">Status</span>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {auditData.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b border-border/50 last:border-0 hover:bg-muted/10 transition-colors">
                <AccordionTrigger className="px-6 py-5 hover:no-underline [&>svg]:ml-4">
                  <div className="grid grid-cols-5 w-full text-left items-center pointer-events-none">
                    <span className="font-bold text-foreground text-sm">#{item.block}</span>
                    <span className="font-mono text-xs text-primary font-semibold">{item.hash}</span>
                    <span className="text-slate-600 text-xs font-medium">{item.node}</span>
                    <span className="text-muted-foreground text-xs">{item.time}</span>
                    <div className="text-right pr-2">
                      <Badge 
                        variant={item.statusVariant as any} 
                        className={cn(
                          "font-bold text-[10px] uppercase px-2 py-0.5 rounded-md",
                          item.statusVariant === 'success' && "bg-emerald-50 text-emerald-600 border-emerald-100",
                          item.statusVariant === 'warning' && "bg-amber-50 text-amber-600 border-amber-100",
                          item.statusVariant === 'destructive' && "bg-destructive/10 text-destructive border-destructive/10"
                        )}
                      >
                        {item.status}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-10 pb-8 pt-2">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Smart Contract Metadata</h4>
                       <Button variant="ghost" size="sm" className="h-7 text-primary gap-1.5 text-xs font-bold px-2 hover:bg-primary/5">
                         Detail Blok <ExternalLink className="size-3" />
                       </Button>
                    </div>
                    <pre className="bg-slate-900 text-emerald-400 font-mono p-5 rounded-xl text-[13px] leading-relaxed shadow-inner overflow-x-auto border-l-4 border-emerald-500">
                      {JSON.stringify(item.payload, null, 2)}
                    </pre>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
      
      <div className="flex items-center justify-between px-2">
        <p className="text-xs text-muted-foreground font-medium italic">
          Total 1,248,391 rekaman audit tersimpan secara permanen di Mainnet.
        </p>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" className="h-8 border-border text-[10px] font-bold">1</Button>
          <Button variant="outline" size="sm" className="h-8 border-border text-[10px] font-bold">2</Button>
          <Button variant="outline" size="sm" className="h-8 border-border text-[10px] font-bold">3</Button>
          <span className="mx-2 text-muted-foreground">...</span>
          <Button variant="outline" size="sm" className="h-8 border-border text-[10px] font-bold">992</Button>
        </div>
      </div>
    </div>
  )
}
