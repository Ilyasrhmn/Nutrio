import { ArrayMinSize, IsArray, IsNotEmpty, IsString } from "class-validator";

export class VendorActionDto {
  @IsString()
  @IsNotEmpty()
  reason!: string;
}

export class RevisionRequestDto extends VendorActionDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  missingRequirements!: string[];
}
