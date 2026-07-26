"use client";

import { useOfflineQueueSync } from "@/hooks/use-offline-queue-sync";
import { UploadCloud, Loader2 } from "lucide-react";

export function OfflineQueueBanner() {
  const { pendingCount, syncing } = useOfflineQueueSync();

  if (pendingCount === 0) return null;

  return (
    <div className="sticky top-0 z-50 bg-amber-500 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2">
      {syncing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
      {pendingCount} foto checkpoint menunggu dikirim (tersimpan offline)
    </div>
  );
}
