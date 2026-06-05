import { Controller, Get, Query, UseGuards, NotFoundException } from '@nestjs/common';
import { ScoringService } from './scoring.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DataSource } from 'typeorm';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

@Controller('scoring')
@UseGuards(JwtAuthGuard)
export class ScoringController {
  constructor(
    private readonly scoringService: ScoringService,
    private readonly dataSource: DataSource,
  ) {}

  private async getVendorId(userId: string): Promise<string> {
    const [row] = await this.dataSource.query(
      `SELECT id FROM vendors WHERE user_id = $1 LIMIT 1`,
      [userId],
    );
    if (!row) throw new NotFoundException('Vendor tidak ditemukan');
    return row.id;
  }

  @Get('today')
  async getToday(@CurrentUser() user: JwtPayload) {
    const vendorId = await this.getVendorId(user.sub);
    const { score, record, events } = await this.scoringService.getCurrentScore(vendorId);
    const disbursement = await this.scoringService.getDisbursementEstimate(vendorId);
    return { score, record, events, disbursementEstimate: disbursement };
  }

  @Get('history')
  async getHistory(@CurrentUser() user: JwtPayload, @Query('days') days?: string) {
    const vendorId = await this.getVendorId(user.sub);
    return this.scoringService.getHistory(vendorId, days ? parseInt(days, 10) : 30);
  }
}
