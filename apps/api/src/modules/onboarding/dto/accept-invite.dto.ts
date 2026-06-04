import { IsString, MinLength, IsOptional } from 'class-validator';

export class AcceptInviteDto {
  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsOptional()
  fullName?: string;
}
