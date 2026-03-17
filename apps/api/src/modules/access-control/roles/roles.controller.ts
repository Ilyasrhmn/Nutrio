import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { CreateRoleDto, UpdateRoleDto, AddPermissionsDto, RemovePermissionsDto } from './dto/role.dto';
import { AdminGuard } from '../common/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    
    // Validate pagination parameters
    if (isNaN(pageNum) || pageNum < 1) {
      throw new Error('Invalid page parameter');
    }
    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      throw new Error('Invalid limit parameter (must be 1-100)');
    }
    
    return this.rolesService.findAll(pageNum, limitNum, search);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto.name, createRoleDto.description);
  }

  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto.name, updateRoleDto.description);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.rolesService.remove(id);
  }

  @Get(':id/permissions')
  async getPermissions(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.getRolePermissions(id);
  }

  @Post(':id/permissions')
  async addPermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() addPermissionsDto: AddPermissionsDto,
  ) {
    return this.rolesService.addPermissions(id, addPermissionsDto.permissionIds);
  }

  @Delete(':id/permissions')
  async removePermissions(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() removePermissionsDto: RemovePermissionsDto,
  ) {
    return this.rolesService.removePermissions(id, removePermissionsDto.permissionIds);
  }
}
