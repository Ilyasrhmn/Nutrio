import { io, Socket } from 'socket.io-client';

// WebSocket needs a direct URL — use NEXT_PUBLIC_WS_URL if set, else fall back
// to NEXT_PUBLIC_API_URL (which works fine for local dev pointing at localhost)
const API_URL = process.env.NEXT_PUBLIC_WS_URL ?? process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3333';

// ─── Types ────────────────────────────────────────────────────────────────────

export type RealtimeEvent =
  | 'mc:checkpoint:update'
  | 'mc:score:update'
  | 'mc:team:presence'
  | 'score:update'
  | 'score:critical'
  | 'alert:new'
  | 'notification:new';

type EventHandler = (payload: unknown) => void;

// ─── OpsClient (vendor/staff namespace /ops) ─────────────────────────────────

class OpsRealtimeClient {
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
      console.log('[realtime/ops] connected');
      this.stopPolling();
    });

    this.socket.on('disconnect', () => {
      console.warn('[realtime/ops] disconnected — starting 10s poll fallback');
      this.startPolling();
    });

    // Replay all registered handlers
    this.handlers.forEach((handlers, event) => {
      handlers.forEach((handler) => this.socket!.on(event, handler));
    });
  }

  on(event: RealtimeEvent, handler: EventHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    this.socket?.on(event, handler);
  }

  off(event: RealtimeEvent, handler: EventHandler) {
    this.handlers.get(event)?.delete(handler);
    this.socket?.off(event, handler);
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

  /** Register a callback that fires every 10s when disconnected (poll fallback). */
  onPollTick(cb: () => void) {
    this.pollCallback = cb;
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

// ─── BgnClient (BGN admin namespace /bgn) ────────────────────────────────────

class BgnRealtimeClient {
  private socket: Socket | null = null;
  private handlers = new Map<string, Set<EventHandler>>();

  connect(token: string) {
    if (this.socket?.connected) return;

    this.socket = io(`${API_URL}/bgn`, {
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: Infinity,
      transports: ['websocket', 'polling'],
    });

    this.socket.on('connect', () => console.log('[realtime/bgn] connected'));
    this.socket.on('disconnect', () => console.warn('[realtime/bgn] disconnected'));

    this.handlers.forEach((handlers, event) => {
      handlers.forEach((handler) => this.socket!.on(event, handler));
    });
  }

  on(event: RealtimeEvent, handler: EventHandler) {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
    this.socket?.on(event, handler);
  }

  off(event: RealtimeEvent, handler: EventHandler) {
    this.handlers.get(event)?.delete(handler);
    this.socket?.off(event, handler);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.handlers.clear();
  }

  isConnected() {
    return this.socket?.connected ?? false;
  }
}

// ─── Singletons ───────────────────────────────────────────────────────────────

export const opsClient = new OpsRealtimeClient();
export const bgnClient = new BgnRealtimeClient();
