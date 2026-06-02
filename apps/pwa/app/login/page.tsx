"use client";

import { useAuth } from "@/components/providers/auth-provider";
import { UserRole } from "@workspace/common/types";
import { Button } from "@workspace/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@workspace/ui/components/card";
import { ClipboardList, Package, School, Globe, ChevronRight } from "lucide-react";

const ROLE_CONFIGS = [
  {
    role: UserRole.VENDOR,
    label: "Vendor Makan",
    description: "Kelola dapur, checkpoint, dan tagihan.",
    icon: ClipboardList,
    color: "bg-green-100 text-green-700",
  },
  {
    role: UserRole.SUPPLIER,
    label: "Supplier Bahan",
    description: "Terima pesanan dan upload bukti kirim.",
    icon: Package,
    color: "bg-blue-100 text-blue-700",
  },
  {
    role: UserRole.COORDINATOR_SPPG,
    label: "Pihak Sekolah",
    description: "Scan QR penerimaan dan lapor gizi.",
    icon: School,
    color: "bg-amber-100 text-amber-700",
  },
  {
    role: UserRole.PUBLIC,
    label: "Publik / Warga",
    description: "Pantau transparansi program MBG.",
    icon: Globe,
    color: "bg-slate-100 text-slate-700",
  },
];

export default function LoginPage() {
  const { login } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">MBG Platform</h1>
        <p className="text-slate-500 font-medium">Pilih akses masuk (Demo Mode)</p>
      </div>

      <div className="w-full max-w-md space-y-3">
        {ROLE_CONFIGS.map((config) => (
          <Button
            key={config.role}
            variant="ghost"
            className="w-full h-auto p-0 hover:bg-transparent"
            onClick={() => login(config.role)}
          >
            <Card className="w-full border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${config.color}`}>
                  <config.icon className="h-6 w-6" />
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-bold text-slate-900 leading-none">{config.label}</h3>
                  <p className="text-xs text-slate-500 mt-1 font-medium">{config.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-slate-300" />
              </CardContent>
            </Card>
          </Button>
        ))}
      </div>

      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center max-w-[200px]">
        Sistem Verifikasi Berbasis Blockchain & AI
      </p>
    </div>
  );
}
