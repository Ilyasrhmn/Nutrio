import { Module } from "@nestjs/common";
import { CommandCenterService } from "./command-center.service";
import { CommandCenterController } from "./command-center.controller";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  providers: [CommandCenterService],
  controllers: [CommandCenterController],
  exports: [CommandCenterService],
})
export class CommandCenterModule {}
