import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('score_events')
export class ScoreEvent {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'daily_score_record_id', type: 'uuid' })
  dailyScoreRecordId!: string;

  @Column({ name: 'event_type', type: 'varchar', length: 50 })
  eventType!: string;

  @Column({ name: 'score_delta', type: 'int' })
  scoreDelta!: number;

  @Column({ type: 'text' })
  reason!: string;

  @Column({ name: 'regulation_ref', type: 'varchar', length: 100, nullable: true })
  regulationRef!: string | null;

  @CreateDateColumn({ name: 'occurred_at', type: 'timestamptz' })
  occurredAt!: Date;
}
