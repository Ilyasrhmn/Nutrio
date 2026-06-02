import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('daily_score_records')
export class DailyScoreRecord {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId!: string;

  @Column({ name: 'score_date', type: 'date' })
  scoreDate!: string;

  @Column({ name: 'score_current', type: 'int', default: 100 })
  scoreCurrent!: number;

  @Column({ name: 'score_final', type: 'int', nullable: true })
  scoreFinal!: number | null;

  @CreateDateColumn({ name: 'started_at', type: 'timestamptz' })
  startedAt!: Date;

  @Column({ name: 'finalized_at', type: 'timestamptz', nullable: true })
  finalizedAt!: Date | null;
}
