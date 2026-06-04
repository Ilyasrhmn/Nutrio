import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOnboardingTables1710800000001 implements MigrationInterface {
  name = 'AddOnboardingTables1710800000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE team_member_role AS ENUM ('kepala_dapur', 'staf_masak', 'admin');
      CREATE TYPE invite_status    AS ENUM ('pending', 'accepted', 'expired');

      CREATE TABLE onboarding_progress (
        id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id    UUID NOT NULL UNIQUE REFERENCES vendors(id) ON DELETE CASCADE,
        step1_done   BOOLEAN NOT NULL DEFAULT FALSE,
        step2_done   BOOLEAN NOT NULL DEFAULT FALSE,
        step3_done   BOOLEAN NOT NULL DEFAULT FALSE,
        step4_done   BOOLEAN NOT NULL DEFAULT FALSE,
        step5_done   BOOLEAN NOT NULL DEFAULT FALSE,
        completed_at TIMESTAMPTZ,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE vendor_team_members (
        id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        vendor_id       UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        user_id         UUID REFERENCES users(id) ON DELETE SET NULL,
        role            team_member_role NOT NULL,
        invite_token    UUID UNIQUE DEFAULT uuid_generate_v4(),
        invite_phone    VARCHAR(20),
        invite_email    VARCHAR(255),
        invite_sent_at  TIMESTAMPTZ,
        accepted_at     TIMESTAMPTZ,
        status          invite_status NOT NULL DEFAULT 'pending',
        created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX idx_onboarding_vendor    ON onboarding_progress(vendor_id);
      CREATE INDEX idx_team_members_vendor  ON vendor_team_members(vendor_id);
      CREATE INDEX idx_team_members_token   ON vendor_team_members(invite_token);
      CREATE INDEX idx_team_members_status  ON vendor_team_members(vendor_id, status);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_team_members_status;
      DROP INDEX IF EXISTS idx_team_members_token;
      DROP INDEX IF EXISTS idx_team_members_vendor;
      DROP INDEX IF EXISTS idx_onboarding_vendor;
      DROP TABLE IF EXISTS vendor_team_members;
      DROP TABLE IF EXISTS onboarding_progress;
      DROP TYPE IF EXISTS invite_status;
      DROP TYPE IF EXISTS team_member_role;
    `);
  }
}
