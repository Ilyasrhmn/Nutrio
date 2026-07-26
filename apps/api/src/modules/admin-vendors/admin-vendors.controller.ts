import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { UserRole } from "@workspace/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard } from "../auth/guards/roles.guard";
import { Roles } from "../auth/decorators/roles.decorator";
import { AdminVendorsService } from "./admin-vendors.service";
import { ListVendorsQueryDto } from "./dto/list-vendors-query.dto";
import { RevisionRequestDto, VendorActionDto } from "./dto/vendor-action.dto";

@Controller("admin/vendors")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN_BGN, UserRole.COORDINATOR_SPPG, UserRole.DINKES)
export class AdminVendorsController {
  constructor(private readonly service: AdminVendorsService) {}

  @Get()
  list(@Query() query: ListVendorsQueryDto) {
    return this.service.list(query);
  }

  @Get(":id")
  detail(@Param("id") id: string) {
    return this.service.detail(id);
  }

  @Post(":id/suspend")
  suspend(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: VendorActionDto,
  ) {
    return this.service.suspend(id, req.user.id, dto.reason);
  }

  @Post(":id/resume")
  resume(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: VendorActionDto,
  ) {
    return this.service.resume(id, req.user.id, dto.reason);
  }

  @Post(":id/revision")
  revision(
    @Param("id") id: string,
    @Req() req: any,
    @Body() dto: RevisionRequestDto,
  ) {
    return this.service.requestRevision(
      id,
      req.user.id,
      dto.reason,
      dto.missingRequirements,
    );
  }
}
