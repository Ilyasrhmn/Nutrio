// @ts-nocheck
import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { UserRole } from '@workspace/common';
import { Role } from '../../access-control/roles/entities/role.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column({ name: 'password_hash' })
  passwordHash!: string;

  @Column({ name: 'role_id', type: 'uuid' })
  roleId!: string;

  @ManyToOne(() => Role, { eager: false })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  // Legacy enum field for backward compatibility during migration
  // This will be removed after full migration
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.VENDOR,
    nullable: true,
    name: 'role_legacy'
  })
  roleLegacy?: UserRole;

  @Column({ name: 'full_name' })
  fullName!: string;

  @Column({ nullable: true })
  phone!: string;

  @Column({ name: 'is_active', default: true })
  isActive!: boolean;

  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified!: boolean;

  @Column({ name: 'email_verified_at', type: 'timestamptz', nullable: true })
  emailVerifiedAt!: Date;

  @Column({ name: 'last_login_at', type: 'timestamptz', nullable: true })
  lastLoginAt!: Date;

  @Column({ name: 'last_login_ip', type: 'inet', nullable: true })
  lastLoginIp!: string;

  @Column({ name: 'oss_id', nullable: true, unique: true })
  ossId!: string;

  @Column({ name: 'dukcapil_nik', nullable: true, unique: true })
  dukcapilNik!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date;
}
