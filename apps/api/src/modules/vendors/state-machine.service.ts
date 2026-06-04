import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Vendor, VendorLifecycleStatus } from './entities/vendor.entity';

// ─── Allowed transitions ─────────────────────────────────────────────────────
const ALLOWED_TRANSITIONS: Record<VendorLifecycleStatus, VendorLifecycleStatus[]> = {
  [VendorLifecycleStatus.ANONYMOUS]: [VendorLifecycleStatus.ELIGIBILITY_CHECKED],
  [VendorLifecycleStatus.ELIGIBILITY_CHECKED]: [VendorLifecycleStatus.REGISTERED],
  [VendorLifecycleStatus.REGISTERED]: [VendorLifecycleStatus.PREPARING_DOCS],
  [VendorLifecycleStatus.PREPARING_DOCS]: [VendorLifecycleStatus.DOCS_SUBMITTED],
  [VendorLifecycleStatus.DOCS_SUBMITTED]: [VendorLifecycleStatus.INSPECTION_SCHEDULED],
  [VendorLifecycleStatus.INSPECTION_SCHEDULED]: [VendorLifecycleStatus.INSPECTION_COMPLETED],
  [VendorLifecycleStatus.INSPECTION_COMPLETED]: [VendorLifecycleStatus.UNDER_REVIEW],
  [VendorLifecycleStatus.UNDER_REVIEW]: [
    VendorLifecycleStatus.APPROVED,
    VendorLifecycleStatus.REVISION_REQUESTED,
  ],
  [VendorLifecycleStatus.REVISION_REQUESTED]: [VendorLifecycleStatus.PREPARING_DOCS],
  [VendorLifecycleStatus.APPROVED]: [VendorLifecycleStatus.ONBOARDING],
  [VendorLifecycleStatus.ONBOARDING]: [VendorLifecycleStatus.ACTIVE],
  [VendorLifecycleStatus.ACTIVE]: [
    VendorLifecycleStatus.SUSPENDED,
    VendorLifecycleStatus.REVOKED,
  ],
  [VendorLifecycleStatus.SUSPENDED]: [
    VendorLifecycleStatus.ACTIVE,
    VendorLifecycleStatus.REVOKED,
  ],
  [VendorLifecycleStatus.REVOKED]: [],
};

export interface TransitionResult {
  vendorId: string;
  from: VendorLifecycleStatus;
  to: VendorLifecycleStatus;
  timestamp: Date;
}

@Injectable()
export class StateMachineService {
  constructor(
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    private readonly dataSource: DataSource,
  ) {}

  async getLifecycleStatus(vendorId: string): Promise<VendorLifecycleStatus> {
    const vendor = await this.vendorRepo.findOne({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException(`Vendor ${vendorId} tidak ditemukan`);
    return vendor.lifecycleStatus;
  }

  async transition(
    vendorId: string,
    to: VendorLifecycleStatus,
    actorId: string,
    reason?: string,
  ): Promise<TransitionResult> {
    const vendor = await this.vendorRepo.findOne({ where: { id: vendorId } });
    if (!vendor) throw new NotFoundException(`Vendor ${vendorId} tidak ditemukan`);

    const from = vendor.lifecycleStatus;
    const allowed = ALLOWED_TRANSITIONS[from] ?? [];

    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Transisi dari ${from} ke ${to} tidak diizinkan. Transisi yang valid: [${allowed.join(', ')}]`,
      );
    }

    const now = new Date();

    // Update lifecycle status
    await this.vendorRepo.update(vendorId, { lifecycleStatus: to });

    // Append-only audit log (bypass TypeORM to avoid trigger conflicts)
    await this.dataSource.query(
      `INSERT INTO audit_logs
         (actor_id, entity_type, entity_id, action, old_value, new_value, diff, notes)
       VALUES ($1, 'vendors', $2, 'status_changed', $3, $4, $5, $6)`,
      [
        actorId,
        vendorId,
        JSON.stringify({ lifecycle_status: from }),
        JSON.stringify({ lifecycle_status: to }),
        JSON.stringify({ field: 'lifecycle_status', from, to }),
        reason ?? null,
      ],
    );

    return { vendorId, from, to, timestamp: now };
  }

  canTransition(from: VendorLifecycleStatus, to: VendorLifecycleStatus): boolean {
    return (ALLOWED_TRANSITIONS[from] ?? []).includes(to);
  }

  getAllowedTransitions(from: VendorLifecycleStatus): VendorLifecycleStatus[] {
    return ALLOWED_TRANSITIONS[from] ?? [];
  }

  // Resolve vendor's target portal route based on lifecycle status
  static resolvePortalRoute(status: VendorLifecycleStatus): string {
    switch (status) {
      case VendorLifecycleStatus.ANONYMOUS:
      case VendorLifecycleStatus.ELIGIBILITY_CHECKED:
        return '/eligibility';
      case VendorLifecycleStatus.REGISTERED:
      case VendorLifecycleStatus.PREPARING_DOCS:
      case VendorLifecycleStatus.DOCS_SUBMITTED:
      case VendorLifecycleStatus.INSPECTION_SCHEDULED:
      case VendorLifecycleStatus.INSPECTION_COMPLETED:
      case VendorLifecycleStatus.UNDER_REVIEW:
      case VendorLifecycleStatus.REVISION_REQUESTED:
      case VendorLifecycleStatus.APPROVED:
        return '/portal/status';
      case VendorLifecycleStatus.ONBOARDING:
        return '/portal/onboarding';
      case VendorLifecycleStatus.ACTIVE:
        return '/portal/mission-control';
      case VendorLifecycleStatus.SUSPENDED:
        return '/portal/suspended';
      case VendorLifecycleStatus.REVOKED:
        return '/portal/revoked';
      default:
        return '/portal';
    }
  }
}
