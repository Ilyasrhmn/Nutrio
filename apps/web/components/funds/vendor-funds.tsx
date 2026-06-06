"use client"

import * as React from "react"
import dynamic from 'next/dynamic'
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Wallet, 
  Plus, 
  Trash2, 
  Edit, 
  Search,
  PieChart,
  Activity,
  Receipt
} from "lucide-react"
import { format } from "date-fns"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@workspace/ui/components/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@workspace/ui/components/dialog"
import { Input } from "@workspace/ui/components/input"
import { Label } from "@workspace/ui/components/label"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@workspace/ui/components/select"
import { cn } from "@workspace/ui/lib/utils"

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

function formatRupiah(value: number) {
  if (value === 0) return 'Rp 0';
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

type Expense = {
  id: string;
  date: string;
  category: string;
  amount: number;
  description: string;
}

const INITIAL_EXPENSES: Expense[] = [
  { id: '1', date: '2026-03-01', category: 'Bahan Baku', amount: 2500000, description: 'Beli Beras & Sayur dari Supplier' },
  { id: '2', date: '2026-03-05', category: 'Gaji Pegawai', amount: 5000000, description: 'Gaji koki dan kurir' },
  { id: '3', date: '2026-03-10', category: 'Operasional', amount: 750000, description: 'Bensin dan perawatan motor' },
]

const TOTAL_INCOME = 45000000; // Example total funds received from APBN

export function VendorFundsDashboard() {
  const [expenses, setExpenses] = React.useState<Expense[]>(INITIAL_EXPENSES);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  
  // Form State
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [date, setDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [description, setDescription] = React.useState('');

  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const remainingBalance = TOTAL_INCOME - totalExpense;

  const handleSave = () => {
    if (!category || !amount || !description) return;

    const newExpense: Expense = {
      id: editingId || Math.random().toString(36).substr(2, 9),
      date,
      category,
      amount: Number(amount),
      description
    };

    if (editingId) {
      setExpenses(expenses.map(e => e.id === editingId ? newExpense : e));
    } else {
      setExpenses([newExpense, ...expenses]);
    }

    closeModal();
  }

  const handleEdit = (expense: Expense) => {
    setEditingId(expense.id);
    setDate(expense.date);
    setCategory(expense.category);
    setAmount(expense.amount.toString());
    setDescription(expense.description);
    setIsModalOpen(true);
  }

  const handleDelete = (id: string) => {
    if(confirm('Hapus pencatatan pengeluaran ini?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  }

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setCategory('');
    setAmount('');
    setDescription('');
  }

  // Chart configuration
  const categories = Array.from(new Set(expenses.map(e => e.category)));
  const categoryTotals = categories.map(cat => 
    expenses.filter(e => e.category === cat).reduce((acc, curr) => acc + curr.amount, 0)
  );

  const chartOptions: any = {
    chart: { type: 'donut', fontFamily: 'inherit' },
    labels: categories.length > 0 ? categories : ['Belum Ada'],
    colors: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'],
    legend: { position: 'bottom' },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            name: { show: true },
            value: {
              show: true,
              formatter: (val: number) => `Rp ${(val/1000000).toFixed(1)}Jt`
            }
          }
        }
      }
    },
    dataLabels: { enabled: false }
  };

  const chartSeries = categoryTotals.length > 0 ? categoryTotals : [1];

  return (
    <div className="min-h-screen bg-slate-50 animate-in fade-in duration-500 pb-12">
      
      {/* VENDOR HERO SECTION */}
      <div className="relative bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 pt-12 pb-32 px-6 lg:px-12 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579621970588-a3f5ce599fac?q=80&w=2000&auto=format&fit=crop')] mix-blend-overlay opacity-10 bg-cover bg-center" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        <div className="relative z-10 max-w-[1400px] mx-auto space-y-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="space-y-3">
              <Badge className="bg-white/10 text-emerald-100 border border-white/20 hover:bg-white/20 font-bold uppercase tracking-widest text-[10px] px-3 py-1 rounded-full">
                Vendor Dashboard
              </Badge>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Kelola Dana SPPG
              </h1>
              <p className="text-emerald-100/80 font-medium text-sm max-w-2xl">
                Pantau dana masuk dari pemerintah dan catat pengeluaran operasional Anda untuk menjaga transparansi dan efisiensi bisnis.
              </p>
            </div>
            
            <div className="flex gap-3">
              <Dialog open={isModalOpen} onOpenChange={(open) => {
                if(!open) closeModal();
                else setIsModalOpen(true);
              }}>
                <DialogTrigger asChild>
                  <Button className="h-12 px-6 bg-white text-emerald-900 hover:bg-emerald-50 shadow-lg shadow-black/10 font-bold rounded-2xl gap-2 transition-transform active:scale-95">
                    <Plus className="size-5" />
                    Tambah Pengeluaran
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px] rounded-[24px]">
                  <DialogHeader>
                    <DialogTitle>{editingId ? 'Edit Pengeluaran' : 'Catat Pengeluaran Baru'}</DialogTitle>
                    <DialogDescription>
                      Masukkan rincian pengeluaran operasional Anda di bawah ini.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                      <Label>Tanggal</Label>
                      <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Kategori</Label>
                      <Select value={category} onValueChange={setCategory}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Pilih Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Bahan Baku">Bahan Baku & Logistik</SelectItem>
                          <SelectItem value="Gaji Pegawai">Gaji Pegawai / Koki</SelectItem>
                          <SelectItem value="Operasional">Operasional & Transportasi</SelectItem>
                          <SelectItem value="Pajak & Retribusi">Pajak & Retribusi</SelectItem>
                          <SelectItem value="Lainnya">Lainnya</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Nominal (Rp)</Label>
                      <Input type="number" placeholder="Contoh: 150000" value={amount} onChange={e => setAmount(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label>Keterangan</Label>
                      <Input placeholder="Contoh: Beli sayuran di pasar" value={description} onChange={e => setDescription(e.target.value)} className="rounded-xl" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={closeModal} className="rounded-xl">Batal</Button>
                    <Button onClick={handleSave} className="rounded-xl bg-teal-600 hover:bg-teal-700">Simpan Catatan</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="relative z-20 max-w-[1400px] mx-auto px-6 lg:px-12 -mt-20 space-y-8">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group bg-white">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <ArrowDownCircle className="size-32" />
            </div>
            <CardContent className="p-6 md:p-8 md:p-8 relative">
              <div className="flex items-start justify-between mb-4">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Dana Masuk</p>
                 <div className="size-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 shadow-inner">
                   <ArrowDownCircle className="size-6" />
                 </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{formatRupiah(TOTAL_INCOME)}</h3>
                <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mt-2">
                  <Activity className="size-3.5 text-emerald-500" /> Dari Pencairan BGN
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group bg-white">
             <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <ArrowUpCircle className="size-32" />
            </div>
            <CardContent className="p-6 md:p-8 md:p-8 relative">
              <div className="flex items-start justify-between mb-4">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Total Pengeluaran</p>
                 <div className="size-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 shadow-inner">
                   <ArrowUpCircle className="size-6" />
                 </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl lg:text-4xl font-black text-slate-900 tracking-tighter">{formatRupiah(totalExpense)}</h3>
                <p className="text-[11px] text-slate-400 font-bold flex items-center gap-1.5 mt-2">
                  <Receipt className="size-3.5 text-red-500" /> Penggunaan Operasional
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="relative rounded-[24px] border-none shadow-xl shadow-slate-200/50 hover:-translate-y-1 transition-transform duration-300 overflow-hidden group bg-white">
            <div className="absolute top-0 right-0 p-6 opacity-[0.02] group-hover:scale-110 transition-transform duration-500 pointer-events-none">
              <Wallet className="size-32" />
            </div>
            <CardContent className="p-6 md:p-8 md:p-8 relative">
              <div className="flex items-start justify-between mb-4">
                 <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Sisa Saldo Kas</p>
                 <div className="size-12 bg-teal-50 rounded-2xl flex items-center justify-center text-teal-600 shadow-inner">
                   <Wallet className="size-6" />
                 </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-3xl lg:text-4xl font-black text-teal-600 tracking-tighter">{formatRupiah(remainingBalance)}</h3>
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 mt-2 bg-slate-50 w-fit px-2.5 py-1 rounded-md">
                  <div className={cn("size-1.5 rounded-full animate-pulse", remainingBalance > 0 ? "bg-emerald-500" : "bg-red-500")} />
                  {remainingBalance > 0 ? 'Saldo Aman' : 'Defisit Anggaran'}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Expenses Chart */}
          <Card className="rounded-[24px] border border-slate-200/60 bg-white shadow-sm overflow-hidden">
            <CardHeader className="pb-2 p-6 md:p-8 border-b border-slate-100">
              <div className="space-y-1">
                <CardTitle className="flex items-center gap-2 text-lg font-bold">
                  <PieChart className="size-5 text-teal-600" />
                  Alokasi Pengeluaran
                </CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Berdasarkan kategori pengeluaran Anda.</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="p-6 md:p-8 flex items-center justify-center min-h-[300px]">
              {expenses.length > 0 ? (
                <div className="w-full">
                  <ReactApexChart 
                    options={chartOptions} 
                    series={chartSeries} 
                    type="donut" 
                    height={300} 
                  />
                </div>
              ) : (
                <div className="text-center space-y-2">
                  <PieChart className="size-12 text-slate-200 mx-auto" />
                  <p className="text-sm font-bold text-slate-400">Belum ada pengeluaran.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Table Expenses */}
          <Card className="lg:col-span-2 rounded-[24px] border border-slate-200/60 shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between p-6 md:px-8 border-b border-slate-100">
              <div className="space-y-1">
                <CardTitle className="text-lg font-bold">Riwayat Pengeluaran</CardTitle>
                <CardDescription className="text-xs font-medium text-slate-500">Detail catatan operasional SPPG Anda.</CardDescription>
              </div>
              <div className="relative">
                <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input placeholder="Cari..." className="pl-9 w-48 rounded-xl h-9 text-xs bg-slate-50 border-none" />
              </div>
            </CardHeader>
            <div className="p-2">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-none">
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pl-6 h-12">Tanggal</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12">Kategori</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12">Keterangan</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest h-12">Nominal</TableHead>
                    <TableHead className="font-bold text-slate-400 text-[10px] uppercase tracking-widest pr-6 h-12 text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-32 text-center text-slate-500 font-medium">
                        Belum ada data pengeluaran dicatat.
                      </TableCell>
                    </TableRow>
                  ) : expenses.map((item, i) => (
                    <TableRow key={item.id} className="border-slate-100 hover:bg-slate-50 transition-colors">
                      <TableCell className="pl-6 py-4">
                        <span className="font-bold text-slate-700 text-xs">{format(new Date(item.date), 'dd MMM yyyy')}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <Badge variant="outline" className="font-bold uppercase text-[9px] px-2 py-0.5 tracking-widest text-teal-600 border-teal-200 bg-teal-50">
                          {item.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-medium text-slate-600 text-xs">{item.description}</span>
                      </TableCell>
                      <TableCell className="py-4">
                        <span className="font-black text-slate-900 text-sm">{formatRupiah(item.amount)}</span>
                      </TableCell>
                      <TableCell className="pr-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => handleEdit(item)} className="size-8 rounded-full text-blue-500 hover:text-blue-600 hover:bg-blue-50">
                            <Edit className="size-4" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)} className="size-8 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50">
                            <Trash2 className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

      </div>
    </div>
  )
}
