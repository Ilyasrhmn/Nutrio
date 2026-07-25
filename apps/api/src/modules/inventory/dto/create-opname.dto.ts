import { IsNumber, IsPositive, IsString, IsUUID, MinLength } from 'class-validator';

export class CreateOpnameDto {
  @IsUUID()
  productId!: string;

  @IsString()
  unit!: string;

  @IsNumber()
  @IsPositive()
  countedQuantity!: number;

  @IsString()
  @MinLength(3)
  reason!: string;
}
