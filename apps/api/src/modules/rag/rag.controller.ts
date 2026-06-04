import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { RagService } from './rag.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

class QueryDto {
  @IsString() @IsNotEmpty() question!: string;
}

class ProactiveDto {
  @IsString() @IsNotEmpty() feature!: string;
}

class IngestDto {
  @IsString() @IsNotEmpty() docName!: string;
  @IsString() @IsNotEmpty() content!: string;
  @IsOptional() @IsString() sourcePasal?: string;
}

@UseGuards(JwtAuthGuard)
@Controller('rag')
export class RagController {
  constructor(private readonly service: RagService) {}

  @Post('query')
  query(@Body() dto: QueryDto) {
    return this.service.query(dto.question);
  }

  @Post('proactive')
  proactive(@Body() dto: ProactiveDto) {
    return this.service.proactive(dto.feature);
  }

  @Post('admin/ingest')
  ingest(@Body() dto: IngestDto) {
    return this.service.ingest(dto.docName, dto.content, dto.sourcePasal);
  }
}
