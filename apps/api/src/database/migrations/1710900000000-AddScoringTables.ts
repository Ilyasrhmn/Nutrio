import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddScoringTables1710900000000 implements MigrationInterface {
  name = 'AddScoringTables1710900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE daily_score_records (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        score_date      DATE NOT NULL,
        score_current   INTEGER NOT NULL DEFAULT 100,
        score_final     INTEGER,
        started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        finalized_at    TIMESTAMPTZ,
        UNIQUE(vendor_id, score_date)
      );

      CREATE TABLE score_events (
        id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        daily_score_record_id UUID NOT NULL REFERENCES daily_score_records(id) ON DELETE CASCADE,
        event_type            VARCHAR(50) NOT NULL,
        score_delta           INTEGER NOT NULL,
        reason                TEXT NOT NULL,
        regulation_ref        VARCHAR(100),
        occurred_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE RULE no_update_score_events AS ON UPDATE TO score_events DO INSTEAD NOTHING;
      CREATE RULE no_delete_score_events AS ON DELETE TO score_events DO INSTEAD NOTHING;

      CREATE INDEX idx_score_records_vendor_date ON daily_score_records(vendor_id, score_date DESC);
      CREATE INDEX idx_score_events_record ON score_events(daily_score_record_id, occurred_at DESC);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP RULE IF EXISTS no_delete_score_events ON score_events;
      DROP RULE IF EXISTS no_update_score_events ON score_events;
      DROP TABLE IF EXISTS score_events;
      DROP TABLE IF EXISTS daily_score_records;
    `);
  }
}
