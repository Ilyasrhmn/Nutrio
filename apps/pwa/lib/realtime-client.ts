import { io, Socket } from 'socket.io-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

type EventHandler = (payload: unknown) => void;

export type PwaRealtimeEvent =
  | 'mc:checkpoint:update'
  | 'mc:score:update'
  | 'notification:new';

// ─── PWA Ops Client ───────────────────────────────────────────────────────────
// Lightweight version for staff PWA — only connects to /ops namespace.
// Includes 10s poll fallback per PRD §5.1.

class PwaOpsClient {
  private socket: Socket | null = null;
  private handlers = new Map<string, Set<EventHandler>>();
  private pollInterval: ReturnType<typeof setInterval> | null = null;
  private pollCallback: (() => void) | null = null;

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(`${API_URL}/ops`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => {
      console.log('[pwa/realtime] connected');
      this.stopPolling();
    });

    this.socket.on('disconnect', () => {
      console.warn('[pwa/realtime] disconnected — polling every 10s');
      this.startPolling();
    });

    // Re-attach registered handlers after socket init
    this.handlers.forEach((handlers, event) => {
      handlers.forEach((handler) => this.socket!.on(event, handler));
    });
  }

  on(event: PwaRealtimeEvent, handler: EventHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    this.socket?.on(event, handler);
    return () => this.off(event, handler);
  }

  off(event: PwaRealtimeEvent, handler: EventHandler) {
    this.handlers.get(event)?.delete(handler);
    this.socket?.off(event, handler);
  }

  onPollTick(cb: () => void) {
    this.pollCallback = cb;
  }

  disconnect() {
    this.stopPolling();
    this.socket?.disconnect();
    this.socket = null;
    this.handlers.clear();
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }

  private startPolling() {
    if (this.pollInterval) return;
    this.pollInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.stopPolling();
        return;
      }
      this.pollCallback?.();
    }, 10_000);
  }

  private stopPolling() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
      this.pollInterval = null;
    }
  }
}

export const pwaOpsClient = new PwaOpsClient();
