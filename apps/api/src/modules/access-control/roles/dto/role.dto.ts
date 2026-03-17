import { IsString, IsOptional, IsArray, IsNotEmpty, MinLength } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;
}

export class AddPermissionsDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  permissionIds: string[];
}

export class RemovePermissionsDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  permissionIds: string[];
}
