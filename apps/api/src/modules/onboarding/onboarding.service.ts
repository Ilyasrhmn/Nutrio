import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { OnboardingProgress } from './entities/onboarding-progress.entity';
import { VendorTeamMember } from './entities/vendor-team-member.entity';
import { Vendor, VendorLifecycleStatus } from '../vendors/entities/vendor.entity';
import { StateMachineService } from '../vendors/state-machine.service';
import { UsersService } from '../users/users.service';
import { Step1ProfileDto } from './dto/step1-profile.dto';
import { InviteMemberDto } from './dto/invite-member.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { ConnectSupplierDto } from './dto/connect-supplier.dto';

@Injectable()
export class OnboardingService {
  constructor(
    @InjectRepository(OnboardingProgress)
    private readonly progressRepo: Repository<OnboardingProgress>,
    @InjectRepository(VendorTeamMember)
    private readonly teamMemberRepo: Repository<VendorTeamMember>,
    @InjectRepository(Vendor)
    private readonly vendorRepo: Repository<Vendor>,
    private readonly stateMachineService: StateMachineService,
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
  ): Promise<OnboardingProgress> {
    if (dto.logoUrl) {
      await this.dataSource.query(
        `UPDATE vendors SET phone = $1, address_street = $2, address_city = $3, address_province = $4, logo_url = $5 WHERE id = $6`,
        [dto.phone, dto.addressStreet, dto.addressCity, dto.addressProvince, dto.logoUrl, vendorId],
      );
    } else {
      await this.dataSource.query(
        `UPDATE vendors SET phone = $1, address_street = $2, address_city = $3, address_province = $4 WHERE id = $5`,
        [dto.phone, dto.addressStreet, dto.addressCity, dto.addressProvince, vendorId],
      );
    }

    const progress = await this.getOrCreateProgress(vendorId);
    progress.step1Done = true;
    return this.progressRepo.save(progress);
  }

  async inviteTeamMember(
    vendorId: string,
    dto: InviteMemberDto,
  ): Promise<VendorTeamMember> {
    const member = this.teamMemberRepo.create({
      vendorId,
      role: dto.role,
      inviteEmail: dto.email,
      invitePhone: dto.phone ?? null,
      inviteSentAt: new Date(),
      status: 'pending',
    });
    return this.teamMemberRepo.save(member);
  }

  async getTeamStatus(vendorId: string): Promise<VendorTeamMember[]> {
    return this.teamMemberRepo.find({ where: { vendorId } });
  }

  async acceptInvite(
    inviteToken: string,
    dto: AcceptInviteDto,
  ): Promise<{ member: VendorTeamMember; user: { id: string; email: string } }> {
    const member = await this.teamMemberRepo.findOne({
      where: { inviteToken, status: 'pending' },
    });
    if (!member) {
      throw new NotFoundException('Undangan tidak ditemukan atau sudah tidak berlaku');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const roles = await this.dataSource.query(
      `SELECT id FROM roles WHERE name = 'vendor' LIMIT 1`,
    );
    const roleId = roles?.[0]?.id;

    const email = member.inviteEmail ?? `${inviteToken}@vendor.nutrio.id`;
    const fullName = dto.fullName ?? member.inviteEmail ?? 'Team Member';

    const newUser = await this.usersService.create({
      email,
      passwordHash,
      fullName,
      roleId,
      roleLegacy: 'vendor' as any,
    });

    member.status = 'accepted';
    member.userId = newUser.id;
    member.acceptedAt = new Date();
    await this.teamMemberRepo.save(member);

    const acceptedKepala = await this.teamMemberRepo.count({
      where: { vendorId: member.vendorId, role: 'kepala_dapur', status: 'accepted' },
    });
    if (acceptedKepala >= 1) {
      const progress = await this.getOrCreateProgress(member.vendorId);
      if (!progress.step2Done) {
        progress.step2Done = true;
        await this.progressRepo.save(progress);
      }
    }

    return { member, user: { id: newUser.id, email: newUser.email } };
  }

  async completeStep3(vendorId: string): Promise<OnboardingProgress> {
    const progress = await this.getOrCreateProgress(vendorId);
    if (!progress.step2Done) {
      throw new BadRequestException('Step 2 harus selesai terlebih dahulu');
    }
    progress.step3Done = true;
    return this.progressRepo.save(progress);
  }

  async connectSupplier(
    vendorId: string,
    dto: ConnectSupplierDto,
  ): Promise<OnboardingProgress> {
    const progress = await this.getOrCreateProgress(vendorId);
    if (!progress.step3Done) {
      throw new BadRequestException('Step 3 harus selesai terlebih dahulu');
    }

    const suppliers = await this.dataSource.query(
      `SELECT id FROM suppliers WHERE id = $1 AND status = 'verified'`,
      [dto.supplierId],
    );
    if (!suppliers || suppliers.length === 0) {
      throw new NotFoundException('Supplier tidak ditemukan atau belum terverifikasi');
    }

    progress.step4Done = true;
    return this.progressRepo.save(progress);
  }

  async getSuppliers(
    page: number = 1,
    limit: number = 10,
  ): Promise<any[]> {
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
    actorId: string,
  ): Promise<OnboardingProgress> {
    const progress = await this.getOrCreateProgress(vendorId);

    const missingSteps: string[] = [];
    if (!progress.step1Done) missingSteps.push('Step 1');
    if (!progress.step2Done) missingSteps.push('Step 2');
    if (!progress.step3Done) missingSteps.push('Step 3');
    if (!progress.step4Done) missingSteps.push('Step 4');

    if (missingSteps.length > 0) {
      throw new BadRequestException(
        `Onboarding belum selesai. Step yang belum completed: ${missingSteps.join(', ')}`,
      );
    }

    await this.stateMachineService.transition(
      vendorId,
      VendorLifecycleStatus.ACTIVE,
      actorId,
      'Onboarding selesai',
    );

    progress.step5Done = true;
    progress.completedAt = new Date();
    return this.progressRepo.save(progress);
  }
}
