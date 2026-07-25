import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import { CheckpointEvent, CpType } from "./entities/checkpoint-event.entity";
import { DeliveryToken } from "./entities/delivery-token.entity";
import { StorageService } from "../storage/storage.service";
import { VisionService } from "../ai/vision.service";
import { ScoringService } from "../scoring/scoring.service";
import { RealtimeService } from "../realtime/realtime.service";
import { DebriefService } from "../debrief/debrief.service";
import * as path from "path";
import { OperationDaysService } from "../operation-days/operation-days.service";
import { AuditService } from "../../common/audit/audit.service";

const CP_ORDER: CpType[] = ["CP1", "CP2", "CP3", "CP4"];

@Injectable()
export class CheckpointsService {
  private readonly logger = new Logger(CheckpointsService.name);

  constructor(
    @InjectRepository(CheckpointEvent)
    private readonly cpRepo: Repository<CheckpointEvent>,
    @InjectRepository(DeliveryToken)
    private readonly tokenRepo: Repository<DeliveryToken>,
    private readonly dataSource: DataSource,
    private readonly storageService: StorageService,
    private readonly visionService: VisionService,
    private readonly scoringService: ScoringService,
    private readonly realtimeService: RealtimeService,
    private readonly debriefService: DebriefService,
    private readonly operationDays: OperationDaysService,
    private readonly audit: AuditService,
  ) {}

  static cpOrderIndex(cpType: CpType): number {
    return CP_ORDER.indexOf(cpType);
  }

  static previousCpRequired(cpType: CpType): CpType | null {
    const idx = CP_ORDER.indexOf(cpType);
    return idx > 0 ? (CP_ORDER[idx - 1] as CpType) : null;
  }

  private todayString(): string {
    return new Date().toISOString().split("T")[0] as string;
  }

  private async getPrimarySppgLocation(
    vendorId: string,
  ): Promise<{ id: string; targetPorsi: number; assignedSchools: string[] }> {
    const [sppg] = await this.dataSource.query(
      `SELECT id, target_porsi, assigned_schools FROM sppg_locations WHERE vendor_id = $1 AND is_active = true LIMIT 1`,
      [vendorId],
    );
    if (!sppg)
      throw new NotFoundException(
        "SPPG location belum tersedia untuk vendor ini",
      );
    return {
      id: sppg.id,
      targetPorsi: sppg.target_porsi ?? 100,
      assignedSchools: sppg.assigned_schools ?? [],
    };
  }

  async getCheckpointState(vendorId: string): Promise<CheckpointEvent[]> {
    const today = this.todayString();
    const sppg = await this.getPrimarySppgLocation(vendorId);
    return this.cpRepo
      .createQueryBuilder("cp")
      .where("cp.vendorId = :vendorId", { vendorId })
      .andWhere("cp.sppgLocationId = :sppgId", { sppgId: sppg.id })
      .andWhere(`cp.createdAt::date = :today::date`, { today })
      .orderBy("cp.cpType", "ASC")
      .getMany();
  }

