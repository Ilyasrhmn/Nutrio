import { IsString, IsOptional, IsNotEmpty, IsNumber, IsObject, IsArray } from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  path: string;

  @IsString()
  @IsNotEmpty()
  icon: string;

  @IsNumber()
  @IsNotEmpty()
  order: number;

  @IsString()
  @IsOptional()
  parentId?: string | null;

  @IsString()
  @IsOptional()
  requiredPermission?: string | null;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown> | null;
}

export class UpdateMenuDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  path?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsString()
  @IsOptional()
  parentId?: string | null;

  @IsString()
  @IsOptional()
  requiredPermission?: string | null;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, unknown> | null;
}

export class AssignRolesDto {
  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  roleIds: string[];
}
