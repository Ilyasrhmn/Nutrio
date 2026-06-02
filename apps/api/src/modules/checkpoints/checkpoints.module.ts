import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CheckpointEvent } from './entities/checkpoint-event.entity';
import { DeliveryToken } from './entities/delivery-token.entity';
import { SchoolConfirmation } from './entities/school-confirmation.entity';
import { CheckpointsService } from './checkpoints.service';
import { CheckpointsController } from './checkpoints.controller';
import { StorageModule } from '../storage/storage.module';
import { AiModule } from '../ai/ai.module';
import { ScoringModule } from '../scoring/scoring.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      CheckpointEvent,
      DeliveryToken,
      SchoolConfirmation,
    ]),
    StorageModule,
    AiModule,
    ScoringModule,
    RealtimeModule,
  ],
  providers: [CheckpointsService],
  controllers: [CheckpointsController],
  exports: [CheckpointsService],
})
export class CheckpointsModule {}
