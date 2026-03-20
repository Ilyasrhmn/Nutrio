import {
  ArrowRight,
  ClipboardCheck,
  LayoutDashboard,
  QrCode,
  ShieldAlert,
  Store,
} from "lucide-react";

export function Features() {
  return (
    <section
      id="features"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24"
    >
      <div className="text-center mb-16 flex flex-col items-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 font-medium text-xs mb-6">
          Solusi Nutrio
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] mb-4">
          Ubah Pengawasan Menjadi{" "}
          <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">
            Tindakan Preventif
          </span>
        </h2>
        <p className="text-slate-500 text-lg max-w-2xl">
          Solusi end-to-end yang menjembatani BGN, inspector lapangan, vendor
          UMKM, hingga masyarakat umum.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 pb-8">
        <div className="bg-white rounded-xl p-8 shadow-[0_4px_20px_-2px_rgba(79,70,229,0.06)] border border-slate-100 hover:-translate-y-1 transition-all duration-200 group flex flex-col">
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            SOP Compliance Tracker
          </h3>
          <p className="text-slate-500 text-sm leading-[1.65] flex-1 mb-6">
            Checklist harian dapur dengan foto bukti real-time. Inspector
            lapangan submit via PWA mobile, data masuk dashboard BGN dalam
            hitungan detik.
          </p>
          <a
            href="#"
            className="inline-flex items-center text-sm font-medium text-indigo-600 group"
          >
            Pelajari lebih lanjut
            <ArrowRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="relative bg-white rounded-xl p-8 shadow-[0_4px_20px_-2px_rgba(79,70,229,0.12)] border border-slate-100 hover:-translate-y-1 transition-all duration-200 group flex flex-col ring-2 ring-indigo-100">
          <div className="absolute top-4 right-4 bg-indigo-600 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded">
            Diferensiasi Utama
          </div>
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            Predictive Risk Engine
          </h3>
          <p className="text-slate-500 text-sm leading-[1.65] flex-1 mb-6">
            Skor risiko 0–100 yang dihitung otomatis dari kepatuhan SOP,
            validitas sertifikat, dan histori insiden. Deteksi vendor
            bermasalah sebelum korban jatuh.
          </p>
          <a
            href="#"
            className="inline-flex items-center text-sm font-medium text-indigo-600 group"
          >
            Pelajari lebih lanjut
            <ArrowRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-[0_4px_20px_-2px_rgba(79,70,229,0.06)] border border-slate-100 hover:-translate-y-1 transition-all duration-200 group flex flex-col">
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            <QrCode className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            Public Trust Layer (QR)
          </h3>
          <p className="text-slate-500 text-sm leading-[1.65] flex-1 mb-6">
            Setiap dapur punya QR code publik. Scan = lihat sertifikasi aktif,
            skor kepatuhan, dan riwayat 3 inspeksi terakhir. Tanpa login,
            tanpa aplikasi.
          </p>
          <a
            href="#"
            className="inline-flex items-center text-sm font-medium text-indigo-600 group"
          >
            Pelajari lebih lanjut
            <ArrowRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-[0_4px_20px_-2px_rgba(79,70,229,0.06)] border border-slate-100 hover:-translate-y-1 transition-all duration-200 group flex flex-col md:col-start-1 lg:col-start-2">
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            BGN Command Center
          </h3>
          <p className="text-slate-500 text-sm leading-[1.65] flex-1 mb-6">
            Peta sebaran vendor, alert real-time, tren kepatuhan per wilayah.
            Satu dashboard untuk pantau 19.000+ vendor secara nasional.
          </p>
          <a
            href="#"
            className="inline-flex items-center text-sm font-medium text-indigo-600 group"
          >
            Pelajari lebih lanjut
            <ArrowRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>

        <div className="bg-white rounded-xl p-8 shadow-[0_4px_20px_-2px_rgba(79,70,229,0.06)] border border-slate-100 hover:-translate-y-1 transition-all duration-200 group flex flex-col">
          <div className="h-12 w-12 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            <Store className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-3">
            Open Vendor Marketplace
          </h3>
          <p className="text-slate-500 text-sm leading-[1.65] flex-1 mb-6">
            UMKM terverifikasi dapat akses setara ke kontrak SPPG. Sistem
            matching otomatis berdasarkan lokasi, kapasitas, dan risk score.
          </p>
          <a
            href="#"
            className="inline-flex items-center text-sm font-medium text-indigo-600 group"
          >
            Pelajari lebih lanjut
            <ArrowRight className="ml-1.5 h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>
    </section>
  );
}
