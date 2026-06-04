import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVendorLogoUrl1710800000002 implements MigrationInterface {
  name = 'AddVendorLogoUrl1710800000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE vendors ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500)`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE vendors DROP COLUMN IF EXISTS logo_url`);
  }
}
