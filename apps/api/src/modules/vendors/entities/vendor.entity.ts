import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum VendorStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  SUSPENDED = 'suspended',
  PROBATION = 'probation',
}

export enum VendorLifecycleStatus {
  ANONYMOUS = 'ANONYMOUS',
  ELIGIBILITY_CHECKED = 'ELIGIBILITY_CHECKED',
  REGISTERED = 'REGISTERED',
  PREPARING_DOCS = 'PREPARING_DOCS',
  DOCS_SUBMITTED = 'DOCS_SUBMITTED',
  INSPECTION_SCHEDULED = 'INSPECTION_SCHEDULED',
  INSPECTION_COMPLETED = 'INSPECTION_COMPLETED',
  UNDER_REVIEW = 'UNDER_REVIEW',
  REVISION_REQUESTED = 'REVISION_REQUESTED',
  APPROVED = 'APPROVED',
  ONBOARDING = 'ONBOARDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  REVOKED = 'REVOKED',
}

@Entity('vendors')
export class Vendor {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { eager: false })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ name: 'business_name' })
  businessName!: string;

  @Column({ name: 'owner_name' })
  ownerName!: string;

  @Column({ nullable: true, unique: true })
  nib?: string;

  @Column({ nullable: true, unique: true })
  npwp?: string;

  @Column()
  phone!: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ name: 'address_street', type: 'text' })
  addressStreet!: string;

  @Column({ name: 'address_city', length: 100 })
  addressCity!: string;

  @Column({ name: 'address_province', length: 100 })
  addressProvince!: string;

  @Column({ name: 'address_district', length: 100, nullable: true })
  addressDistrict?: string;

  @Column({ name: 'address_postal', length: 10, nullable: true })
  addressPostal?: string;

  @Column({
    type: 'enum',
    enum: VendorStatus,
    default: VendorStatus.DRAFT,
  })
  status!: VendorStatus;

  @Column({ name: 'status_reason', type: 'text', nullable: true })
  statusReason?: string;

  @Column({
    name: 'lifecycle_status',
    type: 'enum',
    enum: VendorLifecycleStatus,
    enumName: 'vendor_lifecycle_status',
    default: VendorLifecycleStatus.REGISTERED,
  })
  lifecycleStatus!: VendorLifecycleStatus;

  @Column({ name: 'daily_capacity_pax', type: 'integer', nullable: true })
  dailyCapacityPax?: number;

  @Column({ type: 'simple-array', nullable: true })
  specialization?: string[];

  @Column({
    name: 'current_risk_score',
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
  })
  currentRiskScore!: number;

  @Column({ name: 'verified_at', type: 'timestamptz', nullable: true })
  verifiedAt?: Date;

  @Column({ name: 'verified_by', type: 'uuid', nullable: true })
  verifiedBy?: string;

  @Column({ name: 'training_status', default: 'not_started' })
  trainingStatus!: string;

  @Column({ name: 'training_completed_at', type: 'timestamptz', nullable: true })
  trainingCompletedAt?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt?: Date;
}
