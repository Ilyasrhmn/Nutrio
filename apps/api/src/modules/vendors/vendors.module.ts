import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Vendor } from "./entities/vendor.entity";
import { VendorLifecycleEvent } from "./entities/vendor-lifecycle-event.entity";
import { VendorSupplierConnection } from "./entities/vendor-supplier-connection.entity";
import { StateMachineService } from "./state-machine.service";
import { VendorReadinessService } from "./vendor-readiness.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Vendor,
      VendorLifecycleEvent,
      VendorSupplierConnection,
    ]),
  ],
  providers: [StateMachineService, VendorReadinessService],
  exports: [StateMachineService, VendorReadinessService, TypeOrmModule],
})
export class VendorsModule {}
