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
import { NotificationsModule } from "./modules/notifications/notifications.module";
import { DeliveryModule } from "./modules/delivery/delivery.module";
import { SchoolConfirmModule } from "./modules/school-confirm/school-confirm.module";
import { DebriefModule } from "./modules/debrief/debrief.module";
import { CommandCenterModule } from "./modules/command-center/command-center.module";
import { PublicModule } from "./modules/public/public.module";
import { RagModule } from "./modules/rag/rag.module";
import { FundsModule } from "./modules/funds/funds.module";
import { SuppliersModule } from "./modules/suppliers/suppliers.module";

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
    // PHASE 4 — Closing the Loop
    NotificationsModule,
    DeliveryModule,
    SchoolConfirmModule,
    DebriefModule,
    // PHASE 5 — Dunia 3 + Public
    CommandCenterModule,
    PublicModule,
    // PHASE 6 — RAG Assistant
    RagModule,
    // PHASE 7 — Funds Transparency
    FundsModule,
    // Supplier Marketplace
    SuppliersModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
