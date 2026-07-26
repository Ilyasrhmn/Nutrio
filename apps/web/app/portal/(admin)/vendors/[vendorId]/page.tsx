"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  adminVendorsService,
  type AdminVendorDetail,
} from "@/lib/services/admin-vendors.service";

export default function AdminVendorDetailPage() {
  const { vendorId } = useParams<{ vendorId: string }>();
  const [vendor, setVendor] = useState<AdminVendorDetail | null>(null);
  const [reason, setReason] = useState("Perlu verifikasi admin");

  const reload = () => adminVendorsService.get(vendorId).then(setVendor);
  useEffect(() => {
    reload();
  }, [vendorId]);
  if (!vendor)
    return (
      <p className="text-sm text-muted-foreground">Memuat detail vendor…</p>
    );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{vendor.businessName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>Status: {vendor.lifecycleStatus}</p>
          <p>
            {vendor.readiness.ready
              ? "Siap aktif"
              : vendor.readiness.nextAction}
          </p>
          {!vendor.readiness.ready && (
            <ul className="list-disc pl-5 text-sm">
              {vendor.readiness.missingRequirements.map((item) => (
                <li key={item.code}>{item.message}</li>
              ))}
            </ul>
          )}
          <input
            className="w-full rounded border p-2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            aria-label="Alasan aksi admin"
          />
          <div className="flex gap-2">
            <Button
              variant="destructive"
              onClick={() =>
                adminVendorsService.suspend(vendor.id, { reason }).then(reload)
              }
            >
              Suspend vendor
            </Button>
            <Button
              onClick={() =>
                adminVendorsService.resume(vendor.id, { reason }).then(reload)
              }
            >
              Aktifkan kembali
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Timeline lifecycle</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {vendor.timeline.map((event, index) => (
              <li key={`${event.createdAt}-${index}`}>
                {event.from} → {event.to}{" "}
                {event.reason ? `— ${event.reason}` : ""}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
