import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsDateString, IsInt, IsNumber, IsPositive, IsString, IsUUID, Min, ValidateNested } from 'class-validator';

class MenuPlanItemDto {
  @IsUUID() productId!: string;
  @IsString() unit!: string;
  @IsNumber() @IsPositive() quantityPerPax!: number;
}

export class UpsertMenuPlanDto {
  @IsDateString() operationDate!: string;
  @IsInt() @Min(1) targetPax!: number;
  @IsArray() @ArrayMinSize(1) @ValidateNested({ each: true }) @Type(() => MenuPlanItemDto)
  items!: MenuPlanItemDto[];
}
