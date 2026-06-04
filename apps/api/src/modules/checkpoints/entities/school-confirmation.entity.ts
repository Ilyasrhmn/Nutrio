import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('school_confirmations')
export class SchoolConfirmation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'delivery_token_id', type: 'uuid', unique: true })
  deliveryTokenId!: string;

  @Column({ name: 'jumlah_diterima', type: 'int' })
  jumlahDiterima!: number;

  @Column({ type: 'varchar', length: 20 })
  kondisi!: string;

  @Column({ name: 'masalah_jenis', type: 'text', array: true, default: [] })
  masalahJenis!: string[];

  @Column({ type: 'text', nullable: true })
  catatan!: string | null;

  @CreateDateColumn({ name: 'confirmed_at', type: 'timestamptz' })
  confirmedAt!: Date;
}
