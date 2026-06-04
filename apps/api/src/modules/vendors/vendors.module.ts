import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vendor } from './entities/vendor.entity';
import { StateMachineService } from './state-machine.service';

@Module({
  imports: [TypeOrmModule.forFeature([Vendor])],
  providers: [StateMachineService],
  exports: [StateMachineService, TypeOrmModule],
})
export class VendorsModule {}
