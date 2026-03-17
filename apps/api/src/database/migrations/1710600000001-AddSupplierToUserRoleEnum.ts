import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSupplierToUserRoleEnum1710600000001 implements MigrationInterface {
    name = 'AddSupplierToUserRoleEnum1710600000001';

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add 'supplier' to user_role ENUM type
        // PostgreSQL doesn't support IF NOT EXISTS for ADD VALUE directly until v17,
        // so we use a DO block to check manually.
        await queryRunner.query(`
            DO $$
            BEGIN
                IF NOT EXISTS (SELECT 1 FROM pg_type t 
                               JOIN pg_enum e ON t.oid = e.enumtypid 
                               WHERE t.typname = 'user_role' AND e.enumlabel = 'supplier') THEN
                    ALTER TYPE user_role ADD VALUE 'supplier';
                END IF;
            END
            $$;
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // PostgreSQL doesn't support removing values from an ENUM type easily.
        // Usually, you'd have to drop the type and recreate it, which is risky.
        // Since adding a value is harmless, we often leave it in down() or 
        // implement a complex recreate logic if strictly necessary.
        console.warn('PostgreSQL does not support removing values from an ENUM type easily. The "supplier" value will remain.');
    }
}
