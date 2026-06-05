import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('onboarding_progress')
export class OnboardingProgress {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_id', type: 'uuid', unique: true })
  vendorId!: string;

  @Column({ name: 'step1_done', default: false })
  step1Done!: boolean;

  @Column({ name: 'step2_done', default: false })
  step2Done!: boolean;

  @Column({ name: 'step3_done', default: false })
  step3Done!: boolean;

  @Column({ name: 'step4_done', default: false })
  step4Done!: boolean;

  @Column({ name: 'step5_done', default: false })
  step5Done!: boolean;

  @Column({ name: 'completed_at', type: 'timestamptz', nullable: true })
  completedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;
}
