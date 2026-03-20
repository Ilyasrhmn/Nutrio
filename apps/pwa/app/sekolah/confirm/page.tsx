"use client";

import { useState, useEffect } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/button";
import { QrCode, CheckCircle2, AlertCircle, MapPin, Clock, Utensils } from "lucide-react";
import { Html5QrcodeScanner } from "html5-qrcode";

export default function SchoolConfirmPage() {
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);

  useEffect(() => {
    if (isScanning && !scanResult) {
      const scanner = new Html5QrcodeScanner(
        "qr-reader",
        { fps: 10, qrbox: { width: 250, height: 250 } },
        /* verbose= */ false
      );

      scanner.render((result) => {
        setScanResult({
          vendor: "Dapur Sehat Bu Sari",
          menu: "Nasi + Ayam Goreng + Sayur",
          porsi: 180,
          waktu: "10:45 WIB",
        });
        scanner.clear();
        setIsScanning(false);
      }, (error) => {
        // console.warn(error);
      });

      return () => {
        scanner.clear();
      };
    }
  }, [isScanning, scanResult]);

  const simulateScan = () => {
    setScanResult({
      vendor: "Dapur Sehat Bu Sari",
      menu: "Nasi + Ayam Goreng + Sayur",
      porsi: 180,
      waktu: "10:45 WIB",
    });
    setIsScanning(false);
  };

  if (isConfirmed) {
    return (
      <div className="flex flex-col min-h-screen bg-white">
        <PageHeader title="Berhasil" />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
          <div className="h-24 w-24 rounded-full bg-green-100 flex items-center justify-center text-green-600">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">Konfirmasi Berhasil!</h2>
            <p className="text-slate-500">Penerimaan makanan telah tercatat di sistem dan blockchain.</p>
          </div>
          <Button className="w-full bg-green-600 hover:bg-green-700 h-12 font-bold" asChild>
            <a href="/sekolah">Ke Dashboard Sekolah</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Konfirmasi Terima" />
      
      <div className="p-4 space-y-6">
        {!scanResult ? (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-slate-900">Scan QR Code Vendor</h2>
              <p className="text-sm text-slate-500">Arahkan kamera ke QR code yang dibawa oleh kurir vendor.</p>
            </div>

            <div className="aspect-square bg-slate-900 rounded-2xl overflow-hidden relative flex flex-col items-center justify-center">
              {isScanning ? (
                <div id="qr-reader" className="w-full h-full"></div>
              ) : (
                <div className="text-center p-8 space-y-4">
                  <div className="h-20 w-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                    <QrCode className="h-10 w-10" />
                  </div>
                  <Button className="bg-green-600 font-bold" onClick={() => setIsScanning(true)}>
                    Aktifkan Kamera
                  </Button>
                </div>
              )}
            </div>

            <Button variant="ghost" className="w-full text-slate-400 text-xs" onClick={simulateScan}>
              [Demo] Simulasi Scan Berhasil
            </Button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <div className="space-y-2">
              <h2 className="text-lg font-bold text-slate-900">Detail Pengiriman</h2>
              <p className="text-sm text-slate-500">Verifikasi data di bawah sebelum konfirmasi.</p>
            </div>

            <Card className="border-green-100 bg-green-50/30 overflow-hidden">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-green-700 font-bold uppercase">Vendor</p>
                    <p className="font-bold text-slate-900">{scanResult.vendor}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Utensils className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-green-700 font-bold uppercase">Menu</p>
                    <p className="font-bold text-slate-900">{scanResult.menu}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-green-700 font-bold uppercase">Jumlah</p>
                      <p className="font-bold text-slate-900">{scanResult.porsi} Porsi</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-[10px] text-green-700 font-bold uppercase">Waktu Tiba</p>
                      <p className="font-bold text-slate-900">{scanResult.waktu}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); setIsConfirmed(true); }}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Porsi Diterima</label>
                <div className="h-12 w-full bg-white border border-slate-200 rounded-xl px-4 flex items-center text-slate-900 font-bold">
                  {scanResult.porsi}
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Kondisi Makanan</label>
                <select className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-green-600 outline-none">
                  <option>Sangat Baik</option>
                  <option>Cukup / Layak</option>
                  <option>Sebagian Rusak</option>
                  <option>Ditolak / Tidak Layak</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Catatan (Opsional)</label>
                <textarea 
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-green-600 outline-none min-h-[100px]"
                  placeholder="Contoh: Sayur agak tumpah sedikit..."
                ></textarea>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-lg shadow-green-100 mt-4">
                Konfirmasi Penerimaan
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
