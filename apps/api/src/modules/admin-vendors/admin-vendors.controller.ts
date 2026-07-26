import {
  Body,
  Controller,
  Delete,
  Get,
  Patch,
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
import { UpdateTeamMemberDto } from "../onboarding/dto/update-team-member.dto";

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

  @Patch(":id/team/:memberId")
  updateTeam(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    return this.service.updateTeamMember(id, memberId, dto);
  }

  @Post(":id/team/:memberId/resend")
  resendTeamInvite(
    @Param("id") id: string,
    @Param("memberId") memberId: string,
  ) {
    return this.service.resendTeamMemberInvite(id, memberId);
  }

  @Delete(":id/team/:memberId")
  removeTeam(@Param("id") id: string, @Param("memberId") memberId: string) {
    return this.service.removeTeamMember(id, memberId);
  }
}
