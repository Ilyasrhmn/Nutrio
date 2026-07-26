import { MigrationInterface, QueryRunner } from 'typeorm';

export class VendorReadiness1711300000006 implements MigrationInterface {
  name = 'VendorReadiness1711300000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE vendor_supplier_connections (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
        connected_by UUID REFERENCES users(id),
        connected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (vendor_id, supplier_id)
      );

      CREATE TABLE vendor_lifecycle_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        from_status vendor_lifecycle_status NOT NULL,
        to_status vendor_lifecycle_status NOT NULL,
        actor_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
        actor_type VARCHAR(32) NOT NULL,
        reason TEXT,
        correlation_id UUID NOT NULL DEFAULT uuid_generate_v4(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_vendor_lifecycle_events_vendor_created
        ON vendor_lifecycle_events(vendor_id, created_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_vendor_lifecycle_events_vendor_created;
      DROP TABLE IF EXISTS vendor_lifecycle_events;
      DROP TABLE IF EXISTS vendor_supplier_connections;
    `);
  }
}
