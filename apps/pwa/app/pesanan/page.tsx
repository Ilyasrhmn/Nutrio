"use client";

import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent } from "@workspace/ui/components/card";
import { PackageSearch } from "lucide-react";

export default function SupplierOrdersPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <PageHeader title="Pesanan" />
      <div className="p-4">
        <Card className="border-none shadow-sm">
          <CardContent className="p-8 flex flex-col items-center text-center gap-3">
            <div className="h-14 w-14 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <PackageSearch className="h-7 w-7" />
            </div>
            <div>
              <p className="font-bold text-slate-900">Belum Tersedia</p>
              <p className="text-sm text-slate-500 mt-1">
                Penerimaan dan pengelolaan Purchase Order dari vendor belum
                terhubung ke sistem. Fitur ini menunggu endpoint pemesanan
                di backend.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
