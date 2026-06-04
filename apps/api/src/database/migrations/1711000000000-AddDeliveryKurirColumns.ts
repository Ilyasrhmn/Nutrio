import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddDeliveryKurirColumns1711000000000 implements MigrationInterface {
  name = 'AddDeliveryKurirColumns1711000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE delivery_tokens
        ADD COLUMN IF NOT EXISTS arrived_at      TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS gps             GEOGRAPHY(POINT, 4326),
        ADD COLUMN IF NOT EXISTS arrival_photo   TEXT,
        ADD COLUMN IF NOT EXISTS completed_at    TIMESTAMPTZ;

      ALTER TABLE school_confirmations
        ADD COLUMN IF NOT EXISTS school_user_id  TEXT;

      CREATE TABLE IF NOT EXISTS daily_debriefs (
        id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id         UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        score_date        DATE NOT NULL,
        score_final       INTEGER NOT NULL DEFAULT 0,
        narrative_good    TEXT,
        narrative_improve TEXT,
        recommendations   JSONB NOT NULL DEFAULT '[]',
        fund_estimate     DECIMAL(14,2) NOT NULL DEFAULT 0,
        audit_hash        VARCHAR(64),
        generated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        UNIQUE (vendor_id, score_date)
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS daily_debriefs;
      ALTER TABLE school_confirmations DROP COLUMN IF EXISTS school_user_id;
      ALTER TABLE delivery_tokens
        DROP COLUMN IF EXISTS completed_at,
        DROP COLUMN IF EXISTS arrival_photo,
        DROP COLUMN IF EXISTS gps,
        DROP COLUMN IF EXISTS arrived_at;
    `);
  }
}
