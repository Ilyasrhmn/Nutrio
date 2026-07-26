import { Injectable, NotFoundException } from "@nestjs/common";
import { randomUUID } from "crypto";
import { DataSource } from "typeorm";
import { StateMachineService } from "./state-machine.service";
import { VendorLifecycleStatus } from "./entities/vendor.entity";

export interface ReadinessSnapshot {
  ready: boolean;
  missingRequirements: Array<{ code: string; message: string }>;
  nextAction: string | null;
  lifecycleStatus: VendorLifecycleStatus;
}

type ReadinessEvidence = {
  lifecycle_status: VendorLifecycleStatus;
  profile_complete: boolean;
  has_active_sppg_location: boolean;
  has_valid_document: boolean;
  has_accepted_kepala_dapur: boolean;
  simulation_complete: boolean;
  has_supplier: boolean;
  has_passing_demo_inspection: boolean;
};

const REQUIREMENTS: Array<{
  code: string;
  message: string;
  evidence: keyof Omit<ReadinessEvidence, "lifecycle_status">;
}> = [
  {
    code: "PROFILE",
    message: "Profil vendor belum lengkap",
    evidence: "profile_complete",
  },
  {
    code: "SPPG_LOCATION",
    message: "Lokasi SPPG aktif belum tersedia",
    evidence: "has_active_sppg_location",
  },
  {
    code: "DOCUMENT",
    message: "Dokumen valid belum tersedia",
    evidence: "has_valid_document",
  },
  {
    code: "KEPALA_DAPUR",
    message: "Kepala dapur belum menerima undangan",
    evidence: "has_accepted_kepala_dapur",
  },
  {
    code: "SIMULATION",
    message: "Simulasi operasional belum selesai",
    evidence: "simulation_complete",
  },
  {
    code: "SUPPLIER",
    message: "Supplier terverifikasi belum terhubung",
    evidence: "has_supplier",
  },
  {
    code: "DEMO_INSPECTION",
    message: "Inspeksi demo belum lulus",
    evidence: "has_passing_demo_inspection",
  },
];

const ADVANCEABLE_STATUSES = new Set<VendorLifecycleStatus>([
  VendorLifecycleStatus.REGISTERED,
  VendorLifecycleStatus.PREPARING_DOCS,
  VendorLifecycleStatus.DOCS_SUBMITTED,
  VendorLifecycleStatus.INSPECTION_SCHEDULED,
  VendorLifecycleStatus.INSPECTION_COMPLETED,
  VendorLifecycleStatus.UNDER_REVIEW,
  VendorLifecycleStatus.APPROVED,
  VendorLifecycleStatus.ONBOARDING,
]);

@Injectable()
export class VendorReadinessService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly stateMachineService: StateMachineService,
  ) {}

  async evaluate(
    vendorId: string,
    actorUserId: string | null = null,
    correlationId?: string,
  ): Promise<ReadinessSnapshot> {
    const [evidence] = await this.dataSource.query<ReadinessEvidence[]>(
      `SELECT
         v.lifecycle_status,
         (NULLIF(BTRIM(v.phone), '') IS NOT NULL
          AND NULLIF(BTRIM(v.address_street), '') IS NOT NULL
          AND NULLIF(BTRIM(v.address_city), '') IS NOT NULL
          AND NULLIF(BTRIM(v.address_province), '') IS NOT NULL) AS profile_complete,
         EXISTS (
           SELECT 1 FROM sppg_locations sl
           WHERE sl.vendor_id = v.id AND sl.is_active = true
         ) AS has_active_sppg_location,
         EXISTS (
           SELECT 1 FROM documents d
           WHERE d.vendor_id = v.id
             AND d.status = 'verified'
             AND (d.expires_at IS NULL OR d.expires_at >= CURRENT_DATE)
         ) AS has_valid_document,
         EXISTS (
           SELECT 1 FROM vendor_team_members tm
           WHERE tm.vendor_id = v.id
             AND tm.role = 'kepala_dapur'
             AND tm.status = 'accepted'
         ) AS has_accepted_kepala_dapur,
         COALESCE((
           SELECT op.step3_done FROM onboarding_progress op WHERE op.vendor_id = v.id
         ), false) AS simulation_complete,
         EXISTS (
           SELECT 1
           FROM vendor_supplier_connections vsc
           JOIN suppliers s ON s.id = vsc.supplier_id AND s.status = 'verified'
           WHERE vsc.vendor_id = v.id
         ) AS has_supplier,
         EXISTS (
           SELECT 1 FROM inspections i
           WHERE i.vendor_id = v.id
             AND i.status = 'completed'
             AND i.critical_fails = 0
             AND i.inspection_score >= 80
         ) AS has_passing_demo_inspection
       FROM vendors v
       WHERE v.id = $1 AND v.deleted_at IS NULL`,
      [vendorId],
    );
    if (!evidence)
      throw new NotFoundException(`Vendor ${vendorId} tidak ditemukan`);

    const missingRequirements = REQUIREMENTS.filter(
      (requirement) => !evidence[requirement.evidence],
    ).map(({ code, message }) => ({ code, message }));
    const ready = missingRequirements.length === 0;
    let lifecycleStatus = evidence.lifecycle_status;

    if (
      ready &&
      lifecycleStatus !== VendorLifecycleStatus.ACTIVE &&
      ADVANCEABLE_STATUSES.has(lifecycleStatus)
    ) {
      await this.stateMachineService.advanceTo(
        vendorId,
        VendorLifecycleStatus.ACTIVE,
        actorUserId,
        "system",
        "Vendor memenuhi seluruh persyaratan onboarding",
        correlationId ?? randomUUID(),
      );
      lifecycleStatus = VendorLifecycleStatus.ACTIVE;
    }

    return {
      ready,
      missingRequirements,
      nextAction: missingRequirements[0]?.message ?? null,
      lifecycleStatus,
    };
  }
}
