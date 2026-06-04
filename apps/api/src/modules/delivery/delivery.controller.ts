import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DeliveryService } from './delivery.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  @Get('my/week-schedule')
  @UseGuards(JwtAuthGuard)
  getMyWeekSchedule(@Req() req: any) {
    return this.service.getMyWeekSchedule(req.user.sub);
  }

  @Get(':token')
  getInfo(@Param('token') token: string) {
    return this.service.getInfo(token);
  }

  @Post(':token/arrived')
  @HttpCode(HttpStatus.OK)
  recordArrival(
    @Param('token') token: string,
    @Body() body: { gpsLat?: number; gpsLng?: number },
  ) {
    return this.service.recordArrival(token, body.gpsLat, body.gpsLng);
  }

  @Post(':token/photo')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  uploadPhoto(@Param('token') token: string, @UploadedFile() file: Express.Multer.File) {
    return this.service.uploadArrivalPhoto(token, file);
  }

  @Get(':token/qr-payload')
  getQrPayload(@Param('token') token: string) {
    return this.service.getQrPayload(token);
  }

  @Post(':token/complete')
  @HttpCode(HttpStatus.OK)
  complete(@Param('token') token: string) {
    return this.service.complete(token);
  }
}
