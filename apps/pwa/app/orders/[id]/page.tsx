"use client";

import { use, useState } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { mockOrders } from "@/lib/mock-data/orders";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Badge } from "@workspace/ui/components/badge";
import { MapPin, Calendar, Clock, Package, CheckCircle2, ChevronLeft, Camera } from "lucide-react";
import Link from "next/link";
import { CameraCapture } from "@/components/checkpoint/camera-capture";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const order = mockOrders.find(o => o.id === id) || mockOrders[0];
  const [status, setStatus] = useState(order.status);
  const [showCamera, setShowCamera] = useState(false);
  const [proofImage, setProofImage] = useState<string | null>(null);

  const statusConfig: Record<string, { label: string; className: string }> = {
    new: { label: "Baru", className: "bg-blue-100 text-blue-700" },
    processed: { label: "Diproses", className: "bg-amber-100 text-amber-700" },
    shipped: { label: "Dikirim", className: "bg-indigo-100 text-indigo-700" },
    completed: { label: "Selesai", className: "bg-green-100 text-green-700" },
  };

  const config = statusConfig[status] || statusConfig.new;

  return (
    <div className="flex flex-col min-h-screen">
      <div className="sticky top-0 z-40 bg-white border-b border-slate-200 px-4 h-16 flex items-center gap-3">
        <Link href="/orders" className="p-2 -ml-2 text-slate-500">
          <ChevronLeft className="h-6 w-6" />
        </Link>
        <h1 className="text-lg font-bold text-slate-900">Detail Pesanan</h1>
      </div>

      <div className="p-4 space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <p className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-widest">{order.id}</p>
            <h2 className="text-xl font-black text-slate-900">{order.vendorName}</h2>
          </div>
          <Badge className={statusConfig[status].className + " border-none font-black px-4 py-1"}>
            {statusConfig[status].label}
          </Badge>
        </div>

        <Card className="border-none shadow-sm bg-slate-100">
          <CardContent className="p-5 space-y-4">
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Alamat Pengiriman</p>
                <p className="text-sm font-bold text-slate-900 leading-tight mt-0.5">{order.deliveryAddress}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-white flex items-center justify-center text-slate-400">
                <Calendar className="h-4 w-4" />
              </div>
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tanggal Pengiriman</p>
                <p className="text-sm font-bold text-slate-900 leading-tight mt-0.5">{order.deliveryDate}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <section className="space-y-3">
          <h3 className="font-bold text-slate-900">Daftar Barang</h3>
          <Card>
            <CardContent className="p-0">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between p-4 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500 font-medium">{item.qty} {item.unit} x Rp 35.000</p>
                    </div>
                  </div>
                  <p className="text-sm font-black text-slate-900">Rp 1.8jt</p>
                </div>
              ))}
              <div className="p-4 bg-slate-50/50 flex justify-between items-center">
                <p className="text-xs font-bold text-slate-500 uppercase">Total Pesanan</p>
                <p className="text-lg font-black text-green-600">Rp 1.820.000</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {status === "processed" && showCamera && (
          <section className="space-y-3 animate-in fade-in slide-in-from-bottom-4">
            <h3 className="font-bold text-slate-900">Bukti Pengiriman</h3>
            <CameraCapture 
              onCapture={(img) => { setProofImage(img); setShowCamera(false); }} 
              imageSrc={proofImage}
            />
          </section>
        )}

        {proofImage && (
          <section className="space-y-3">
             <h3 className="font-bold text-slate-900">Bukti Pengiriman</h3>
             <div className="aspect-square rounded-2xl overflow-hidden border-2 border-green-100">
                <img src={proofImage} className="w-full h-full object-cover" />
             </div>
          </section>
        )}

        <div className="pt-4 pb-12 space-y-3">
          {status === "new" && (
            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 h-14 font-bold border-slate-200">Tolak</Button>
              <Button 
                className="flex-[2] h-14 bg-green-600 hover:bg-green-700 font-black text-lg shadow-lg shadow-green-100"
                onClick={() => setStatus("processed")}
              >
                Terima Pesanan
              </Button>
            </div>
          )}

          {status === "processed" && !proofImage && (
            <Button 
              className="w-full h-14 bg-blue-600 hover:bg-blue-700 font-black text-lg shadow-lg shadow-blue-100"
              onClick={() => setShowCamera(true)}
            >
              <Camera className="h-5 w-5 mr-2" /> Ambil Bukti Kirim
            </Button>
          )}

          {status === "processed" && proofImage && (
             <Button 
              className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 font-black text-lg shadow-lg shadow-indigo-100"
              onClick={() => { setStatus("shipped"); setProofImage(null); }}
            >
              Konfirmasi Dikirim
            </Button>
          )}

          {status === "shipped" && (
             <Button 
              className="w-full h-14 bg-green-600 hover:bg-green-700 font-black text-lg shadow-lg shadow-green-100"
              onClick={() => setStatus("completed")}
            >
              Tandai Selesai
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
