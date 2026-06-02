import { Injectable } from '@nestjs/common';
import { Server } from 'socket.io';

@Injectable()
export class RealtimeService {
  private opsServer: Server | null = null;
  private bgnServer: Server | null = null;

  registerOpsServer(server: Server) {
    this.opsServer = server;
  }

  registerBgnServer(server: Server) {
    this.bgnServer = server;
  }

  broadcastToVendor(vendorId: string, event: string, payload: unknown) {
    this.opsServer?.to(`vendor:${vendorId}`).emit(event, payload);
  }

  broadcastToAllVendors(event: string, payload: unknown) {
    this.opsServer?.emit(event, payload);
  }

  broadcastToBGN(event: string, payload: unknown) {
    this.bgnServer?.to('bgn:all').emit(event, payload);
  }

  private presence = new Map<string, { connectedAt: Date; vendorId?: string }>();

  setPresence(userId: string, vendorId?: string) {
    this.presence.set(userId, { connectedAt: new Date(), vendorId });
  }

  clearPresence(userId: string) {
    this.presence.delete(userId);
  }

  getPresenceForVendor(vendorId: string): Array<{ userId: string; connectedAt: Date }> {
    const result: Array<{ userId: string; connectedAt: Date }> = [];
    this.presence.forEach((v, userId) => {
      if (v.vendorId === vendorId) result.push({ userId, connectedAt: v.connectedAt });
    });
    return result;
  }
}
