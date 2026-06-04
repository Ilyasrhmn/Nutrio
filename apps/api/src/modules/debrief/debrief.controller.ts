import { Controller, Get, Param, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { DebriefService } from './debrief.service';

@Controller('debrief')
export class DebriefController {
  constructor(private readonly service: DebriefService) {}

  @Get(':date')
  @UseGuards(JwtAuthGuard)
  getDebrief(@Param('date') date: string, @Req() req: any) {
    const vendorId: string = req.user.vendorId ?? req.user.sub;
    return this.service.getOrGenerate(vendorId, date);
  }
}

@Controller('public')
export class PublicDebriefController {
  constructor(private readonly service: DebriefService) {}

  @Get('verify/:dataHash')
  verify(@Param('dataHash') dataHash: string) {
    return this.service.verifyHash(dataHash);
  }
}
