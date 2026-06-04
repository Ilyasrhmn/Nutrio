import { Module } from '@nestjs/common';
import { SchoolConfirmService } from './school-confirm.service';
import { SchoolConfirmController } from './school-confirm.controller';
import { ScoringModule } from '../scoring/scoring.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [ScoringModule, RealtimeModule],
  providers: [SchoolConfirmService],
  controllers: [SchoolConfirmController],
  exports: [SchoolConfirmService],
})
export class SchoolConfirmModule {}
