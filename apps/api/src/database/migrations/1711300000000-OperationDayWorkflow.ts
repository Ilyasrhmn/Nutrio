import { MigrationInterface, QueryRunner } from 'typeorm';

export class OperationDayWorkflow1711300000000
  implements MigrationInterface
{
  name = 'OperationDayWorkflow1711300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE operation_day_status AS ENUM (
        'planned', 'in_progress', 'dispatched', 'school_confirmed', 'closed'
      );

      CREATE TYPE inventory_entry_type AS ENUM (
        'goods_receipt', 'consumption', 'waste', 'stock_opname_adjustment'
      );

      CREATE TABLE menu_plans (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        operation_date DATE NOT NULL,
        target_pax INTEGER NOT NULL CHECK (target_pax > 0),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (vendor_id, operation_date)
      );

      CREATE TABLE menu_plan_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        menu_plan_id UUID NOT NULL REFERENCES menu_plans(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE RESTRICT,
        unit VARCHAR(32) NOT NULL,
        quantity_per_pax NUMERIC(14, 3) NOT NULL CHECK (quantity_per_pax > 0),
        UNIQUE (menu_plan_id, product_id, unit)
      );

      CREATE TABLE operation_days (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        menu_plan_id UUID NULL REFERENCES menu_plans(id) ON DELETE SET NULL,
        operation_date DATE NOT NULL,
        status operation_day_status NOT NULL DEFAULT 'planned',
        closed_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (vendor_id, operation_date)
      );

      CREATE TABLE inventory_ledger (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        product_id UUID NOT NULL REFERENCES supplier_products(id) ON DELETE RESTRICT,
        unit VARCHAR(32) NOT NULL,
        quantity_delta NUMERIC(14, 3) NOT NULL CHECK (quantity_delta <> 0),
        entry_type inventory_entry_type NOT NULL,
        source_type VARCHAR(64) NOT NULL,
        source_id UUID NOT NULL,
        actor_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (source_type, source_id, entry_type)
      );

      CREATE TABLE incidents (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        operation_day_id UUID NULL REFERENCES operation_days(id) ON DELETE SET NULL,
        source_type VARCHAR(64) NOT NULL,
        source_id UUID NULL,
        status VARCHAR(32) NOT NULL DEFAULT 'open'
          CHECK (status IN ('open', 'acknowledged', 'resolved')),
        severity VARCHAR(32) NOT NULL,
        reason TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        acknowledged_at TIMESTAMPTZ NULL,
        resolved_at TIMESTAMPTZ NULL
      );

      CREATE TABLE audit_events (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        actor_user_id UUID NULL REFERENCES users(id) ON DELETE SET NULL,
        aggregate_type VARCHAR(64) NOT NULL,
        aggregate_id UUID NOT NULL,
        action VARCHAR(128) NOT NULL,
        before_payload JSONB NULL,
        after_payload JSONB NULL,
        correlation_id UUID NOT NULL DEFAULT uuid_generate_v4(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE workflow_outbox (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        event_name VARCHAR(128) NOT NULL,
        aggregate_type VARCHAR(64) NOT NULL,
        aggregate_id UUID NOT NULL,
        correlation_id UUID NOT NULL,
        payload JSONB NOT NULL,
        published_at TIMESTAMPTZ NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE idempotency_records (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        actor_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        idempotency_key VARCHAR(255) NOT NULL,
        request_hash CHAR(64) NOT NULL,
        status_code INTEGER NULL,
        response_body JSONB NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        completed_at TIMESTAMPTZ NULL,
        UNIQUE (actor_user_id, idempotency_key)
      );

      CREATE TABLE fund_projections (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        operation_day_id UUID NOT NULL REFERENCES operation_days(id) ON DELETE CASCADE,
        vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        amount NUMERIC(18, 2) NOT NULL CHECK (amount >= 0),
        status VARCHAR(32) NOT NULL DEFAULT 'projected'
          CHECK (status = 'projected'),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (operation_day_id)
      );

      ALTER TABLE checkpoint_events
        ADD COLUMN operation_day_id UUID NULL REFERENCES operation_days(id) ON DELETE SET NULL;

      ALTER TABLE delivery_tokens
        ADD COLUMN operation_day_id UUID NULL REFERENCES operation_days(id) ON DELETE SET NULL;

      CREATE INDEX idx_inventory_ledger_vendor_product
        ON inventory_ledger(vendor_id, product_id, unit);
      CREATE INDEX idx_operation_days_vendor_date
        ON operation_days(vendor_id, operation_date DESC);
      CREATE INDEX idx_incidents_vendor_status
        ON incidents(vendor_id, status, created_at DESC);
      CREATE INDEX idx_audit_events_aggregate
        ON audit_events(aggregate_type, aggregate_id, created_at DESC);
      CREATE INDEX idx_workflow_outbox_unpublished
        ON workflow_outbox(created_at) WHERE published_at IS NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_workflow_outbox_unpublished;
      DROP INDEX IF EXISTS idx_audit_events_aggregate;
      DROP INDEX IF EXISTS idx_incidents_vendor_status;
      DROP INDEX IF EXISTS idx_operation_days_vendor_date;
      DROP INDEX IF EXISTS idx_inventory_ledger_vendor_product;

      ALTER TABLE delivery_tokens DROP COLUMN IF EXISTS operation_day_id;
      ALTER TABLE checkpoint_events DROP COLUMN IF EXISTS operation_day_id;

      DROP TABLE IF EXISTS fund_projections;
      DROP TABLE IF EXISTS idempotency_records;
      DROP TABLE IF EXISTS workflow_outbox;
      DROP TABLE IF EXISTS audit_events;
      DROP TABLE IF EXISTS incidents;
      DROP TABLE IF EXISTS inventory_ledger;
      DROP TABLE IF EXISTS operation_days;
      DROP TABLE IF EXISTS menu_plan_items;
      DROP TABLE IF EXISTS menu_plans;

      DROP TYPE IF EXISTS inventory_entry_type;
      DROP TYPE IF EXISTS operation_day_status;
    `);
  }
}
