import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSppgTargetPorsi1711300000003 implements MigrationInterface {
  name = "AddSppgTargetPorsi1711300000003";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE sppg_locations
        ADD COLUMN IF NOT EXISTS target_porsi INTEGER NOT NULL DEFAULT 100
        CHECK (target_porsi > 0);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE sppg_locations DROP COLUMN IF EXISTS target_porsi;`,
    );
  }
}
