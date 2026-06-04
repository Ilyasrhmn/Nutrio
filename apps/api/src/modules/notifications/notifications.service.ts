import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Notification, NotificationChannel } from './entities/notification.entity';
import { RealtimeService } from '../realtime/realtime.service';

interface SendOptions {
  userId: string;
  channel: NotificationChannel;
  subject?: string;
  body: string;
  alertId?: string;
  metadata?: Record<string, unknown>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly emailApiKey: string | undefined;

  constructor(
    @InjectRepository(Notification)
    private readonly repo: Repository<Notification>,
    private readonly realtimeService: RealtimeService,
    private readonly config: ConfigService,
  ) {
    this.emailApiKey = config.get<string>('EMAIL_API_KEY');
  }

  async send(opts: SendOptions): Promise<Notification> {
    const notif = this.repo.create({
      userId: opts.userId,
      channel: opts.channel,
      subject: opts.subject ?? null,
      body: opts.body,
      alertId: opts.alertId ?? null,
      status: 'pending',
    });
    const saved = await this.repo.save(notif);

    try {
      switch (opts.channel) {
        case 'in_app':
          await this.sendInApp(opts.userId, saved);
          break;
        case 'email':
          await this.sendEmail(opts, saved.id);
          break;
        case 'whatsapp':
        case 'sms':
          this.logger.log(`[notif:stub] ${opts.channel} → userId=${opts.userId} | ${opts.body}`);
          break;
      }
      await this.repo.update(saved.id, { status: 'sent', sentAt: new Date() });
      saved.status = 'sent';
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      await this.repo.update(saved.id, {
        status: 'failed',
        failedAt: new Date(),
        failureReason: message,
      });
      this.logger.error(`[notif] Failed channel=${opts.channel} userId=${opts.userId}: ${message}`);
    }

    return saved;
  }

  private async sendInApp(userId: string, notif: Notification): Promise<void> {
    this.realtimeService.broadcastToVendor(userId, 'notification:new', {
      id: notif.id,
      subject: notif.subject,
      body: notif.body,
      createdAt: notif.createdAt,
    });
  }

  private async sendEmail(opts: SendOptions, notifId: string): Promise<void> {
    if (!this.emailApiKey) {
      this.logger.warn(`[notif:email] EMAIL_API_KEY not set — skipping email to userId=${opts.userId}`);
      return;
    }
    // Resend-compatible HTTP call (no SDK dep needed)
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.emailApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Nutrio <noreply@nutrio.id>',
        to: [opts.metadata?.email ?? opts.userId],
        subject: opts.subject ?? 'Notifikasi Nutrio',
        text: opts.body,
      }),
    });
    if (!res.ok) {
      throw new Error(`Resend API error ${res.status}`);
    }
    this.logger.log(`[notif:email] Sent notifId=${notifId}`);
  }

  async listForUser(userId: string, unreadOnly = false): Promise<Notification[]> {
    const qb = this.repo.createQueryBuilder('n')
      .where('n.userId = :userId', { userId })
      .orderBy('n.createdAt', 'DESC')
      .limit(50);
    if (unreadOnly) qb.andWhere('n.readAt IS NULL');
    return qb.getMany();
  }

  async markRead(notifId: string, userId: string): Promise<void> {
    await this.repo.update({ id: notifId, userId }, { readAt: new Date() });
  }
}
