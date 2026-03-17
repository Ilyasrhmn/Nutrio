import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu, RoleMenu } from '../roles/entities/menu.entity';
import { Role } from '../roles/entities/role.entity';
import { MenusService } from './menus.service';

@Module({
  imports: [TypeOrmModule.forFeature([Menu, RoleMenu, Role])],
  providers: [MenusService],
  exports: [MenusService, TypeOrmModule],
})
export class MenusModule {}
