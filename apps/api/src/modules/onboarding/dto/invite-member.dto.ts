import { IsEmail, IsIn, IsString, IsOptional } from 'class-validator';

export class InviteMemberDto {
  @IsEmail()
  email!: string;

  @IsIn(['kepala_dapur', 'staf_masak', 'admin'])
  role!: string;

  @IsString()
  @IsOptional()
  phone?: string;
}
