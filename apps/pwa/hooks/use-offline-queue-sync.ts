"use client";

import { useCallback, useEffect, useState } from "react";
import { apiClient } from "@/lib/api-client";
import {
  listQueuedSubmits,
  removeQueuedSubmit,
  isNetworkFailure,
  type QueuedCheckpointSubmit,
} from "@/lib/offline-queue";

/**
 * Flushes queued checkpoint photo submits (saved when a submit failed
 * due to no connectivity) once the device is back online. Runs on
 * mount and on every 'online' browser event.
 */
export function useOfflineQueueSync() {
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);

  const refreshCount = useCallback(async () => {
    try {
      const items = await listQueuedSubmits();
      setPendingCount(items.length);
    } catch {
      // IndexedDB unavailable (e.g. private browsing) — nothing to sync
    }
  }, []);

  const flush = useCallback(async () => {
    if (typeof navigator !== "undefined" && !navigator.onLine) return;
    setSyncing(true);
    try {
      const items = await listQueuedSubmits();
      for (const item of items) {
        try {
          await submitQueuedItem(item);
          await removeQueuedSubmit(item.id);
        } catch (err) {
          if (!isNetworkFailure(err)) {
            // Server rejected it outright (e.g. operation day no longer
            // valid) — drop it rather than retry forever.
            await removeQueuedSubmit(item.id);
          } else {
            // Still offline — stop, try again next time we're online.
            break;
          }
        }
      }
    } finally {
      setSyncing(false);
      await refreshCount();
    }
  }, [refreshCount]);

  useEffect(() => {
    refreshCount();
    flush();
    const handler = () => flush();
    window.addEventListener("online", handler);
    return () => window.removeEventListener("online", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { pendingCount, syncing, flush };
}

async function submitQueuedItem(item: QueuedCheckpointSubmit) {
  const form = new FormData();
  form.append("photo", item.photoBlob, `${item.cpId}.jpg`);
  if (item.gpsLat) form.append("gpsLat", item.gpsLat);
  if (item.gpsLng) form.append("gpsLng", item.gpsLng);
  await apiClient.post(`/checkpoints/${item.cpId}/submit`, form);
}
