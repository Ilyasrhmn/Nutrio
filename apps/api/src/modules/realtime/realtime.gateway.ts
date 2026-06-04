import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { RealtimeService } from './realtime.service';

// Vendor/staff WebSocket namespace
@WebSocketGateway({ namespace: '/ops', cors: { origin: process.env['ALLOWED_ORIGINS'] ? process.env['ALLOWED_ORIGINS'].split(',').map((o) => o.trim()) : true } })
export class OpsGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(OpsGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.realtimeService.registerOpsServer(server);
  }

  async handleConnection(socket: Socket) {
    const payload = this.extractJwtPayload(socket);
    if (!payload) {
      socket.disconnect(true);
      return;
    }

    const vendorId: string | undefined = payload.vendorId;
    const userId: string = payload.sub;

    socket.data.userId = userId;
    socket.data.vendorId = vendorId;

    this.realtimeService.setPresence(userId, vendorId);

    if (vendorId) {
      await socket.join(`vendor:${vendorId}`);
    }

    this.logger.log(`[ops] connected userId=${userId}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`[ops] disconnected userId=${socket.data.userId ?? 'unknown'}`);
    this.realtimeService.clearPresence(socket.data.userId ?? '');
  }

  private extractJwtPayload(socket: Socket): Record<string, any> | null {
    try {
      const token: string =
        socket.handshake.auth?.token ??
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) return null;

      return this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET', 'access-secret'),
      }) as Record<string, any>;
    } catch {
      return null;
    }
  }
}

// BGN admin WebSocket namespace
@WebSocketGateway({ namespace: '/bgn', cors: { origin: process.env['ALLOWED_ORIGINS'] ? process.env['ALLOWED_ORIGINS'].split(',').map((o) => o.trim()) : true } })
export class BgnGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(BgnGateway.name);

  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly realtimeService: RealtimeService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  afterInit(server: Server) {
    this.realtimeService.registerBgnServer(server);
  }

  async handleConnection(socket: Socket) {
    const payload = this.extractJwtPayload(socket);
    if (!payload) {
      socket.disconnect(true);
      return;
    }

    socket.data.userId = payload.sub;
    await socket.join('bgn:all');
    this.logger.log(`[bgn] connected userId=${payload.sub}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`[bgn] disconnected userId=${socket.data.userId ?? 'unknown'}`);
  }

  private extractJwtPayload(socket: Socket): Record<string, any> | null {
    try {
      const token: string =
        socket.handshake.auth?.token ??
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) return null;

      return this.jwtService.verify(token, {
        secret: this.config.get<string>('JWT_ACCESS_SECRET', 'access-secret'),
      }) as Record<string, any>;
    } catch {
      return null;
    }
  }
}
