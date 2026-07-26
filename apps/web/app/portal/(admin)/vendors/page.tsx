"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  adminVendorsService,
  type AdminVendor,
} from "@/lib/services/admin-vendors.service";

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<AdminVendor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminVendorsService
      .list()
      .then((result) => setVendors(result.items))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vendor readiness</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && (
          <p className="text-sm text-muted-foreground">Memuat vendor…</p>
        )}
        {!loading && vendors.length === 0 && (
          <p className="text-sm text-muted-foreground">Belum ada vendor.</p>
        )}
        {vendors.map((vendor) => (
          <div
            key={vendor.id}
            className="flex items-center justify-between rounded-lg border p-4"
          >
            <div>
              <p className="font-semibold">{vendor.businessName}</p>
              <p className="text-sm text-muted-foreground">
                {vendor.ownerName} · {vendor.province}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={vendor.ready ? "default" : "secondary"}>
                {vendor.ready ? "Siap" : "Belum siap"}
              </Badge>
              <Badge variant="outline">{vendor.lifecycleStatus}</Badge>
              <Button asChild size="sm">
                <Link href={`/portal/admin/vendors/${vendor.id}`}>Detail</Link>
              </Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
