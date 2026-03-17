import { DataSource } from 'typeorm';

interface SeedRole {
  name: string;
  description: string;
}

export default class RoleEnumMappingSeed {
  async run(dataSource: DataSource): Promise<void> {
    const queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();

    try {
      console.log('🌱 Starting role enum mapping seeding...');
      console.log('This ensures UserRole enum values have corresponding role records');

      // These role names match the UserRole enum values in @workspace/common
      // Database already has lowercase snake_case roles, but we need uppercase enum values too
      const roles: SeedRole[] = [
        {
          name: 'admin_bgn',
          description: 'Administrator BGN - Superuser dengan akses penuh ke semua fitur',
        },
        {
          name: 'vendor',
          description: 'Vendor SPPG - Mitra penyedia dengan akses terbatas',
        },
        {
          name: 'inspector',
          description: 'Inspector/Pengawas - Mengawasi dan mengaudit operasional',
        },
        {
          name: 'coordinator_sppg',
          description: 'Koordinator SPPG - Mengkoordinasikan operasional SPPG',
        },
        {
          name: 'dinkes',
          description: 'Dinas Kesehatan - Pengawas dan pembuat kebijakan',
        },
        {
          name: 'public',
          description: 'Publik - Akses dasar untuk masyarakat umum',
        },
        {
          name: 'supplier',
          description: 'Supplier Bahan Baku - Mengelola etalase, produk, dan berkomunikasi dengan vendor',
        },
      ];

      let created = 0;
      let skipped = 0;

      for (const roleData of roles) {
        // Check if role already exists
        const existingRole = await queryRunner.manager.findOne('roles', {
          where: { name: roleData.name },
        });

        if (existingRole) {
          console.log(`✓ Role already exists: ${roleData.name}`);
          skipped++;
          continue;
        }

        // Insert role
        await queryRunner.manager.save('roles', {
          name: roleData.name,
          description: roleData.description,
        });

        console.log(`✅ Created role: ${roleData.name}`);
        created++;
      }

      console.log(`\n🎉 Role enum mapping completed!`);
      console.log(`   Created: ${created}`);
      console.log(`   Already existed: ${skipped}`);
      console.log(`   Total roles: ${roles.length}`);
      
      // Verify mapping
      console.log('\n📋 Verifying role-user mapping...');
      const mappingQuery = `
        SELECT 
          u.role_legacy as user_role_enum,
          r.id as role_id,
          r.name as role_name,
          COUNT(*) as user_count
        FROM users u
        LEFT JOIN roles r ON r.id = u.role_id
        GROUP BY u.role_legacy, r.id, r.name
        ORDER BY r.name;
      `;
      
      const mapping = await queryRunner.manager.query(mappingQuery);
      console.table(mapping);
      
      const unmapped = mapping.filter((m: any) => !m.role_id);
      if (unmapped.length > 0) {
        console.warn('\n⚠️  WARNING: Some user roles are not mapped to role records:');
        console.table(unmapped);
      } else {
        console.log('\n✅ All user roles are properly mapped to role records!');
      }
      
    } finally {
      await queryRunner.release();
    }
  }
}
