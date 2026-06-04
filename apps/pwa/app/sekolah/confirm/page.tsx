"use client";

import { useState, useEffect, useRef } from "react";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent } from "@workspace/ui/components/card";
import {
  QrCode,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Utensils,
  Loader2,
  Package,
} from "lucide-react";
import { apiClient } from "@/lib/api-client";
import { Html5QrcodeScanner } from "html5-qrcode";

interface DeliveryInfo {
  token: string;
  vendorName: string;
  schoolId: string;
  porsiCount: number;
  status: string;
}

function extractToken(raw: string): string {
  try {
    const url = new URL(raw);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts[parts.length - 1] ?? raw;
  } catch {
    return raw.trim();
  }
}

export default function SchoolConfirmPage() {
  const [token, setToken] = useState<string | null>(null);
  const [deliveryInfo, setDeliveryInfo] = useState<DeliveryInfo | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [fetchingInfo, setFetchingInfo] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [jumlahDiterima, setJumlahDiterima] = useState("");
  const [kondisi, setKondisi] = useState<"baik" | "ada_masalah">("baik");
  const [catatan, setCatatan] = useState("");

  const fetchDeliveryInfo = async (tok: string) => {
    setFetchingInfo(true);
    setFetchError(null);
    try {
      const res = await apiClient.get<DeliveryInfo>(`/sekolah/confirm/${tok}`);
      setDeliveryInfo(res.data);
      setJumlahDiterima(String(res.data.porsiCount));
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? "Token tidak valid atau sudah kedaluwarsa";
      setFetchError(msg);
    } finally {
      setFetchingInfo(false);
    }
  };

  useEffect(() => {
    if (!isScanning || token) return;

    const scanner = new Html5QrcodeScanner(
      "qr-reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false,
    );

    scanner.render(
      (result) => {
        const tok = extractToken(result);
        setToken(tok);
        setIsScanning(false);
        scanner.clear();
        fetchDeliveryInfo(tok);
      },
      () => {},
    );

    return () => { scanner.clear(); };
  }, [isScanning, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSubmitting(true);
    try {
      await apiClient.post(`/sekolah/confirm/${token}`, {
        jumlahDiterima: Number(jumlahDiterima),
        kondisi,
        catatan: catatan || undefined,
      });
      setIsConfirmed(true);
    } catch (err: any) {
      const msg: string = err?.response?.data?.message ?? "Gagal mengkonfirmasi";
      setFetchError(msg);
    } finally {
      setSubmitting(false);
    }
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
            <p className="text-slate-500">Penerimaan makanan telah tercatat di sistem.</p>
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
        {fetchingInfo && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <Loader2 className="h-8 w-8 animate-spin text-green-600" />
            <p className="text-sm text-slate-500">Memverifikasi token...</p>
          </div>
        )}

        {fetchError && !fetchingInfo && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <p className="font-bold text-slate-900 text-center">{fetchError}</p>
            <Button variant="outline" onClick={() => { setToken(null); setFetchError(null); }}>
              Scan Ulang
            </Button>
          </div>
        )}

        {!token && !fetchingInfo && !fetchError && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <h2 className="text-lg font-bold text-slate-900">Scan QR Code Kurir</h2>
              <p className="text-sm text-slate-500">Arahkan kamera ke QR code yang dibawa oleh kurir vendor.</p>
            </div>

            <div className="aspect-square bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center">
              {isScanning ? (
                <div id="qr-reader" className="w-full h-full" />
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
          </div>
        )}

        {deliveryInfo && !fetchingInfo && !fetchError && (
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
                    <p className="font-bold text-slate-900">{deliveryInfo.vendorName}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="text-[10px] text-green-700 font-bold uppercase">Jumlah Porsi</p>
                    <p className="font-bold text-slate-900">{deliveryInfo.porsiCount} Porsi</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Porsi Diterima</label>
                <input
                  type="number"
                  min={0}
                  max={deliveryInfo.porsiCount}
                  value={jumlahDiterima}
                  onChange={(e) => setJumlahDiterima(e.target.value)}
                  required
                  className="h-12 w-full bg-white border border-slate-200 rounded-xl px-4 text-slate-900 font-bold focus:ring-2 focus:ring-green-600 outline-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Kondisi Makanan</label>
                <select
                  value={kondisi}
                  onChange={(e) => setKondisi(e.target.value as "baik" | "ada_masalah")}
                  className="w-full h-12 bg-white border border-slate-200 rounded-xl px-4 text-sm font-medium focus:ring-2 focus:ring-green-600 outline-none"
                >
                  <option value="baik">Sangat Baik / Layak</option>
                  <option value="ada_masalah">Ada Masalah</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-900">Catatan (Opsional)</label>
                <textarea
                  value={catatan}
                  onChange={(e) => setCatatan(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm font-medium focus:ring-2 focus:ring-green-600 outline-none min-h-[100px]"
                  placeholder="Contoh: Sayur agak tumpah sedikit..."
                />
              </div>

              {fetchError && (
                <p className="text-sm text-red-500 font-medium">{fetchError}</p>
              )}

              <Button
                type="submit"
                disabled={submitting || !jumlahDiterima}
                className="w-full bg-green-600 hover:bg-green-700 h-14 text-lg font-bold shadow-lg shadow-green-100 mt-4"
              >
                {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : "Konfirmasi Penerimaan"}
              </Button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
