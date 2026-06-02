import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';
import { ScoringService } from '../scoring/scoring.service';

@Injectable()
export class ScoreInitCron {
  private readonly logger = new Logger(ScoreInitCron.name);

  constructor(
    private readonly config: ConfigService,
    private readonly scoringService: ScoringService,
  ) {}

  @Cron('1 0 * * *', { name: 'score-init' })
  async handle() {
    if (this.config.get('SCHEDULER_ENABLED') === 'false') return;
    try {
      const vendorIds = await this.scoringService.getActiveVendorIds();
      this.logger.log(`[score-init] Initializing ${vendorIds.length} active vendors`);
      const results = await Promise.allSettled(
        vendorIds.map(id => this.scoringService.initializeDailyScore(id)),
      );
      const failed = results.filter(r => r.status === 'rejected').length;
      if (failed > 0) this.logger.warn(`[score-init] ${failed} vendors failed to initialize`);
      this.logger.log('[score-init] Done');
    } catch (err) {
      this.logger.error('[score-init] Fatal error', err);
    }
  }
}
