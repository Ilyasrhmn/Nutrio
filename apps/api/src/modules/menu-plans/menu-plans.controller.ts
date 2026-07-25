import { Body, Controller, Get, Headers, Param, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpsertMenuPlanDto } from './dto/upsert-menu-plan.dto';
import { MenuPlansService } from './menu-plans.service';
@Controller('menu-plans') @UseGuards(JwtAuthGuard)
export class MenuPlansController { constructor(private readonly menus: MenuPlansService) {} @Post() upsert(@Req() req: any, @Body() dto: UpsertMenuPlanDto, @Headers('idempotency-key') key?: string) { return this.menus.upsert(req.user.id, dto, key); } @Get(':date') get(@Req() req: any, @Param('date') date: string) { return this.menus.get(req.user.id, date); } }
