import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { HealthModule } from "./modules/health/health.module";
import { AppDataSource } from "./config/data-source";
import { UsersModule } from "./modules/users/users.module";
import { AuthModule } from "./modules/auth/auth.module";
import { AccessControlModule } from "./modules/access-control/access-control.module";
import { CacheModule } from "./modules/cache/cache.module";
import { StorageModule } from "./modules/storage/storage.module";
import { RealtimeModule } from "./modules/realtime/realtime.module";
import { SchedulerModule } from "./modules/scheduler/scheduler.module";
import { AiModule } from "./modules/ai/ai.module";
import { VendorsModule } from "./modules/vendors/vendors.module";
import { EligibilityModule } from "./modules/eligibility/eligibility.module";
import { OnboardingModule } from "./modules/onboarding/onboarding.module";
import { ScoringModule } from "./modules/scoring/scoring.module";
import { CheckpointsModule } from "./modules/checkpoints/checkpoints.module";
import { MissionControlModule } from "./modules/mission-control/mission-control.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(AppDataSource.options),
    HealthModule,
    UsersModule,
    AuthModule,
    AccessControlModule,
    CacheModule,
    // PHASE 1 — Fondasi
    StorageModule,
    RealtimeModule,
    SchedulerModule,
    AiModule,
    VendorsModule,
    // PHASE 2 — Dunia 1 Skinny
    EligibilityModule,
    OnboardingModule,
    ScoringModule,
    CheckpointsModule,
    MissionControlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
