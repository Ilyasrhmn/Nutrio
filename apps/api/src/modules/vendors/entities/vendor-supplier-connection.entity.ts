import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('vendor_supplier_connections')
export class VendorSupplierConnection {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'vendor_id', type: 'uuid' })
  vendorId!: string;

  @Column({ name: 'supplier_id', type: 'uuid' })
  supplierId!: string;

  @Column({ name: 'connected_by', type: 'uuid', nullable: true })
  connectedBy!: string | null;

  @CreateDateColumn({ name: 'connected_at', type: 'timestamptz' })
  connectedAt!: Date;
}
