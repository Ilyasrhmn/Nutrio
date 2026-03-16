import { MigrationInterface, QueryRunner, TableColumn, TableForeignKey } from 'typeorm';

/**
 * Migration: Convert User.role from enum to foreign key relation
 * 
 * This migration:
 * 1. Adds role_id column (uuid, nullable)
 * 2. Populates role_id from existing role enum values
 * 3. Renames old role column to role_legacy for backup
 * 4. Makes role_id NOT NULL after data migration
 * 5. Adds foreign key constraint to roles table
 */
export class MigrateUserRoleToRelation1710600000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Starting user role migration...');

    // Step 1: Add role_id column (nullable initially)
    await queryRunner.addColumn(
      'users',
      new TableColumn({
        name: 'role_id',
        type: 'uuid',
        isNullable: true,
      }),
    );
    console.log('✅ Added role_id column');

    // Step 2: Populate role_id from roles table based on existing role enum
    const roleMappings = [
      { enumValue: 'vendor', roleName: 'vendor' },
      { enumValue: 'inspector', roleName: 'inspector' },
      { enumValue: 'admin_bgn', roleName: 'admin_bgn' },
      { enumValue: 'coordinator_sppg', roleName: 'coordinator_sppg' },
      { enumValue: 'dinkes', roleName: 'dinkes' },
      { enumValue: 'public', roleName: 'public' },
    ];

    for (const mapping of roleMappings) {
      await queryRunner.query(
        `
        UPDATE users 
        SET role_id = (SELECT id FROM roles WHERE name = $1)
        WHERE role = $2
        `,
        [mapping.roleName, mapping.enumValue],
      );
    }
    console.log('✅ Populated role_id from existing role values');

    // Step 3: Rename old role column to role_legacy for backup using raw SQL
    await queryRunner.query('ALTER TABLE "users" RENAME COLUMN "role" TO "role_legacy"');
    console.log('✅ Renamed role to role_legacy');

    // Step 4: Make role_id NOT NULL
    await queryRunner.changeColumn(
      'users',
      'role_id',
      new TableColumn({
        name: 'role_id',
        type: 'uuid',
        isNullable: false,
      }),
    );
    console.log('✅ Made role_id NOT NULL');

    // Step 5: Add foreign key constraint
    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        name: 'fk_users_role',
        columnNames: ['role_id'],
        referencedTableName: 'roles',
        referencedColumnNames: ['id'],
        onDelete: 'RESTRICT',
        onUpdate: 'CASCADE',
      }),
    );
    console.log('✅ Added foreign key constraint');

    console.log('🎉 User role migration completed!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    console.log('🔄 Reverting user role migration...');

    // Step 1: Drop foreign key
    const table = await queryRunner.getTable('users');
    const foreignKey = table?.foreignKeys.find((fk) => fk.name === 'fk_users_role');
    if (foreignKey) {
      await queryRunner.dropForeignKey('users', foreignKey);
    }
    console.log('✅ Dropped foreign key');

    // Step 2: Rename role_legacy back to role using raw SQL
    await queryRunner.query('ALTER TABLE "users" RENAME COLUMN "role_legacy" TO "role"');
    console.log('✅ Renamed role_legacy back to role');

    // Step 3: Drop role_id column
    await queryRunner.dropColumn('users', 'role_id');
    console.log('✅ Dropped role_id column');

    console.log('🎉 User role migration reverted!');
  }
}
