import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from "class-validator";

export class UploadDocumentDto {
  @IsIn(["pirt", "halal", "bpom", "nib", "siup", "npwp", "other"])
  docType!: string;

  @IsString()
  @IsOptional()
  docNumber?: string;

  @IsString()
  @IsNotEmpty()
  fileKey!: string;

  @IsString()
  @IsNotEmpty()
  fileHash!: string;

  @IsInt()
  @Min(1)
  @Max(10 * 1024 * 1024)
  @IsOptional()
  fileSizeBytes?: number;

  @IsIn(["application/pdf", "image/jpeg", "image/png", "image/webp"])
  @IsOptional()
  mimeType?: string;
}
