import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('delivery_tokens')
export class DeliveryToken {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'uuid', unique: true, default: () => 'uuid_generate_v4()' })
  token!: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId!: string;

  @Column({ name: 'sppg_location_id', type: 'uuid' })
  sppgLocationId!: string;

  @Column({ name: 'school_id', type: 'text' })
  schoolId!: string;

  @Column({ name: 'porsi_count', type: 'int', default: 0 })
  porsiCount!: number;

  @CreateDateColumn({ name: 'generated_at', type: 'timestamptz' })
  generatedAt!: Date;

  @Column({ name: 'expired_at', type: 'timestamptz' })
  expiredAt!: Date;

  @Column({ name: 'used_at', type: 'timestamptz', nullable: true })
  usedAt!: Date | null;

  @Column({ type: 'varchar', length: 30, default: 'active' })
  status!: string;
}
