import { Module } from '@nestjs/common'; import { MenuPlansController } from './menu-plans.controller'; import { MenuPlansService } from './menu-plans.service';
@Module({ controllers: [MenuPlansController], providers: [MenuPlansService], exports: [MenuPlansService] }) export class MenuPlansModule {}
