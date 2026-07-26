import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { VendorLifecycleStatus } from './vendor.entity';

@Entity('vendor_lifecycle_events')
export class VendorLifecycleEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId!: string;

  @Column({ name: 'from_status', type: 'enum', enum: VendorLifecycleStatus, enumName: 'vendor_lifecycle_status' })
  fromStatus!: VendorLifecycleStatus;

  @Column({ name: 'to_status', type: 'enum', enum: VendorLifecycleStatus, enumName: 'vendor_lifecycle_status' })
  toStatus!: VendorLifecycleStatus;

  @Column({ name: 'actor_user_id', type: 'uuid', nullable: true })
  actorUserId!: string | null;

  @Column({ name: 'actor_type', type: 'varchar', length: 32 })
  actorType!: string;

  @Column({ type: 'text', nullable: true })
  reason!: string | null;

  @Column({ name: 'correlation_id', type: 'uuid' })
  correlationId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
