import { Controller, Get, UseGuards, NotFoundException } from '@nestjs/common';
import { MissionControlService } from './mission-control.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DataSource } from 'typeorm';

interface JwtPayload { sub: string; email: string; role: string; }

@Controller('mission-control')
@UseGuards(JwtAuthGuard)
export class MissionControlController {
  constructor(
    private readonly mcService: MissionControlService,
    private readonly dataSource: DataSource,
  ) {}

  private async getVendorId(userId: string): Promise<string> {
    const [row] = await this.dataSource.query(
      `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`, [userId],
    );
    if (!row) throw new NotFoundException('Vendor tidak ditemukan');
    return row.id;
  }

  @Get('today')
  async getToday(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.sub);
    return this.mcService.getToday(vendorId);
  }

  @Get('team-presence')
  async getPresence(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.sub);
    return this.mcService.getTeamPresence(vendorId);
  }
}
