import {
  IsNumber,
  IsPositive,
  IsString,
  IsUUID,
  MinLength,
} from "class-validator";

export class RecordWasteDto {
  @IsUUID()
  productId!: string;

  @IsString()
  unit!: string;

  @IsNumber()
  @IsPositive()
  quantity!: number;

  @IsString()
  @MinLength(3)
  reason!: string;
}
