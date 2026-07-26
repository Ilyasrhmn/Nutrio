import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { VendorsModule } from "../vendors/vendors.module";
import { RealtimeModule } from "../realtime/realtime.module";
import { AdminVendorsController } from "./admin-vendors.controller";
import { AdminVendorsService } from "./admin-vendors.service";

@Module({
  imports: [AuthModule, VendorsModule, RealtimeModule],
  controllers: [AdminVendorsController],
  providers: [AdminVendorsService],
})
export class AdminVendorsModule {}
