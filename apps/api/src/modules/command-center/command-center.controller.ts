import {
  Controller,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  ParseIntPipe,
  DefaultValuePipe,
} from "@nestjs/common";
import { CommandCenterService } from "./command-center.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@workspace/common";

@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN_BGN, UserRole.COORDINATOR_SPPG, UserRole.DINKES)
@Controller("command-center")
export class CommandCenterController {
  constructor(private readonly service: CommandCenterService) {}

  @Get("overview")
  getOverview() {
    return this.service.getOverview();
  }

  @Get("vendors")
  getVendors() {
    return this.service.getActiveVendors();
  }

  @Get("operation-days")
  getOperationDays(
    @Query("date") date?: string,
    @Query("vendorId") vendorId?: string,
  ) {
    return this.service.getOperationDays(date, vendorId);
  }

  @Get("alerts")
  getAlerts(
    @Query("severity") severity?: string,
    @Query("page", new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query("limit", new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.service.getAlerts(severity, page, limit);
  }

  @Patch("alerts/:id/read")
  markRead(@Param("id") id: string) {
    return this.service.markAlertRead(id);
  }

  @Get("deliveries")
  getDeliveries(
    @Query("date") date?: string,
    @Query("limit", new DefaultValuePipe(50), ParseIntPipe) limit: number = 50,
  ) {
    return this.service.getDeliveries(date, limit);
  }

  @Get("reports")
  getReportStats() {
    return this.service.getReportStats();
  }

  @Get("sppg/:vendorId")
  getSppgDetail(@Param("vendorId") vendorId: string) {
    return this.service.getSppgDetail(vendorId);
  }
}
