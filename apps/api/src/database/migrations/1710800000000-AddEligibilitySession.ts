import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddEligibilitySession1710800000000 implements MigrationInterface {
  name = 'AddEligibilitySession1710800000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE eligibility_sessions (
        id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        session_token UUID UNIQUE NOT NULL DEFAULT uuid_generate_v4(),
        answers       JSONB NOT NULL DEFAULT '{}',
        roadmap_result JSONB,
        vendor_id     UUID REFERENCES vendors(id) ON DELETE SET NULL,
        created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at    TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days')
      );

      CREATE INDEX idx_eligibility_sessions_token   ON eligibility_sessions(session_token);
      CREATE INDEX idx_eligibility_sessions_expires ON eligibility_sessions(expires_at);
      CREATE INDEX idx_eligibility_sessions_vendor  ON eligibility_sessions(vendor_id) WHERE vendor_id IS NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_eligibility_sessions_vendor;
      DROP INDEX IF EXISTS idx_eligibility_sessions_expires;
      DROP INDEX IF EXISTS idx_eligibility_sessions_token;
      DROP TABLE IF EXISTS eligibility_sessions;
    `);
  }
}
