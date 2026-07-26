"use client";

// Queues checkpoint photo submits that fail due to no network connectivity,
// and retries them once the device is back online. Only network failures
// are queued — server-side rejections (validation, 409 operation-day gate,
// etc.) are not, since retrying those blindly would just fail again.

const DB_NAME = "nutrio-offline-queue";
const STORE_NAME = "checkpoint-submits";
const DB_VERSION = 1;

export interface QueuedCheckpointSubmit {
  id: string;
  cpId: string;
  photoBlob: Blob;
  photoType: string;
  gpsLat?: string;
  gpsLng?: string;
  queuedAt: number;
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function enqueueCheckpointSubmit(
  item: Omit<QueuedCheckpointSubmit, "id" | "queuedAt">,
): Promise<void> {
  const db = await openDb();
  const record: QueuedCheckpointSubmit = {
    ...item,
    id: crypto.randomUUID(),
    queuedAt: Date.now(),
  };
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(record);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

export async function listQueuedSubmits(): Promise<QueuedCheckpointSubmit[]> {
  const db = await openDb();
  const result = await new Promise<QueuedCheckpointSubmit[]>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result as QueuedCheckpointSubmit[]);
    req.onerror = () => reject(req.error);
  });
  db.close();
  return result;
}

export async function removeQueuedSubmit(id: string): Promise<void> {
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
}

/** True for a network-level failure (offline / DNS / connection refused) — not an HTTP error response. */
export function isNetworkFailure(err: unknown): boolean {
  if (typeof navigator !== "undefined" && !navigator.onLine) return true;
  if (err instanceof TypeError) return true;
  const message = err instanceof Error ? err.message : String(err);
  return /failed to fetch|network|load failed/i.test(message);
}
