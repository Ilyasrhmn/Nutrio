import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { CheckpointsService } from './checkpoints.service';
import { SubmitCheckpointDto } from './dto/submit-checkpoint.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DataSource } from 'typeorm';
import { CpType } from './entities/checkpoint-event.entity';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
}

const VALID_CP_TYPES: CpType[] = ['CP1', 'CP2', 'CP3', 'CP4'];

@Controller('checkpoints')
@UseGuards(JwtAuthGuard)
export class CheckpointsController {
  constructor(
    private readonly checkpointsService: CheckpointsService,
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
    return this.checkpointsService.getCheckpointState(vendorId);
  }

  @Post(':cpType/submit')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  async submit(
    @CurrentUser() user: JwtPayload,
    @Param('cpType') cpType: string,
    @UploadedFile() photo: Express.Multer.File,
    @Body() dto: SubmitCheckpointDto,
  ) {
    if (!VALID_CP_TYPES.includes(cpType as CpType)) {
      throw new BadRequestException(
        `cpType harus salah satu dari: ${VALID_CP_TYPES.join(', ')}`,
      );
    }
    if (!photo) throw new BadRequestException('File foto diperlukan');
    const vendorId = await this.getVendorId(user.sub);
    return this.checkpointsService.submitCheckpoint(
      vendorId,
      cpType as CpType,
      photo,
      dto.gpsLat,
      dto.gpsLng,
    );
  }
}
