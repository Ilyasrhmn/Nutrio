import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DailyScoreRecord } from './entities/daily-score-record.entity';
import { ScoreEvent } from './entities/score-event.entity';
import { ScoringService } from './scoring.service';
import { ScoringController } from './scoring.controller';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [TypeOrmModule.forFeature([DailyScoreRecord, ScoreEvent]), RealtimeModule],
  providers: [ScoringService],
  controllers: [ScoringController],
  exports: [ScoringService],
})
export class ScoringModule {}
