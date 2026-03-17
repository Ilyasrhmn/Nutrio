import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Role } from './role.entity';

@Entity('menus')
export class Menu {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  path!: string;

  @Column()
  icon!: string;

  @Column({ default: 0 })
  order!: number;

  @Column({ name: 'parent_id', nullable: true })
  parentId!: string | null;

  @Column({ name: 'required_permission', type: 'varchar', nullable: true })
  requiredPermission!: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata!: Record<string, unknown> | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @ManyToOne('Menu', { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent!: Menu | null;

  @OneToMany('Menu', 'parent')
  children!: Menu[];

  @OneToMany('RoleMenu', 'menu')
  roleMenus!: RoleMenu[];
}

@Entity('role_menus')
@Unique('unique_role_menu', ['roleId', 'menuId'])
export class RoleMenu {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'role_id' })
  roleId!: string;

  @Column({ name: 'menu_id' })
  menuId!: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @ManyToOne(() => Role, (role) => role.roleMenus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'role_id' })
  role!: Role;

  @ManyToOne('Menu', { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menu!: Menu;
}
