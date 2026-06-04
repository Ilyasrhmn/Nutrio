import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class Step1ProfileDto {
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @IsString()
  @IsNotEmpty()
  addressStreet!: string;

  @IsString()
  @IsNotEmpty()
  addressCity!: string;

  @IsString()
  @IsNotEmpty()
  addressProvince!: string;

  @IsString()
  @IsOptional()
  logoUrl?: string;
}
