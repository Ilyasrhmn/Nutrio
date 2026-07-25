"use client"

import * as React from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import {
  MapPin,
  MessageSquare,
  Star,
  Store,
  ShieldCheck,
  ChevronRight,
  Info,
  CheckCircle2,
  Package,
  Plus,
  X,
  Trash2,
  ShoppingCart,
  Check,
  FileText,
  FileBadge,
  Truck,
  BadgeCheck,
  Minus,
  ThumbsUp,
  Home,
  Phone,
  Mail,
  Globe,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Card, CardContent } from "@workspace/ui/components/card"
import { Badge } from "@workspace/ui/components/badge"
import { Avatar, AvatarFallback } from "@workspace/ui/components/avatar"
import { Separator } from "@workspace/ui/components/separator"
import { Alert, AlertDescription } from "@workspace/ui/components/alert"
import { cn } from "@workspace/ui/lib/utils"
import { QueryState, QueryStatus } from "@workspace/ui/components/query-state"
import { suppliersService, SupplierDetail, SupplierProduct } from "@/lib/services/suppliers.service"
import { ordersService } from "@/lib/services/orders.service"
import { toQueryError } from "@/lib/services/error-handler"
import { useToast } from "@workspace/ui/hooks/use-toast"

export default function SupplierMarketplacePage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const supplierId = params?.supplierId as string
  const [submittingPo, setSubmittingPo] = React.useState(false)

  const [supplier, setSupplier] = React.useState<SupplierDetail | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [loadError, setLoadError] = React.useState<{ status: QueryStatus; errorMessage: string; isNetworkError: boolean } | null>(null)
  const [cart, setCart] = React.useState<(SupplierProduct & { qty: number })[]>([])
  const [addedItems, setAddedItems] = React.useState<string[]>([])
  const [activeTab, setActiveTab] = React.useState<'katalog' | 'ulasan' | 'legalitas'>('katalog')
  const [showCart, setShowCart] = React.useState(false)

  const load = React.useCallback(async () => {
    if (!supplierId) return
    try {
      setLoading(true)
      setLoadError(null)
      const data = await suppliersService.getDetail(supplierId)
      setSupplier(data)
    } catch (error) {
      setLoadError(toQueryError(error))
    } finally {
      setLoading(false)
    }
  }, [supplierId])

  React.useEffect(() => {
    load()
  }, [load])

  const addToCart = (product: SupplierProduct) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id)
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item)
      }
      return [...prev, { ...product, qty: 1 }]
    })
    setAddedItems(prev => [...prev, product.id])
    setTimeout(() => {
      setAddedItems(prev => prev.filter(id => id !== product.id))
    }, 1500)
  }

  const removeFromCart = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id))
  }

  const totalEstimasi = cart.reduce((acc, item) => acc + ((item.pricePerUnit ?? 0) * item.qty), 0)
  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0)

  const handleSubmitPo = async () => {
    if (!supplier || cart.length === 0) return
    setSubmittingPo(true)
    try {
      const res = await ordersService.create({
        supplierId: supplier.id,
        items: cart.map((item) => ({ productId: item.id, quantity: item.qty })),
      })
      toast({
        title: "Purchase Order Dibuat",
        description: `${res.body.poNumber} telah dikirim ke supplier untuk konfirmasi.`,
      })
      setCart([])
      setShowCart(false)
      router.push(`/portal/orders/${res.body.id}`)
    } catch (error) {
      const { errorMessage } = toQueryError(error)
      toast({ title: "Gagal Membuat PO", description: errorMessage, variant: "destructive" })
    } finally {
      setSubmittingPo(false)
    }
  }

  return (
    <QueryState
      status={loadError ? loadError.status : loading ? "loading" : !supplier ? "empty" : "success"}
      errorMessage={loadError?.errorMessage}
      isNetworkError={loadError?.isNetworkError}
      onRetry={load}
      emptyTitle="Supplier tidak ditemukan"
      emptyMessage="Supplier ini mungkin sudah tidak terdaftar."
    >
      {supplier && (
        <div className="min-h-screen bg-[#F0F3F7]">
          {/* TOP BAR */}
          <div className="sticky top-0 z-40 bg-white border-b border-slate-200/80 shadow-sm">
            <div className="max-w-[1280px] mx-auto px-4 lg:px-6 h-12 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs">
                <Link href="/portal" className="text-slate-400 hover:text-primary transition-colors">
                  <Home className="size-3.5" />
                </Link>
                <ChevronRight className="size-3 text-slate-300" />
                <Link href="/portal/marketplace" className="text-slate-400 hover:text-primary transition-colors font-medium">
                  Marketplace
                </Link>
                <ChevronRight className="size-3 text-slate-300" />
                <span className="text-slate-700 font-semibold truncate max-w-[200px]">{supplier.businessName}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowCart(!showCart)}
                className="relative h-8 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-primary gap-1.5"
              >
                <ShoppingCart className="size-4" />
                <span className="hidden sm:inline">Keranjang</span>
                {cart.length > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[8px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1">
                    {totalItems}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* STORE HEADER */}
          <div className="bg-white border-b border-slate-200/60">
            <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-5">
              <div className="flex items-start gap-4">
                <div className="relative shrink-0">
                  <div className="size-16 md:size-20 rounded-xl bg-gradient-to-br from-teal-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-teal-500/20 text-white text-xl font-black">
                    {supplier.businessName.slice(0, 2).toUpperCase()}
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h1 className="text-base md:text-lg font-bold text-slate-900 truncate">{supplier.businessName}</h1>
                    <Badge className="bg-primary/10 text-primary border-none font-bold text-[9px] px-1.5 h-4 gap-0.5">
                      <BadgeCheck className="size-2.5" />
                      Terverifikasi
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                    <div className="flex items-center gap-1">
                      <Star className="size-3 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-slate-800">{supplier.avgRating?.toFixed(1) ?? "-"}</span>
                      <span className="text-[10px] text-slate-400">({supplier.totalReviews} ulasan)</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <Package className="size-3 text-slate-400" />
                      <span><b className="text-slate-700">{supplier.products.length}</b> Produk</span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-slate-500">
                      <MapPin className="size-3 text-primary" />
                      <span>{supplier.addressCity}, {supplier.addressProvince}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {supplier.hasHalalCert && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-semibold px-1.5 h-5 gap-0.5">
                        <CheckCircle2 className="size-2.5" /> Halal
                      </Badge>
                    )}
                    {supplier.hasBpomCert && (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-100 text-[9px] font-semibold px-1.5 h-5 gap-0.5">
                        <CheckCircle2 className="size-2.5" /> BPOM
                      </Badge>
                    )}
                    {supplier.onTimeRate != null && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100 text-[9px] font-semibold px-1.5 h-5 gap-0.5">
                        <Truck className="size-2.5" /> Pengiriman {Math.round(supplier.onTimeRate)}%
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2 shrink-0">
                  <Button
                    disabled
                    title="Fitur chat supplier belum tersedia"
                    size="sm"
                    className="h-9 rounded-lg font-semibold text-xs gap-1.5 shadow-sm"
                  >
                    <MessageSquare className="size-3.5" />
                    Chat Supplier
                  </Button>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-0 border-t border-slate-100 -mb-px mt-4">
                {[
                  { key: 'katalog' as const, label: 'Produk', count: supplier.products.length },
                  { key: 'ulasan' as const, label: 'Ulasan', count: supplier.totalReviews },
                  { key: 'legalitas' as const, label: 'Legalitas', count: null },
                ].map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      "px-5 py-3 text-xs font-semibold border-b-2 transition-all duration-200",
                      activeTab === tab.key
                        ? "border-primary text-primary"
                        : "border-transparent text-slate-500 hover:text-slate-700"
                    )}
                  >
                    {tab.label}
                    {tab.count !== null && (
                      <span className={cn("ml-1 text-[10px]", activeTab === tab.key ? "text-primary/70" : "text-slate-400")}>
                        ({tab.count})
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* MAIN CONTENT */}
          <div className="max-w-[1280px] mx-auto px-4 lg:px-6 py-5">
            {activeTab === 'katalog' && (
              <div className="animate-in fade-in duration-300">
                {supplier.products.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-sm">Supplier ini belum menambahkan produk.</div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
                    {supplier.products.map((product, index) => (
                      <Card
                        key={product.id}
                        className="group overflow-hidden border-slate-200/60 bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 rounded-xl animate-in fade-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 60}ms`, animationFillMode: 'both' }}
                      >
                        <div className="aspect-square w-full overflow-hidden relative bg-slate-100 flex items-center justify-center">
                          {product.photoUrl ? (
                            <img src={product.photoUrl} alt={product.name} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500" />
                          ) : (
                            <Package className="size-8 text-slate-300" />
                          )}
                        </div>
                        <div className="p-2.5">
                          <h4 className="text-[11px] sm:text-xs font-medium text-slate-700 line-clamp-2 leading-snug min-h-[2rem] group-hover:text-primary transition-colors">
                            {product.name}
                          </h4>
                          <div className="mt-1.5">
                            <span className="text-sm font-extrabold text-red-600">
                              {product.pricePerUnit != null ? `Rp ${product.pricePerUnit.toLocaleString('id-ID')}` : "Hubungi supplier"}
                            </span>
                            <span className="text-[9px] text-slate-400 ml-0.5">/{product.unit}</span>
                          </div>
                          {product.minOrderQty != null && (
                            <p className="text-[9px] text-slate-400 mt-0.5">Min. {product.minOrderQty} {product.unit}</p>
                          )}
                          <div className="flex items-center gap-1 mt-2 pt-1.5 border-t border-slate-100">
                            <Star className="size-2.5 text-amber-500 fill-amber-500" />
                            <span className="text-[10px] font-semibold text-slate-600">{product.avgRating?.toFixed(1) ?? "-"}</span>
                            <span className="text-[10px] text-slate-300">|</span>
                            <span className="text-[10px] text-slate-400">{product.totalOrders} order</span>
                          </div>
                          <Button
                            onClick={() => addToCart(product)}
                            size="sm"
                            className={cn(
                              "w-full mt-2 rounded-lg font-semibold text-[10px] h-7 gap-1 transition-all",
                              addedItems.includes(product.id)
                                ? "bg-emerald-500 hover:bg-emerald-600 text-white"
                                : "bg-primary/10 text-primary hover:bg-primary hover:text-white border-none shadow-none"
                            )}
                          >
                            {addedItems.includes(product.id) ? (
                              <><Check className="size-3" /> Ditambahkan</>
                            ) : (
                              <><Plus className="size-3" /> Keranjang</>
                            )}
                          </Button>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'ulasan' && (
              <div className="animate-in fade-in duration-300">
                {supplier.reviews.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-sm">Belum ada ulasan untuk supplier ini.</div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                    <div className="lg:col-span-4">
                      <Card className="bg-white border-slate-200/60 rounded-xl shadow-sm sticky top-16">
                        <CardContent className="p-5">
                          <h3 className="text-sm font-bold text-slate-800 mb-4">Penilaian Vendor</h3>
                          <div className="text-center">
                            <div className="text-4xl font-extrabold text-slate-900">{supplier.avgRating?.toFixed(1) ?? "-"}</div>
                            <p className="text-[10px] text-slate-400 mt-1">{supplier.totalReviews} ulasan</p>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    <div className="lg:col-span-8 space-y-3">
                      {supplier.reviews.map((review) => (
                        <Card key={review.id} className="bg-white border-slate-200/60 rounded-xl shadow-sm">
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Avatar className="size-8 shrink-0">
                                <AvatarFallback className="text-[8px] font-bold bg-slate-100 text-slate-600">
                                  {review.vendorName.slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs font-semibold text-slate-800">{review.vendorName}</p>
                                  <span className="text-[10px] text-slate-400">
                                    {new Date(review.createdAt).toLocaleDateString('id-ID')}
                                  </span>
                                </div>
                                <div className="flex items-center gap-0.5 mt-0.5">
                                  {[1, 2, 3, 4, 5].map(i => (
                                    <Star key={i} className={cn("size-2.5", i <= review.ratingOverall ? "text-amber-500 fill-amber-500" : "text-slate-200")} />
                                  ))}
                                </div>
                                {review.reviewText && (
                                  <p className="text-[11px] text-slate-600 leading-relaxed mt-2">{review.reviewText}</p>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'legalitas' && (
              <div className="animate-in fade-in duration-300 max-w-4xl">
                {supplier.documents.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 text-sm">Belum ada dokumen legalitas yang diunggah.</div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {supplier.documents.map((doc) => (
                      <Card key={doc.id} className="bg-white border-slate-200/60 rounded-xl shadow-sm overflow-hidden">
                        <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500" />
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="size-9 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white shadow-sm shrink-0">
                              <FileBadge className="size-4" />
                            </div>
                            <div>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{doc.docType}</p>
                              <p className="text-xs font-bold text-slate-900 mt-0.5">{doc.docNumber ?? '-'}</p>
                              <Badge className="mt-1.5 bg-emerald-50 text-emerald-600 border-none font-semibold text-[8px] px-1.5 h-4 gap-0.5">
                                <CheckCircle2 className="size-2" />
                                {doc.status.toUpperCase()}
                              </Badge>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}

                <Alert className="bg-blue-50 border-blue-100/50 rounded-xl mt-4">
                  <Info className="size-3.5 text-blue-500" />
                  <AlertDescription className="text-blue-700 text-[11px] font-medium">
                    Dokumen ditampilkan setelah diverifikasi oleh tim BGN.
                    {supplier.verifiedAt && ` Terverifikasi pada ${new Date(supplier.verifiedAt).toLocaleDateString('id-ID')}.`}
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
                  {supplier.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Phone className="size-3.5 text-slate-400" /> {supplier.phone}
                    </div>
                  )}
                  {supplier.email && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Mail className="size-3.5 text-slate-400" /> {supplier.email}
                    </div>
                  )}
                  {supplier.website && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Globe className="size-3.5 text-slate-400" /> {supplier.website}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SLIDING CART PANEL */}
          {showCart && (
            <>
              <div className="fixed inset-0 bg-black/30 z-40 animate-in fade-in duration-200" onClick={() => setShowCart(false)} />
              <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <ShoppingCart className="size-4 text-primary" />
                    <h3 className="text-sm font-bold text-slate-900">Keranjang Pengadaan</h3>
                    {cart.length > 0 && (
                      <Badge className="bg-primary/10 text-primary border-none text-[10px] font-bold">{totalItems} item</Badge>
                    )}
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setShowCart(false)} className="size-7 rounded-lg text-slate-400 hover:text-slate-700">
                    <X className="size-4" />
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                      <div className="size-14 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-3">
                        <Package className="size-7" />
                      </div>
                      <p className="text-sm font-semibold text-slate-600">Keranjang kosong</p>
                      <p className="text-xs text-slate-400 mt-1 max-w-[200px]">Tambahkan produk dari katalog supplier.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      <div className="px-4 py-2.5 bg-slate-50/80 flex items-center gap-2 text-[11px] font-semibold text-slate-500">
                        <Store className="size-3 text-primary" />
                        {supplier.businessName}
                      </div>
                      {cart.map(item => (
                        <div key={item.id} className="px-4 py-3 flex items-start gap-3">
                          <div className="size-14 rounded-lg overflow-hidden shrink-0 border border-slate-100 bg-slate-50 flex items-center justify-center">
                            {item.photoUrl ? <img src={item.photoUrl} className="w-full h-full object-cover" /> : <Package className="size-5 text-slate-300" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium text-slate-800 truncate">{item.name}</p>
                            <p className="text-xs font-extrabold text-red-600 mt-0.5">
                              {item.pricePerUnit != null ? `Rp ${item.pricePerUnit.toLocaleString('id-ID')}` : '-'}
                              <span className="text-[9px] text-slate-400 font-normal ml-0.5">/{item.unit}</span>
                            </p>
                            <div className="flex items-center justify-between mt-2">
                              <div className="flex items-center border border-slate-200 rounded-lg">
                                <button
                                  onClick={() => { if (item.qty > 1) setCart(p => p.map(i => i.id === item.id ? { ...i, qty: i.qty - 1 } : i)) }}
                                  className="size-7 flex items-center justify-center hover:bg-slate-50 text-slate-500 rounded-l-lg transition-colors"
                                >
                                  <Minus className="size-3" />
                                </button>
                                <span className="w-8 text-center text-xs font-bold border-x border-slate-200">{item.qty}</span>
                                <button
                                  onClick={() => setCart(p => p.map(i => i.id === item.id ? { ...i, qty: i.qty + 1 } : i))}
                                  className="size-7 flex items-center justify-center hover:bg-slate-50 text-slate-500 rounded-r-lg transition-colors"
                                >
                                  <Plus className="size-3" />
                                </button>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800">
                                  Rp {((item.pricePerUnit ?? 0) * item.qty).toLocaleString('id-ID')}
                                </span>
                                <button onClick={() => removeFromCart(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
                                  <Trash2 className="size-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="border-t border-slate-100 p-4 space-y-3 bg-white">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Subtotal ({totalItems} item)</span>
                      <span className="font-semibold text-slate-700">Rp {totalEstimasi.toLocaleString('id-ID')}</span>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-slate-900">Total</span>
                      <span className="text-lg font-extrabold text-red-600">Rp {totalEstimasi.toLocaleString('id-ID')}</span>
                    </div>
                    {cart.some((item) => item.minOrderQty != null && item.qty < item.minOrderQty) && (
                      <p className="text-[10px] text-amber-600 font-semibold text-center">
                        Beberapa item belum memenuhi jumlah minimum order supplier.
                      </p>
                    )}
                    <Button
                      onClick={handleSubmitPo}
                      disabled={submittingPo || cart.some((item) => item.minOrderQty != null && item.qty < item.minOrderQty)}
                      className="w-full h-10 rounded-xl font-bold text-xs gap-2"
                    >
                      <FileText className="size-3.5" />
                      {submittingPo ? "Mengirim..." : "Buat Purchase Order"}
                    </Button>
                    <p className="text-[9px] text-slate-400 text-center">
                      PO akan dikirim ke supplier untuk konfirmasi.
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </QueryState>
  )
}
