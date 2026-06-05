import { Controller, Get, Param, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
import { PublicService } from './public.service';

@Controller('public')
export class PublicController {
  constructor(private readonly service: PublicService) {}

  @Get('overview')
  getOverview() {
    return this.service.getOverview();
  }

  @Get('sppg/search')
  searchSppg(
    @Query('q') q?: string,
    @Query('city') city?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number = 20,
  ) {
    return this.service.searchSppg(q, city, limit);
  }

  @Get('sppg/:id')
  getSppgProfile(@Param('id') id: string) {
    return this.service.getSppgPublicProfile(id);
  }

  @Get('audit-trail/:vendorId')
  getAuditTrail(
    @Param('vendorId') vendorId: string,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 10,
  ) {
    return this.service.getAuditTrail(vendorId, limit);
  }
}
