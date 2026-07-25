import { MigrationInterface, QueryRunner } from "typeorm";

export class DeliveryTokenOperationDayUnique1711300000002 implements MigrationInterface {
  name = "DeliveryTokenOperationDayUnique1711300000002";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE delivery_tokens
        ADD CONSTRAINT delivery_tokens_operation_day_id_school_id_key
        UNIQUE (operation_day_id, school_id);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE delivery_tokens DROP CONSTRAINT IF EXISTS delivery_tokens_operation_day_id_school_id_key;`,
    );
  }
}
