import { Module } from '@nestjs/common';
import { MissionControlService } from './mission-control.service';
import { MissionControlController } from './mission-control.controller';
import { ScoringModule } from '../scoring/scoring.module';
import { CheckpointsModule } from '../checkpoints/checkpoints.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [ScoringModule, CheckpointsModule, RealtimeModule],
  providers: [MissionControlService],
  controllers: [MissionControlController],
})
export class MissionControlModule {}