  async submitCheckpoint(
    vendorId: string,
    cpType: CpType,
    file: Express.Multer.File,
    gpsLat?: string,
    gpsLng?: string,
    userId?: string,
  ): Promise<CheckpointEvent> {
    const sppg = await this.getPrimarySppgLocation(vendorId);
    const today = this.todayString();
    // Validate ordering
    const prevRequired = CheckpointsService.previousCpRequired(cpType);
    if (prevRequired) {
      const [prev] = await this.dataSource.query(
        `SELECT id, cp_status FROM checkpoint_events
         WHERE vendor_id = $1 AND sppg_location_id = $2 AND cp_type = $3 AND created_at::date = $4::date`,
        [vendorId, sppg.id, prevRequired, today],
      );
      if (!prev || prev.cp_status !== "done") {
        throw new BadRequestException(
          `${prevRequired} harus selesai sebelum ${cpType}`,
        );
      }
    }

    // Golden Rule check for CP2
    if (cpType === "CP2") {
      const [cp1] = await this.dataSource.query(
        `SELECT completed_at FROM checkpoint_events
         WHERE vendor_id = $1 AND sppg_location_id = $2 AND cp_type = 'CP1' AND cp_status = 'done' AND created_at::date = $3::date`,
        [vendorId, sppg.id, today],
      );
      if (cp1?.completed_at) {
        const diffHours =
          (Date.now() - new Date(cp1.completed_at).getTime()) / 3_600_000;
        if (diffHours > 4) {
          await this.scoringService.applyPenalty(
            vendorId,
            "GOLDEN_RULE_VIOLATION",
          );
        }
      }
    }

    // Upload photo
    const ext = path.extname(file.originalname).toLowerCase() || ".jpg";
    const key = `checkpoints/${vendorId}/${cpType}/${today}${ext}`;
    const uploadResult = await this.storageService.upload(
      file.buffer,
      key,
      file.mimetype,
    );

    // Persist the checkpoint and its CP1 inventory mutation as one database transaction.
    const now = new Date();
    const saved: any = await this.dataSource.transaction(async (manager) => {
      const day = await this.operationDays.activeForVendor(manager, vendorId);
      if (cpType === "CP1")
        await this.operationDays.consumeForCp1(manager, day.id, userId ?? "");
      const [checkpoint] = await manager.query(
        `INSERT INTO checkpoint_events (vendor_id, sppg_location_id, operation_day_id, cp_type, cp_status, photos, started_at, completed_at)
         VALUES ($1, $2, $3, $4, 'done', $5::jsonb, $6, $6)
         ON CONFLICT (vendor_id, sppg_location_id, cp_type, ((created_at AT TIME ZONE 'UTC')::date)) DO UPDATE
           SET cp_status = 'done', photos = EXCLUDED.photos, completed_at = EXCLUDED.completed_at,
               operation_day_id = EXCLUDED.operation_day_id
         RETURNING *`,
        [
          vendorId,
          sppg.id,
          day.id,
          cpType,
          JSON.stringify([uploadResult]),
          now,
        ],
      );
      await this.audit.record(manager, {
        actorUserId: userId,
        aggregateType: "checkpoint",
        aggregateId: checkpoint.id,
        action: "checkpoint.completed",
        after: { operationDayId: day.id, cpType, status: checkpoint.cp_status },
      });
      return checkpoint;
    });

    // Async AI validation (fire and forget)
    this.validatePhotoAsync(
      vendorId,
      saved.id,
      uploadResult.fileUrl,
      cpType,
    ).catch((e) =>
      this.logger.error(`AI validation failed for ${saved.id}: ${e.message}`),
    );

    // Broadcast to Mission Control
    this.realtimeService.broadcastToVendor(vendorId, "mc:checkpoint:update", {
      cpType,
      status: "done",
      completedAt: now,
      sppgLocationId: sppg.id,
    });

    // CP3 side effect: generate delivery tokens
    if (cpType === "CP3") {
      await this.generateDeliveryTokens(vendorId, sppg, saved.operation_day_id);
    }

    // CP4 side effect: auto-generate daily debrief
    if (cpType === "CP4") {
      this.debriefService
        .generate(vendorId, today)
        .catch((e) =>
          this.logger.error(
            `[checkpoints] Auto debrief failed for ${vendorId}: ${e.message}`,
          ),
        );
    }

    return saved;
  }

  private async validatePhotoAsync(
    vendorId: string,
    checkpointId: string,
    fileUrl: string,
    cpType: CpType,
  ): Promise<void> {
    const result = await this.visionService.validatePhoto(fileUrl, {
      feature: "checkpoint",
      cpType,
      vendorId,
    });
    const validation = {
      ...result,
      model: process.env.AI_MODEL ?? "mock",
      version: "v1",
    };
    await this.dataSource.query(
      `UPDATE checkpoint_events SET ai_validation = $1::jsonb WHERE id = $2`,
      [JSON.stringify(validation), checkpointId],
    );
    if (!result.pass && result.confidence < 0.5) {
      const [checkpoint] = await this.dataSource.query(
        `SELECT operation_day_id FROM checkpoint_events WHERE id = $1`,
        [checkpointId],
      );
      await this.dataSource.query(
        `INSERT INTO incidents (vendor_id, operation_day_id, source_type, source_id, severity, reason)
         VALUES ($1, $2, 'checkpoint', $3, 'critical', $4)`,
        [
          vendorId,
          checkpoint?.operation_day_id ?? null,
          checkpointId,
          result.reason,
        ],
      );
      await this.scoringService.applyPenalty(vendorId, "PHOTO_QUALITY_POOR");
    }
  }

  private async generateDeliveryTokens(
    vendorId: string,
    sppg: { id: string; targetPorsi: number; assignedSchools: string[] },
    operationDayId: string,
  ): Promise<void> {
    const expiredAt = new Date();
    expiredAt.setHours(expiredAt.getHours() + 4);
    const schools =
      sppg.assignedSchools.length > 0
        ? sppg.assignedSchools
        : ["default-school"];
    for (const schoolId of schools) {
      await this.dataSource.query(
        `INSERT INTO delivery_tokens (vendor_id, sppg_location_id, operation_day_id, school_id, porsi_count, expired_at)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (operation_day_id, school_id) DO NOTHING`,
        [
          vendorId,
          sppg.id,
          operationDayId,
          schoolId,
          sppg.targetPorsi,
          expiredAt,
        ],
      );
    }
    await this.dataSource.query(
      `UPDATE operation_days SET status = 'dispatched', updated_at = NOW() WHERE id = $1`,
      [operationDayId],
    );
    this.logger.log(
      `[checkpoints] Generated ${schools.length} delivery token(s) for vendor ${vendorId}`,
    );
  }

  async forceCloseAll(): Promise<void> {
    const today = this.todayString();
    await this.dataSource.query(
      `UPDATE checkpoint_events
       SET cp_status = 'force_closed'
       WHERE cp_status IN ('pending', 'in_progress') AND created_at::date = $1::date`,
      [today],
    );
  }
}
