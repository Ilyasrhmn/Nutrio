import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Role, Permission } from './entities/role.entity';
import { RolePermission } from './entities/role-permission.entity';
import { RolesService } from './roles.service';
import { CacheModule } from '../../cache/cache.module';

@Module({
  imports: [TypeOrmModule.forFeature([Role, Permission, RolePermission]), CacheModule],
  providers: [RolesService],
  exports: [RolesService, TypeOrmModule],
})
export class RolesModule {}
