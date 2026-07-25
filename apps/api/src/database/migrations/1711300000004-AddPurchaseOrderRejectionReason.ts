import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPurchaseOrderRejectionReason1711300000004 implements MigrationInterface {
  name = "AddPurchaseOrderRejectionReason1711300000004";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE purchase_orders
        ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE purchase_orders DROP COLUMN IF EXISTS rejection_reason;`,
    );
  }
}
