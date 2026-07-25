"use client";

import { AlertTriangle, Inbox, Loader2, ShieldOff, WifiOff } from "lucide-react";
import { Button } from "@workspace/ui/components/button";

export type QueryStatus = "loading" | "empty" | "error" | "forbidden" | "success";

interface QueryStateProps {
  status: QueryStatus;
  children: React.ReactNode;
  onRetry?: () => void;
  errorMessage?: string;
  isNetworkError?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  loadingLabel?: string;
}

export function QueryState({
  status,
  children,
  onRetry,
  errorMessage = "Gagal memuat data.",
  isNetworkError = false,
  emptyTitle = "Belum ada data",
  emptyMessage = "Data akan muncul di sini setelah tersedia.",
  loadingLabel = "Memuat...",
}: QueryStateProps) {
  if (status === "loading") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-muted-foreground">
        <Loader2 className="size-6 animate-spin" />
        <p className="text-sm">{loadingLabel}</p>
      </div>
    );
  }

  if (status === "forbidden") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <ShieldOff className="size-6" />
        </div>
        <div>
          <p className="font-medium">Akses ditolak</p>
          <p className="text-sm text-muted-foreground">Kamu tidak punya izin untuk melihat data ini.</p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    const Icon = isNetworkError ? WifiOff : AlertTriangle;
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="size-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Icon className="size-6" />
        </div>
        <div>
          <p className="font-medium">
            {isNetworkError ? "Koneksi bermasalah" : "Terjadi kesalahan"}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">{errorMessage}</p>
        </div>
        {onRetry && (
          <Button variant="outline" size="sm" onClick={onRetry}>
            Coba lagi
          </Button>
        )}
      </div>
    );
  }

  if (status === "empty") {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="size-12 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <Inbox className="size-6" />
        </div>
        <div>
          <p className="font-medium">{emptyTitle}</p>
          <p className="text-sm text-muted-foreground max-w-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
