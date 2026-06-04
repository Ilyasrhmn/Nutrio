import { Module } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { DeliveryController } from './delivery.controller';
import { StorageModule } from '../storage/storage.module';
import { ScoringModule } from '../scoring/scoring.module';
import { RealtimeModule } from '../realtime/realtime.module';

@Module({
  imports: [StorageModule, ScoringModule, RealtimeModule],
  providers: [DeliveryService],
  controllers: [DeliveryController],
  exports: [DeliveryService],
})
export class DeliveryModule {}
