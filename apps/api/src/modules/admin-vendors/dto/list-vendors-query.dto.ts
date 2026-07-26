import {
  IsBooleanString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";
import { Type } from "class-transformer";
import { VendorLifecycleStatus } from "../../vendors/entities/vendor.entity";

export class ListVendorsQueryDto {
  @IsOptional()
  @IsEnum(VendorLifecycleStatus)
  lifecycleStatus?: VendorLifecycleStatus;

  @IsOptional()
  @IsBooleanString()
  ready?: string;

  @IsOptional()
  @IsString()
  province?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit = 20;
}
