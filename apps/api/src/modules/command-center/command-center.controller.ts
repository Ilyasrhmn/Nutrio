import { Controller, Get, Param, Patch, Query, UseGuards, ParseIntPipe, DefaultValuePipe } from '@nestjs/common';
import { CommandCenterService } from './command-center.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('command-center')
export class CommandCenterController {
  constructor(private readonly service: CommandCenterService) {}

  @Get('overview')
  getOverview() {
    return this.service.getOverview();
  }

  @Get('vendors')
  getVendors() {
    return this.service.getActiveVendors();
  }

  @Get('alerts')
  getAlerts(
    @Query('severity') severity?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.service.getAlerts(severity, page, limit);
  }

  @Patch('alerts/:id/read')
  markRead(@Param('id') id: string) {
    return this.service.markAlertRead(id);
  }

  @Get('deliveries')
  getDeliveries(
    @Query('date') date?: string,
    @Query('limit', new DefaultValuePipe(50), ParseIntPipe) limit: number = 50,
  ) {
    return this.service.getDeliveries(date, limit);
  }

  @Get('reports')
  getReportStats() {
    return this.service.getReportStats();
  }

  @Get('sppg/:vendorId')
  getSppgDetail(@Param('vendorId') vendorId: string) {
    return this.service.getSppgDetail(vendorId);
  }
}
