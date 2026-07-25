import { MigrationInterface, QueryRunner } from "typeorm";

export class FixInventoryLedgerSourceUnique1711300000001 implements MigrationInterface {
  name = "FixInventoryLedgerSourceUnique1711300000001";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DO $$
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'inventory_ledger_source_type_source_id_entry_type_key'
        ) THEN
          ALTER TABLE inventory_ledger
            DROP CONSTRAINT inventory_ledger_source_type_source_id_entry_type_key;
        END IF;

        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint
          WHERE conname = 'inventory_ledger_source_type_source_id_entry_type_product_id_unit_key'
        ) THEN
          ALTER TABLE inventory_ledger
            ADD CONSTRAINT inventory_ledger_source_type_source_id_entry_type_product_id_unit_key
            UNIQUE (source_type, source_id, entry_type, product_id, unit);
        END IF;
      END $$;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE inventory_ledger
        DROP CONSTRAINT inventory_ledger_source_type_source_id_entry_type_product_id_unit_key;
      ALTER TABLE inventory_ledger
        ADD CONSTRAINT inventory_ledger_source_type_source_id_entry_type_key
        UNIQUE (source_type, source_id, entry_type);
    `);
  }
}
