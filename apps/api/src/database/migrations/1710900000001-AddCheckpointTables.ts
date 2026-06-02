import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCheckpointTables1710900000001 implements MigrationInterface {
  name = 'AddCheckpointTables1710900000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE cp_type AS ENUM ('CP1', 'CP2', 'CP3', 'CP4');
      CREATE TYPE cp_status AS ENUM ('pending', 'in_progress', 'done', 'failed', 'force_closed');

      CREATE TABLE checkpoint_events (
        id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id         UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        sppg_location_id  UUID NOT NULL REFERENCES sppg_locations(id) ON DELETE CASCADE,
        cp_type           cp_type NOT NULL,
        cp_status         cp_status NOT NULL DEFAULT 'pending',
        photos            JSONB NOT NULL DEFAULT '[]',
        ai_validation     JSONB,
        score_delta       INTEGER NOT NULL DEFAULT 0,
        started_at        TIMESTAMPTZ,
        completed_at      TIMESTAMPTZ,
        gps               GEOGRAPHY(POINT, 4326),
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE UNIQUE INDEX idx_cp_unique_per_day
        ON checkpoint_events(vendor_id, sppg_location_id, cp_type, (created_at::date));

      CREATE TABLE delivery_tokens (
        id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        token             UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
        vendor_id         UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        sppg_location_id  UUID NOT NULL REFERENCES sppg_locations(id) ON DELETE CASCADE,
        school_id         TEXT NOT NULL,
        porsi_count       INTEGER NOT NULL DEFAULT 0,
        generated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expired_at        TIMESTAMPTZ NOT NULL,
        used_at           TIMESTAMPTZ,
        status            VARCHAR(30) NOT NULL DEFAULT 'active'
      );

      CREATE TABLE school_confirmations (
        id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        delivery_token_id   UUID UNIQUE NOT NULL REFERENCES delivery_tokens(id) ON DELETE CASCADE,
        jumlah_diterima     INTEGER NOT NULL,
        kondisi             VARCHAR(20) NOT NULL,
        masalah_jenis       TEXT[] NOT NULL DEFAULT '{}',
        catatan             TEXT,
        confirmed_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_cp_events_vendor_date ON checkpoint_events(vendor_id, (created_at::date) DESC);
      CREATE INDEX idx_delivery_tokens_token ON delivery_tokens(token);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE IF EXISTS school_confirmations;
      DROP TABLE IF EXISTS delivery_tokens;
      DROP TABLE IF EXISTS checkpoint_events;
      DROP TYPE IF EXISTS cp_status;
      DROP TYPE IF EXISTS cp_type;
    `);
  }
}
