import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ScoringService } from '../scoring/scoring.service';
import { DataSource } from 'typeorm';

@Injectable()
export class ForceCloseCron {
  private readonly logger = new Logger(ForceCloseCron.name);

  constructor(
    private readonly config: ConfigService,
    private readonly scoringService: ScoringService,
    private readonly dataSource: DataSource,
  ) {}

  @Cron('0 14 * * *', { name: 'force-close' })
  async handle() {
    if (this.config.get('SCHEDULER_ENABLED') === 'false') return;

    const today = new Date().toISOString().split('T')[0];
    await this.dataSource.query(
      `UPDATE checkpoint_events
       SET cp_status = 'force_closed'
       WHERE cp_status IN ('pending', 'in_progress')
         AND created_at::date = $1::date`,
      [today],
    );

    const vendorIds = await this.scoringService.getVendorsWithNoCheckpointToday();
    this.logger.log(`[force-close] Applying penalty to ${vendorIds.length} vendors`);
    await Promise.all(
      vendorIds.map(id => this.scoringService.applyPenalty(id, 'FORCE_CLOSED_NO_CP')),
    );
    this.logger.log('[force-close] Done');
  }
}
