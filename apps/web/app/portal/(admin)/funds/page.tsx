"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import {
  Download,
  TrendingUp,
  Wallet,
  FileText,
  ChevronRight,
  RefreshCw
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Progress } from "@workspace/ui/components/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@workspace/ui/components/table"

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface FundSummary {
  totalAlokasi: number;
  totalTersalurkan: number;
  sisaAnggaran: number;
  realisasiPct: number;
  trendData: { date: string; amount: number }[];
}

interface FundTransaction {
  id: string;
  vendorName: string;
  paidAt: string | null;
  amount: number;
  status: string;
  invoiceNumber: string | null;
}

function formatRupiah(value: number) {
  if (value === 0) return '—';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

const STATUS_LABEL: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  paid:    { label: 'Lunas',   variant: 'default' },
  pending: { label: 'Pending', variant: 'secondary' },
  failed:  { label: 'Gagal',   variant: 'destructive' },
  expired: { label: 'Expired', variant: 'outline' },
  refunded:{ label: 'Refund',  variant: 'outline' },
};

export default function FundTrackingPage() {
  const [summary, setSummary] = React.useState<FundSummary | null>(null);
  const [transactions, setTransactions] = React.useState<FundTransaction[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(() => {
    setLoading(true);
    import("@/lib/api-client").then(({ api }) => {
      Promise.all([
        api.get<FundSummary>('/funds/summary'),
        api.get<FundTransaction[]>('/funds/transactions'),
      ]).then(([s, t]) => {
        setSummary(s);
        setTransactions(t);
      }).catch(() => {}).finally(() => setLoading(false));
    });
  }, []);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  const trendDates = summary?.trendData.map(d => d.date) ?? [];
  const trendAmounts = summary?.trendData.map(d => d.amount) ?? [];

  const chartOptions: any = {
    chart: { type: 'area', toolbar: { show: false }, zoom: { enabled: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3, colors: ['hsl(var(--primary))'] },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05, stops: [20, 100],
        colorStops: [
          { offset: 0, color: 'hsl(var(--primary))', opacity: 0.4 },
          { offset: 100, color: 'hsl(var(--primary))', opacity: 0.05 },
        ],
      },
    },
    grid: { show: false },
    xaxis: {
      categories: trendDates,
      axisBorder: { show: false },
      axisTicks: { show: false },
      labels: { style: { colors: 'hsl(var(--muted-foreground))', fontSize: '12px' } },
    },
    yaxis: { show: false },
    tooltip: {
      theme: 'light',
      x: { show: true },
      y: { formatter: (val: number) => `Rp ${(val / 1_000_000).toFixed(1)}jt` },
    },
    noData: { text: 'Belum ada data pencairan', style: { color: 'hsl(var(--muted-foreground))' } },
  };

  const chartSeries = [{ name: 'Pencairan', data: trendAmounts }];

  return (
    <div className="p-8 space-y-8 bg-background">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground tracking-tight">Transparansi & Pencairan Dana</h2>
          <p className="text-muted-foreground text-sm">Buku besar real-time untuk alokasi anggaran APBN dan pembayaran mitra SPPG.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 h-10 border-border bg-card font-medium" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button className="gap-2 h-10 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 font-bold">
            <Download className="size-4" />
            Unduh Laporan BPK
          </Button>
        </div>
      </div>

      {/* Chart */}
      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg font-bold">Kecepatan Pencairan Dana MBG</CardTitle>
              <CardDescription className="text-muted-foreground font-medium">Tren pengeluaran 30 hari terakhir</CardDescription>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 text-slate-500 rounded-full border border-slate-100">
              <TrendingUp className="size-3.5" />
              <span className="text-xs font-bold">
                {loading ? 'Memuat...' : trendAmounts.length === 0 ? 'Belum ada data' : `${trendAmounts.length} hari terakhir`}
              </span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ReactApexChart options={chartOptions} series={chartSeries} type="area" height={300} />
          </div>
        </CardContent>
      </Card>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Alokasi APBN</p>
              <div className="size-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                <Wallet className="size-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-foreground">
                {loading ? '...' : formatRupiah(summary?.totalAlokasi ?? 0)}
              </h3>
              <p className="text-xs text-muted-foreground font-medium italic">*Anggaran Tahun 2026</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Total Tersalurkan</p>
              <div className="size-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                <TrendingUp className="size-5" />
              </div>
            </div>
            <div className="space-y-3">
              <h3 className="text-2xl font-black text-foreground">
                {loading ? '...' : formatRupiah(summary?.totalTersalurkan ?? 0)}
              </h3>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-muted-foreground">Realisasi Anggaran</span>
                  <span className="text-primary">{loading ? '...' : `${(summary?.realisasiPct ?? 0).toFixed(2)}%`}</span>
                </div>
                <Progress value={summary?.realisasiPct ?? 0} className="h-2 bg-slate-100" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Sisa Anggaran</p>
              <div className="size-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                <RefreshCw className="size-5" />
              </div>
            </div>
            <div className="space-y-1">
              <h3 className="text-2xl font-black text-emerald-600">
                {loading ? '...' : formatRupiah(summary?.sisaAnggaran ?? 0)}
              </h3>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                <div className="size-1.5 bg-slate-300 rounded-full" />
                {loading ? 'Memuat data...' : 'Data real-time dari sistem'}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction Table */}
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
          <div className="space-y-1">
            <CardTitle className="text-lg font-bold tracking-tight">Riwayat Transaksi Terkini</CardTitle>
            <CardDescription className="text-muted-foreground font-medium">Buku besar publik untuk pencairan dana via Smart Contract.</CardDescription>
          </div>
          <Button variant="ghost" className="text-xs font-bold text-primary gap-1">
            Lihat Semua <ChevronRight className="size-3.5" />
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent bg-slate-50/50">
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pl-8">Nama Mitra</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Tanggal & Waktu</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Nominal (Rp)</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest">Status</TableHead>
                <TableHead className="font-bold text-muted-foreground text-[10px] uppercase tracking-widest pr-8 text-right">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <RefreshCw className="size-6 opacity-30 animate-spin" />
                      <p className="text-sm font-medium">Memuat data transaksi...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-16 text-muted-foreground">
                    <div className="flex flex-col items-center gap-3">
                      <Wallet className="size-8 opacity-20" />
                      <p className="text-sm font-medium">Belum ada riwayat pencairan dana</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => {
                  const s = STATUS_LABEL[tx.status] ?? { label: tx.status, variant: 'outline' as const };
                  return (
                    <TableRow key={tx.id}>
                      <TableCell className="pl-8 font-semibold">{tx.vendorName}</TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {tx.paidAt ? new Date(tx.paidAt).toLocaleString('id-ID') : '—'}
                      </TableCell>
                      <TableCell className="font-bold">{formatRupiah(tx.amount)}</TableCell>
                      <TableCell>
                        <Badge variant={s.variant}>{s.label}</Badge>
                      </TableCell>
                      <TableCell className="text-right pr-8">
                        {tx.invoiceNumber ? (
                          <span className="flex items-center justify-end gap-1 text-xs text-primary font-bold">
                            <FileText className="size-3.5" />
                            {tx.invoiceNumber}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
