import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource } from "typeorm";
import * as bcrypt from "bcrypt";
import { OnboardingProgress } from "./entities/onboarding-progress.entity";
import { VendorTeamMember } from "./entities/vendor-team-member.entity";
import {
  ReadinessSnapshot,
  VendorReadinessService,
} from "../vendors/vendor-readiness.service";
import { UsersService } from "../users/users.service";
import { Step1ProfileDto } from "./dto/step1-profile.dto";
import { InviteMemberDto } from "./dto/invite-member.dto";
import { AcceptInviteDto } from "./dto/accept-invite.dto";
import { ConnectSupplierDto } from "./dto/connect-supplier.dto";
import { UploadDocumentDto } from "./dto/upload-document.dto";
import { UpdateTeamMemberDto } from "./dto/update-team-member.dto";

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingProgress)
    private readonly progressRepo: Repository<OnboardingProgress>,
    @InjectRepository(VendorTeamMember)
    private readonly teamMemberRepo: Repository<VendorTeamMember>,
    private readonly vendorReadinessService: VendorReadinessService,
    private readonly dataSource: DataSource,
    private readonly usersService: UsersService,
  ) {}

  async getOrCreateProgress(vendorId: string): Promise<OnboardingProgress> {
    let progress = await this.progressRepo.findOne({ where: { vendorId } });
    if (!progress) {
      progress = this.progressRepo.create({
        vendorId,
        step1Done: false,
        step2Done: false,
        step3Done: false,
        step4Done: false,
        step5Done: false,
        completedAt: null,
      });
      progress = await this.progressRepo.save(progress);
    }
    return progress;
  }

  async getState(vendorId: string): Promise<OnboardingProgress> {
    return this.getOrCreateProgress(vendorId);
  }

  async completeStep1Profile(
    vendorId: string,
    dto: Step1ProfileDto,
    actorUserId: string,
  ): Promise<ReadinessSnapshot> {
    if (dto.logoUrl) {
      await this.dataSource.query(
        `UPDATE vendors SET phone = $1, address_street = $2, address_city = $3, address_province = $4, logo_url = $5 WHERE id = $6`,
        [
          dto.phone,
          dto.addressStreet,
          dto.addressCity,
          dto.addressProvince,
          dto.logoUrl,
          vendorId,
        ],
      );
    } else {
      await this.dataSource.query(
        `UPDATE vendors SET phone = $1, address_street = $2, address_city = $3, address_province = $4 WHERE id = $5`,
        [
          dto.phone,
          dto.addressStreet,
          dto.addressCity,
          dto.addressProvince,
          vendorId,
        ],
      );
    }

    const progress = await this.getOrCreateProgress(vendorId);
    progress.step1Done = true;
    await this.progressRepo.save(progress);
    return this.vendorReadinessService.evaluate(vendorId, actorUserId);
  }

  async inviteTeamMember(
    vendorId: string,
    dto: InviteMemberDto,
    actorUserId: string,
  ): Promise<ReadinessSnapshot> {
    const member = this.teamMemberRepo.create({
      vendorId,
      role: dto.role,
      inviteEmail: dto.email,
      invitePhone: dto.phone ?? null,
      inviteSentAt: new Date(),
      status: "pending",
    });
    await this.teamMemberRepo.save(member);
    return this.vendorReadinessService.evaluate(vendorId, actorUserId);
  }

  async getTeamStatus(vendorId: string): Promise<VendorTeamMember[]> {
    return this.teamMemberRepo.find({ where: { vendorId } });
  }

  async acceptInvite(
    inviteToken: string,
    dto: AcceptInviteDto,
  ): Promise<ReadinessSnapshot> {
    const member = await this.teamMemberRepo.findOne({
      where: { inviteToken, status: "pending" },
    });
    if (!member) {
      throw new NotFoundException(
        "Undangan tidak ditemukan atau sudah tidak berlaku",
      );
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const roles = await this.dataSource.query(
      `SELECT id FROM roles WHERE name = 'vendor' LIMIT 1`,
    );
    const roleId = roles?.[0]?.id;

    const email = member.inviteEmail ?? `${inviteToken}@vendor.nutrio.id`;
    const fullName = dto.fullName ?? member.inviteEmail ?? "Team Member";

    const newUser = await this.usersService.create({
      email,
      passwordHash,
      fullName,
      roleId,
      roleLegacy: "vendor" as any,
    });

    member.status = "accepted";
    member.userId = newUser.id;
    member.acceptedAt = new Date();
    await this.teamMemberRepo.save(member);

    const acceptedKepala = await this.teamMemberRepo.count({
      where: {
        vendorId: member.vendorId,
        role: "kepala_dapur",
        status: "accepted",
      },
    });
    if (acceptedKepala >= 1) {
      const progress = await this.getOrCreateProgress(member.vendorId);
      if (!progress.step2Done) {
        progress.step2Done = true;
        await this.progressRepo.save(progress);
      }
    }

    return this.vendorReadinessService.evaluate(member.vendorId, newUser.id);
  }

  async completeStep3(
    vendorId: string,
    actorUserId: string,
  ): Promise<ReadinessSnapshot> {
    const progress = await this.getOrCreateProgress(vendorId);
    if (!progress.step2Done) {
      throw new BadRequestException("Step 2 harus selesai terlebih dahulu");
    }
    progress.step3Done = true;
    await this.progressRepo.save(progress);
    return this.vendorReadinessService.evaluate(vendorId, actorUserId);
  }

  async connectSupplier(
    vendorId: string,
    dto: ConnectSupplierDto,
    actorUserId: string,
  ): Promise<ReadinessSnapshot> {
    const progress = await this.getOrCreateProgress(vendorId);
    if (!progress.step3Done) {
      throw new BadRequestException("Step 3 harus selesai terlebih dahulu");
    }

    const suppliers = await this.dataSource.query(
      `SELECT id FROM suppliers WHERE id = $1 AND status = 'verified'`,
      [dto.supplierId],
    );
    if (!suppliers || suppliers.length === 0) {
      throw new NotFoundException(
        "Supplier tidak ditemukan atau belum terverifikasi",
      );
    }

    await this.dataSource.query(
      `INSERT INTO vendor_supplier_connections (vendor_id, supplier_id, connected_by)
       VALUES ($1, $2, $3)
       ON CONFLICT (vendor_id, supplier_id) DO NOTHING`,
      [vendorId, dto.supplierId, actorUserId],
    );

    progress.step4Done = true;
    await this.progressRepo.save(progress);
    return this.vendorReadinessService.evaluate(vendorId, actorUserId);
  }

  async uploadDocument(
    vendorId: string,
    dto: UploadDocumentDto,
    actorUserId: string,
  ): Promise<ReadinessSnapshot> {
    if (dto.fileKey.includes("://")) {
      throw new BadRequestException(
        "Dokumen harus disimpan dengan object key, bukan URL publik",
      );
    }

    await this.dataSource.query(
      `INSERT INTO documents
         (vendor_id, doc_type, doc_number, file_url, file_key, file_hash, file_size_bytes, mime_type)
       VALUES ($1, $2, $3, $4, $4, $5, $6, $7)`,
      [
        vendorId,
        dto.docType,
        dto.docNumber ?? null,
        dto.fileKey,
        dto.fileHash,
        dto.fileSizeBytes ?? null,
        dto.mimeType ?? null,
      ],
    );
    return this.vendorReadinessService.evaluate(vendorId, actorUserId);
  }

  async getDocuments(vendorId: string): Promise<unknown[]> {
    return this.dataSource.query(
      `SELECT id, doc_type AS "docType", doc_number AS "docNumber", file_key AS "fileKey",
              file_hash AS "fileHash", file_size_bytes AS "fileSizeBytes", mime_type AS "mimeType",
              status, issued_at AS "issuedAt", expires_at AS "expiresAt", uploaded_at AS "uploadedAt"
       FROM documents
       WHERE vendor_id = $1
       ORDER BY uploaded_at DESC`,
      [vendorId],
    );
  }

  async resendTeamMemberInvite(
    vendorId: string,
    memberId: string,
    actorUserId: string,
  ): Promise<ReadinessSnapshot> {
    const member = await this.getOwnedTeamMember(vendorId, memberId);
    if (member.status !== "pending") {
      throw new BadRequestException(
        "Hanya undangan pending yang dapat dikirim ulang",
      );
    }
    member.inviteSentAt = new Date();
    await this.teamMemberRepo.save(member);
    return this.vendorReadinessService.evaluate(vendorId, actorUserId);
  }

  async removeTeamMember(
    vendorId: string,
    memberId: string,
    actorUserId: string,
  ): Promise<ReadinessSnapshot> {
    const member = await this.getOwnedTeamMember(vendorId, memberId);
    await this.teamMemberRepo.remove(member);
    return this.vendorReadinessService.evaluate(vendorId, actorUserId);
  }

  async updateTeamMember(
    vendorId: string,
    memberId: string,
    dto: UpdateTeamMemberDto,
    actorUserId: string,
  ): Promise<ReadinessSnapshot> {
    const member = await this.getOwnedTeamMember(vendorId, memberId);
    if (dto.role !== undefined) member.role = dto.role;
    if (dto.email !== undefined) member.inviteEmail = dto.email;
    if (dto.phone !== undefined) member.invitePhone = dto.phone;
    await this.teamMemberRepo.save(member);
    return this.vendorReadinessService.evaluate(vendorId, actorUserId);
  }

  async getReadiness(
    vendorId: string,
    actorUserId: string,
  ): Promise<ReadinessSnapshot> {
    return this.vendorReadinessService.evaluate(vendorId, actorUserId);
  }

  async getSuppliers(page: number = 1, limit: number = 10): Promise<any[]> {
    const offset = (page - 1) * limit;
    return this.dataSource.query(
      `SELECT id, business_name, supplier_type, address_city, address_province, has_halal_cert
       FROM suppliers
       WHERE status = 'verified'
       ORDER BY business_name
       LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
  }

  async completeOnboarding(
    vendorId: string,
    actorUserId: string,
  ): Promise<ReadinessSnapshot> {
    return this.vendorReadinessService.evaluate(vendorId, actorUserId);
  }

  private async getOwnedTeamMember(
    vendorId: string,
    memberId: string,
  ): Promise<VendorTeamMember> {
    const member = await this.teamMemberRepo.findOne({
      where: { id: memberId, vendorId },
    });
    if (!member) throw new NotFoundException("Anggota tim tidak ditemukan");
    return member;
  }
}
