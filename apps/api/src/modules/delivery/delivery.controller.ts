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
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { DeliveryService } from "./delivery.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";

@Controller("delivery")
export class DeliveryController {
  constructor(private readonly service: DeliveryService) {}

  @Get("my/week-schedule")
  @UseGuards(JwtAuthGuard)
  getMyWeekSchedule(@Req() req: any) {
    return this.service.getMyWeekSchedule(req.user.id);
  }

  @Get(":token")
  getInfo(@Param("token") token: string) {
    return this.service.getInfo(token);
  }

  @Post(":token/arrived")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  recordArrival(
    @Req() req: any,
    @Param("token") token: string,
    @Body() body: { gpsLat?: number; gpsLng?: number },
  ) {
    return this.service.recordArrival(
      req.user.id,
      token,
      body.gpsLat,
      body.gpsLng,
    );
  }

  @Post(":token/photo")
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor("file", {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  uploadPhoto(
    @Req() req: any,
    @Param("token") token: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException("File foto diperlukan");
    return this.service.uploadArrivalPhoto(req.user.id, token, file);
  }

  @Get(":token/qr-payload")
  getQrPayload(@Param("token") token: string) {
    return this.service.getQrPayload(token);
  }

  @Post(":token/complete")
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  complete(@Req() req: any, @Param("token") token: string) {
    return this.service.complete(req.user.id, token);
  }
}
