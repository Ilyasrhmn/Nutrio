import { IsOptional, IsString } from 'class-validator';

export class SubmitCheckpointDto {
  @IsOptional()
  @IsString()
  gpsLat?: string;

  @IsOptional()
  @IsString()
  gpsLng?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
