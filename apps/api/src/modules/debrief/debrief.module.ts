import { Module } from '@nestjs/common';
import { DebriefService } from './debrief.service';
import { DebriefController, PublicDebriefController } from './debrief.controller';
import { AiModule } from '../ai/ai.module';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [AiModule, ScoringModule],
  providers: [DebriefService],
  controllers: [DebriefController, PublicDebriefController],
  exports: [DebriefService],
})
export class DebriefModule {}
