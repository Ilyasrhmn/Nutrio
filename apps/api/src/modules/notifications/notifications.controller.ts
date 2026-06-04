import { Controller, Get, Post, Param, Query, UseGuards, Req } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly service: NotificationsService) {}

  @Get('me')
  list(@Req() req: any, @Query('unread') unread?: string) {
    return this.service.listForUser(req.user.sub, unread === 'true');
  }

  @Post(':id/read')
  markRead(@Param('id') id: string, @Req() req: any) {
    return this.service.markRead(id, req.user.sub);
  }
}
