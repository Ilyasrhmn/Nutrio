import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto, UpdateMenuDto, AssignRolesDto } from './dto/menu.dto';
import { AdminGuard } from '../common/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';

@Controller('menus')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get('tree')
  async findAllTree() {
    return this.menusService.findAllTree();
  }

  // New endpoint for getting current user's menu
  @UseGuards(JwtAuthGuard)
  @Get('user/me')
  async findMyMenu(@CurrentUser() user: any) {
    // Get role from authenticated user
    const roleId = user.roleId || user.role;
    return this.menusService.findUserMenu(roleId);
  }

  @Get('user/:roleId')
  async findUserMenu(@Param('roleId', ParseUUIDPipe) roleId: string) {
    return this.menusService.findUserMenu(roleId);
  }

  @Get()
  async findAll() {
    return this.menusService.findAllTree();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.menusService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post()
  async create(@Body() createMenuDto: CreateMenuDto) {
    return this.menusService.create(
      createMenuDto.name,
      createMenuDto.path,
      createMenuDto.icon,
      createMenuDto.order,
      createMenuDto.parentId,
      createMenuDto.requiredPermission,
      createMenuDto.metadata,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateMenuDto: UpdateMenuDto,
  ) {
    return this.menusService.update(
      id,
      updateMenuDto.name,
      updateMenuDto.path,
      updateMenuDto.icon,
      updateMenuDto.order,
      updateMenuDto.parentId,
      updateMenuDto.requiredPermission,
      updateMenuDto.metadata,
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.menusService.remove(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post(':id/roles')
  async assignRoles(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() assignRolesDto: AssignRolesDto,
  ) {
    return this.menusService.assignRoles(id, assignRolesDto.roleIds);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete(':id/roles/:roleId')
  async removeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    return this.menusService.removeRoles(id, [roleId]);
  }
}
