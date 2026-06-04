import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddVendorLifecycleStatus1710700000000 implements MigrationInterface {
    name = 'AddVendorLifecycleStatus1710700000000';

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TYPE vendor_lifecycle_status AS ENUM (
                'ANONYMOUS',
                'ELIGIBILITY_CHECKED',
                'REGISTERED',
                'PREPARING_DOCS',
                'DOCS_SUBMITTED',
                'INSPECTION_SCHEDULED',
                'INSPECTION_COMPLETED',
                'UNDER_REVIEW',
                'REVISION_REQUESTED',
                'APPROVED',
                'ONBOARDING',
                'ACTIVE',
                'SUSPENDED',
                'REVOKED'
            )
        `);

        await queryRunner.query(`
            ALTER TABLE vendors
            ADD COLUMN lifecycle_status vendor_lifecycle_status NOT NULL DEFAULT 'REGISTERED'
        `);

        await queryRunner.query(`
            CREATE INDEX idx_vendors_lifecycle ON vendors(lifecycle_status)
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS idx_vendors_lifecycle`);
        await queryRunner.query(`ALTER TABLE vendors DROP COLUMN IF EXISTS lifecycle_status`);
        await queryRunner.query(`DROP TYPE IF EXISTS vendor_lifecycle_status`);
    }
}
