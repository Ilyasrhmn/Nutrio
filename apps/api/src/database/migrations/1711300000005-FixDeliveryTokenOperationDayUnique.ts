import { MigrationInterface, QueryRunner } from "typeorm";

export class FixDeliveryTokenOperationDayUnique1711300000005 implements MigrationInterface {
  name = "FixDeliveryTokenOperationDayUnique1711300000005";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP INDEX IF EXISTS idx_delivery_tokens_operation_day_school;
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'delivery_tokens_operation_day_id_school_id_key'
        ) THEN
          ALTER TABLE delivery_tokens
            ADD CONSTRAINT delivery_tokens_operation_day_id_school_id_key
            UNIQUE (operation_day_id, school_id);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE delivery_tokens
        DROP CONSTRAINT IF EXISTS delivery_tokens_operation_day_id_school_id_key;
      CREATE UNIQUE INDEX IF NOT EXISTS idx_delivery_tokens_operation_day_school
        ON delivery_tokens (operation_day_id, school_id)
        WHERE operation_day_id IS NOT NULL;
    `);
  }
}
