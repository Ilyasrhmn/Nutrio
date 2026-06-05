import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { PersonalRoadmap } from '@workspace/common';

@Entity('eligibility_sessions')
export class EligibilitySession {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({
    name: 'session_token',
    type: 'uuid',
    unique: true,
    default: () => 'uuid_generate_v4()',
  })
  sessionToken!: string;

  @Column({ type: 'jsonb', default: {} })
  answers!: Record<string, string>;

  @Column({ name: 'roadmap_result', type: 'jsonb', nullable: true })
  roadmapResult!: PersonalRoadmap | null;

  @Column({ name: 'vendor_id', type: 'uuid', nullable: true })
  vendorId!: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;
}
