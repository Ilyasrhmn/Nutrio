import { Module } from '@nestjs/common';
import { RolesModule } from './roles/roles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { MenusModule } from './menus/menus.module';
import { RolesController } from './roles/roles.controller';
import { PermissionsController } from './permissions/permissions.controller';
import { MenusController } from './menus/menus.controller';

@Module({
  imports: [RolesModule, PermissionsModule, MenusModule],
  controllers: [RolesController, PermissionsController, MenusController],
  exports: [RolesModule, PermissionsModule, MenusModule],
})
export class AccessControlModule {}
