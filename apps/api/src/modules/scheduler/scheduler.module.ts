import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScoreInitCron } from './score-init.cron';
import { ForceCloseCron } from './force-close.cron';
import { ReviewSlaCron } from './review-sla.cron';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [ScheduleModule.forRoot(), ScoringModule],
  providers: [ScoreInitCron, ForceCloseCron, ReviewSlaCron],
})
export class SchedulerModule {}
