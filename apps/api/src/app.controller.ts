import { Controller, Get, UseGuards } from "@nestjs/common";
import { AppService } from "./app.service";
import { JwtAuthGuard } from "./modules/auth/guards/jwt-auth.guard";
import { PoliciesGuard } from "./modules/auth/guards/policies.guard";
import { CheckPolicies } from "./modules/auth/decorators/check-policies.decorator";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getInfo() {
    return this.appService.getInfo();
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(['read', 'Dashboard'])
  getProfile() {
    return { message: 'This is a protected route' };
  }

  @Get('admin-only')
  @UseGuards(JwtAuthGuard, PoliciesGuard)
  @CheckPolicies(['manage', 'all'])
  getAdminData() {
    return { message: 'This is an admin-only route' };
  }
}
