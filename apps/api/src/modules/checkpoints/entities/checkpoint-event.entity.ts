import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

export type CpType = 'CP1' | 'CP2' | 'CP3' | 'CP4';
export type CpStatus = 'pending' | 'in_progress' | 'done' | 'failed' | 'force_closed';

@Entity('checkpoint_events')
export class CheckpointEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId!: string;

  @Column({ name: 'sppg_location_id', type: 'uuid' })
  sppgLocationId!: string;

  @Column({ name: 'cp_type', type: 'enum', enum: ['CP1', 'CP2', 'CP3', 'CP4'] })
  cpType!: CpType;

  @Column({ name: 'cp_status', type: 'enum', enum: ['pending', 'in_progress', 'done', 'failed', 'force_closed'], default: 'pending' })
  cpStatus!: CpStatus;

  @Column({ type: 'jsonb', default: [] })
  photos!: Array<{ fileKey: string; fileUrl: string; fileHash: string }>;

  @Column({ name: 'ai_validation', type: 'jsonb', nullable: true })
  aiValidation!: { pass: boolean; reason: string; confidence: number } | null;

  @Column({ name: 'score_delta', type: 'int', default: 0 })
  scoreDelta!: number;

  @Column({ name: 'started_at', type: 'timestamptz', nullable: true })
  startedAt!: Date | null;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;
}
