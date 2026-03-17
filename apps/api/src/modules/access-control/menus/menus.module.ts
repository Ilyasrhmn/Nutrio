import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Menu, RoleMenu } from '../roles/entities/menu.entity';
import { Role } from '../roles/entities/role.entity';
import { MenusService } from './menus.service';
import { MenusController } from './menus.controller';
import { CacheModule } from '../../cache/cache.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu, RoleMenu, Role]),
    CacheModule,
  ],
  controllers: [MenusController],
  providers: [MenusService],
  exports: [MenusService, TypeOrmModule],
})
export class MenusModule {}