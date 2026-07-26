import { IsEmail, IsIn, IsOptional, IsString } from "class-validator";

export class UpdateTeamMemberDto {
  @IsIn(["kepala_dapur", "staf_masak", "admin"])
  @IsOptional()
  role?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
