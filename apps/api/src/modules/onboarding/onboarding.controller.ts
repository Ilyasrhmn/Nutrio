import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  NotFoundException,
} from "@nestjs/common";
import { DataSource } from "typeorm";
import { OnboardingService } from "./onboarding.service";
import { Step1ProfileDto } from "./dto/step1-profile.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { AcceptInviteDto } from "./dto/accept-invite.dto";
import { ConnectSupplierDto } from "./dto/connect-supplier.dto";
import { UploadDocumentDto } from "./dto/upload-document.dto";
import { UpdateTeamMemberDto } from "./dto/update-team-member.dto";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";

interface JwtPayload {
  id: string;
  sub?: string;
  email: string;
  role: string;
}

@Controller("onboarding")
export class OnboardingController {
  constructor(
    private readonly onboardingService: OnboardingService,
    private readonly dataSource: DataSource,
  ) {}

  private async getVendorId(userId: string): Promise<string> {
    const rows = await this.dataSource.query(
      `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    if (!rows || rows.length === 0) {
      throw new NotFoundException("Vendor tidak ditemukan untuk user ini");
    }
    return rows[0].id;
  }

  @UseGuards(JwtAuthGuard)
  @Get("state")
  async getState(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.getState(vendorId);
  }

  @UseGuards(JwtAuthGuard)
  @Post("step1/profile")
  async completeStep1Profile(
    @CurrentUser() user: JwtPayload,
    @Body() dto: Step1ProfileDto,
  ) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.completeStep1Profile(vendorId, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("step2/team/invite")
  async inviteTeamMember(
    @CurrentUser() user: JwtPayload,
    @Body() dto: InviteMemberDto,
  ) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.inviteTeamMember(vendorId, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("step2/team")
  async getTeamStatus(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.getTeamStatus(vendorId);
  }

  @Post("step2/team/accept/:token")
  async acceptInvite(
    @Param("token") token: string,
    @Body() dto: AcceptInviteDto,
  ) {
    return this.onboardingService.acceptInvite(token, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("step2/team/:id/resend")
  async resendTeamMemberInvite(
    @CurrentUser() user: JwtPayload,
    @Param("id") memberId: string,
  ) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.resendTeamMemberInvite(
      vendorId,
      memberId,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete("step2/team/:id")
  async removeTeamMember(
    @CurrentUser() user: JwtPayload,
    @Param("id") memberId: string,
  ) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.removeTeamMember(vendorId, memberId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("step2/team/:id")
  async updateTeamMember(
    @CurrentUser() user: JwtPayload,
    @Param("id") memberId: string,
    @Body() dto: UpdateTeamMemberDto,
  ) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.updateTeamMember(
      vendorId,
      memberId,
      dto,
      user.id,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post("step3/simulation/complete")
  async completeStep3(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.completeStep3(vendorId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("step4/supplier/connect")
  async connectSupplier(
    @CurrentUser() user: JwtPayload,
    @Body() dto: ConnectSupplierDto,
  ) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.connectSupplier(vendorId, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("step4/suppliers")
  async getSuppliers(
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.onboardingService.getSuppliers(
      page ? parseInt(page, 10) : 1,
      limit ? parseInt(limit, 10) : 10,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post("documents")
  async uploadDocument(
    @CurrentUser() user: JwtPayload,
    @Body() dto: UploadDocumentDto,
  ) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.uploadDocument(vendorId, dto, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get("documents")
  async getDocuments(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.getDocuments(vendorId);
  }

  @UseGuards(JwtAuthGuard)
  @Get("readiness")
  async getReadiness(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.getReadiness(vendorId, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post("complete")
  async completeOnboarding(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.id);
    return this.onboardingService.completeOnboarding(vendorId, user.id);
  }
}
