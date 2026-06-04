import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ReviewSlaCron {
  private readonly logger = new Logger(ReviewSlaCron.name);

  constructor(private readonly config: ConfigService) {}

  // Runs at 09:00 daily — checks SLA on pending document reviews
  @Cron('0 9 * * *', { name: 'review-sla' })
  async handle() {
    if (this.config.get('SCHEDULER_ENABLED') === 'false') return;
    this.logger.log('[review-sla] Review SLA check — stub');
    // TODO FEAT-1.4: check vendors stuck in DOCS_SUBMITTED > 5 business days → escalate alert
  }
}
