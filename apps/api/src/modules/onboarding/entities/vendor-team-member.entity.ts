import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('vendor_team_members')
export class VendorTeamMember {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId!: string;

  @Column({ name: 'user_id', type: 'uuid', nullable: true })
  userId!: string | null;

  @Column({ type: 'varchar', length: 50 })
  role!: string;

  @Column({ name: 'invite_token', type: 'uuid', nullable: true })
  inviteToken!: string | null;

  @Column({ name: 'invite_phone', type: 'varchar', length: 20, nullable: true })
  invitePhone!: string | null;

  @Column({ name: 'invite_email', type: 'varchar', length: 255, nullable: true })
  inviteEmail!: string | null;

  @Column({ name: 'invite_sent_at', type: 'timestamptz', nullable: true })
  inviteSentAt!: Date | null;

  @Column({ name: 'accepted_at', type: 'timestamptz', nullable: true })
  acceptedAt!: Date | null;

  @Column({ type: 'varchar', length: 20, default: 'pending' })
  status!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
