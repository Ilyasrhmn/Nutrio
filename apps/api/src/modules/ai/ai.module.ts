import { Module } from '@nestjs/common';
import { LlmService } from './llm.service';
import { VisionService } from './vision.service';
import { CacheModule } from '../cache/cache.module';

@Module({
  imports: [CacheModule],
  providers: [LlmService, VisionService],
  exports: [LlmService, VisionService],
})
export class AiModule {}
