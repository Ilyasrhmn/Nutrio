import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EligibilitySession } from './entities/eligibility-session.entity';
import { EligibilityService } from './eligibility.service';
import { EligibilityController } from './eligibility.controller';

@Module({
  imports: [TypeOrmModule.forFeature([EligibilitySession])],
  providers: [EligibilityService],
  controllers: [EligibilityController],
  exports: [EligibilityService, TypeOrmModule],
})
export class EligibilityModule {}
