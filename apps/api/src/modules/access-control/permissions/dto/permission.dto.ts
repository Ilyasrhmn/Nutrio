import { IsString, IsOptional, IsNotEmpty, IsEnum } from 'class-validator';

export class CreatePermissionDto {
  @IsString()
  @IsNotEmpty()
  action: string;

  @IsString()
  @IsNotEmpty()
  subject: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdatePermissionDto {
  @IsString()
  @IsNotEmpty()
  description: string;
}
