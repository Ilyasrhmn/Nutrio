import { Body, Controller, Get, Headers, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateOpnameDto } from './dto/create-opname.dto';
import { InventoryService } from './inventory.service';

@Controller('inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
  constructor(private readonly inventory: InventoryService) {}
  @Get('current') current(@Req() req: any) { return this.inventory.current(req.user.id); }
  @Post('opname') opname(@Req() req: any, @Body() dto: CreateOpnameDto, @Headers('idempotency-key') key?: string) { return this.inventory.opname(req.user.id, dto, key); }
}
