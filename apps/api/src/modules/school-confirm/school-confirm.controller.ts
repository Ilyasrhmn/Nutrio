import { Controller, Get, Post, Param, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { IsEnum, IsInt, IsOptional, IsArray, IsString, Min } from 'class-validator';
import { SchoolConfirmService } from './school-confirm.service';

class ConfirmDto {
  @IsInt()
  @Min(0)
  jumlahDiterima!: number;

  @IsEnum(['baik', 'ada_masalah'])
  kondisi!: 'baik' | 'ada_masalah';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  masalahJenis?: string[];

  @IsOptional()
  @IsString()
  catatan?: string;
}

@Controller('sekolah/confirm')
export class SchoolConfirmController {
  constructor(private readonly service: SchoolConfirmService) {}

  @Get(':qrToken')
  getInfo(@Param('qrToken') qrToken: string) {
    return this.service.getDeliveryInfo(qrToken);
  }

  @Post(':qrToken')
  @HttpCode(HttpStatus.OK)
  confirm(@Param('qrToken') qrToken: string, @Body() body: ConfirmDto) {
    return this.service.confirm(qrToken, body);
  }
}
