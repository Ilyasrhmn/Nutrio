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
    const vendorIds = await this.scoringService.getActiveVendorIds();
    this.logger.log(`[score-init] Initializing ${vendorIds.length} active vendors`);
    await Promise.all(vendorIds.map(id => this.scoringService.initializeDailyScore(id)));
    this.logger.log('[score-init] Done');
  }
}
